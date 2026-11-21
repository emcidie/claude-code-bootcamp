#!/usr/bin/env bash
# Deploys the news magazine to your AWS account (S3 + CloudFront + an hourly
# Lambda). Safe to run again: it updates the existing stack.
#
#   export ANTHROPIC_API_KEY=sk-ant-...   # optional; omit on later runs to keep the saved key
#   ./aws/deploy.sh
#
# Needs the AWS CLI (signed in to your account), Node.js 20+, npm and zip.
# STACK_NAME and AWS_REGION can be set to override the defaults below.
set -euo pipefail

cd "$(dirname "$0")/.."
STACK="${STACK_NAME:-news-magazine}"
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-$(aws configure get region || true)}}"
REGION="${REGION:-us-east-1}"
export AWS_REGION="$REGION"

for tool in aws node npm zip; do
  command -v "$tool" >/dev/null || { echo "Please install '$tool' first." >&2; exit 1; }
done

echo "==> Deploying stack '$STACK' to $REGION (the first run takes 5-10 minutes for CloudFront)"
params=()
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  params=(--parameter-overrides "AnthropicApiKey=$ANTHROPIC_API_KEY")
fi
aws cloudformation deploy \
  --stack-name "$STACK" \
  --template-file aws/template.yaml \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset \
  ${params[@]+"${params[@]}"}

output() {
  aws cloudformation describe-stacks --stack-name "$STACK" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}
BUCKET="$(output BucketName)"
DISTRIBUTION="$(output DistributionId)"
FUNCTION="$(output FunctionName)"
SITE_URL="$(output SiteUrl)"

echo "==> Packaging the refresh function"
build="$(mktemp -d)"
trap 'rm -rf "$build"' EXIT
cp -R package.json package-lock.json scripts config aws "$build/"
(cd "$build" && npm ci --omit=dev --no-audit --no-fund --silent && zip -qr function.zip .)

aws lambda update-function-code --function-name "$FUNCTION" \
  --zip-file "fileb://$build/function.zip" --output text --query LastModified >/dev/null
aws lambda wait function-updated --function-name "$FUNCTION"

echo "==> Uploading the site"
aws s3 sync public "s3://$BUCKET" --delete \
  --exclude "news.json" --exclude "data/*" \
  --cache-control "public, max-age=300"

echo "==> Fetching today's news (this can take a few minutes)"
error="$(aws lambda invoke --function-name "$FUNCTION" --cli-read-timeout 900 \
  --query FunctionError --output text "$build/result.json")"
if [[ "$error" != "None" ]]; then
  echo "The first refresh failed: $(cat "$build/result.json")" >&2
  echo "Check the logs with: aws logs tail /aws/lambda/$FUNCTION" >&2
else
  echo "Refreshed: $(cat "$build/result.json")"
fi

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths "/*" \
  --query Invalidation.Id --output text >/dev/null

echo
echo "Done. Your news magazine: $SITE_URL"
echo "It refreshes itself every hour. Edit config/sources.json and run this script again to change sources."
