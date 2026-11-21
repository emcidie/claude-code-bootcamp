// AWS Lambda entry point. Runs one news refresh and publishes the result to the
// site's S3 bucket. EventBridge calls it every hour (see template.yaml).

import fs from "node:fs/promises";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { fetchNews } from "../scripts/fetch-news.mjs";

const s3 = new S3Client({});
const BUCKET = process.env.SITE_BUCKET;
const CACHE_KEY = "data/summaries.json";
const CACHE_FILE = "/tmp/summaries.json";
const OUTPUT_FILE = "/tmp/news.json";

export async function handler() {
  // Bring back earlier summaries so each article is only summarised once.
  try {
    const cached = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CACHE_KEY }));
    await fs.writeFile(CACHE_FILE, await cached.Body.transformToString());
  } catch (err) {
    if (err.name !== "NoSuchKey") throw err;
    await fs.rm(CACHE_FILE, { force: true });
  }

  const count = await fetchNews({ cacheFile: CACHE_FILE, outputFile: OUTPUT_FILE });

  await put(CACHE_KEY, CACHE_FILE, "private, no-store");
  // Short cache so readers see each hourly refresh.
  await put("news.json", OUTPUT_FILE, "public, max-age=300");
  return { stories: count };
}

async function put(key, file, cacheControl) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: await fs.readFile(file),
      ContentType: "application/json; charset=utf-8",
      CacheControl: cacheControl,
    }),
  );
}
