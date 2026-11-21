# The Daily Brief

A magazine-style news page. It pulls the latest stories from the news sources you choose and reads each article. For every story it shows the headline, a picture and a summary long enough to tell you what the story says. Click any story to open the full article on the publisher's site.

- **Front page:** a lead story and two side stories with key points. Below them is a section for each topic (World, Business, Technology…).
- **Summaries:** if an Anthropic API key is set, Claude writes each summary. A summary is two short paragraphs covering who, what, when, the numbers and what happens next, plus 3–4 key points. Without a key, the page shows the article's opening paragraphs instead.
- **Pictures:** the article's share image, or the feed's thumbnail if the article doesn't have one.

## Run it on your computer

You need Node.js 20 or newer.

```bash
cd news-magazine
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # optional, for AI summaries
npm start                              # fetches the news, then serves http://localhost:3000
```

`npm run fetch` refreshes the news; `npm run serve` just serves the page.

## Choose your sources

Everything is in [`config/sources.json`](config/sources.json).

```json
{
  "siteTitle": "The Daily Brief",
  "tagline": "News from sources you trust",
  "follow": [],
  "settings": {
    "maxArticlesPerSource": 8,
    "maxAgeHours": 48,
    "summaryModel": "claude-opus-5"
  },
  "sources": [
    { "name": "BBC News", "feed": "https://feeds.bbci.co.uk/news/world/rss.xml", "section": "World" }
  ]
}
```

Each source takes:

| Field | Meaning |
|---|---|
| `name` | Shown on each story, e.g. "BBC News". |
| `feed` | The publisher's RSS or Atom feed URL. |
| `section` | Which section of the magazine its stories go in. Any name works; new names become new tabs. |
| `follow` | *(optional)* Only keep this source's stories that mention one of these words. |
| `maxArticles` | *(optional)* Overrides `maxArticlesPerSource` for this source. |
| `enabled` | *(optional)* Set to `false` to switch a source off without deleting it. |

**Following particular companies or topics:** put names in the top-level `follow` list, e.g. `"follow": ["Apple", "Toyota", "Jollibee"]`. Only stories whose headline or teaser mentions one of them will show. Leave the list empty to show everything.

### Some feeds to start with

| Publisher | Feed |
|---|---|
| BBC News – World / Business / Tech | `https://feeds.bbci.co.uk/news/world/rss.xml` · `.../business/rss.xml` · `.../technology/rss.xml` |
| NPR | `https://feeds.npr.org/1001/rss.xml` |
| The Guardian | `https://www.theguardian.com/world/rss` (swap `world` for `business`, `technology`, `science`…) |
| Al Jazeera | `https://www.aljazeera.com/xml/rss/all.xml` |
| The New York Times | `https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml` |
| CNBC | `https://www.cnbc.com/id/10001147/device/rss/rss.html` |
| Ars Technica | `https://feeds.arstechnica.com/arstechnica/index` |
| Deutsche Welle | `https://rss.dw.com/rdf/rss-en-all` |

Most publishers link their feed from an "RSS" icon or a `/rss` page. Some sites have a paywall or block automated readers. Their stories still appear, but the summary is based on the feed's teaser text.

## Put it online on AWS (refreshed hourly)

`aws/deploy.sh` sets up the whole site in your AWS account with CloudFormation:

- a private **S3 bucket** that holds the page,
- **CloudFront** serving it over HTTPS,
- a **Lambda function** that fetches and summarises the news every hour and writes `news.json` to the bucket.

You need the [AWS CLI](https://aws.amazon.com/cli/) signed in to your account (`aws sts get-caller-identity` should show your account), plus Node.js 20+, npm and zip.

```bash
cd news-magazine
export AWS_REGION=ap-southeast-1           # any region; defaults to your CLI's region, then us-east-1
export ANTHROPIC_API_KEY=sk-ant-...        # optional, for Claude summaries
./aws/deploy.sh
```

The first run takes about 5–10 minutes, most of it waiting for CloudFront. When it finishes it prints your site's address (`https://xxxx.cloudfront.net`).

- **Changing sources:** edit `config/sources.json` and run `./aws/deploy.sh` again. Later runs keep the saved API key unless you export a new one.
- **Logs:** `aws logs tail /aws/lambda/news-magazine-refresh --follow`
- **Refresh now:** `aws lambda invoke --function-name news-magazine-refresh /dev/null`
- **Remove everything:** empty the bucket (`aws s3 rm s3://<BucketName> --recursive`), then `aws cloudformation delete-stack --stack-name news-magazine`.

The API key is stored as an environment variable on the Lambda function, so anyone with access to that function in your AWS account can see it. For a personal site, the AWS side (24 short Lambda runs a day, a small bucket and light CloudFront traffic) usually fits in AWS's free tier, or costs a dollar or two a month beyond it. The Claude summaries are billed separately; see Cost below.

## Put it online with GitHub Pages instead (refreshed hourly)

`.github/workflows/publish.yml` fetches the news every hour and publishes the page. GitHub only runs workflows at the root of a repository, so the folder needs to be the root of its own repository:

1. Create a new GitHub repository and push the contents of this `news-magazine` folder to its `main` branch.
2. In that repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Go to **Settings → Secrets and variables → Actions** and add a secret named `ANTHROPIC_API_KEY`.
4. Open the **Actions** tab, choose **Publish news**, and click **Run workflow**. Your site will be at `https://<your-username>.github.io/<repo-name>/`.

## Cost

Each article is summarised once and cached, so later refreshes don't pay again for stories that already have a summary. Summaries use `claude-opus-5` at low effort. To use a cheaper model, change `summaryModel`, for example to `claude-haiku-4-5`.
