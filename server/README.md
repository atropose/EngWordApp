# EngWordApp Server

Node.js 20+ server-only app for weekly English word image card generation.

## Install

```bash
cd server
npm install
cp .env.example .env
```

Set `GOOGLE_API_KEY` (or `GEMINI_API_KEY`) in `.env`.

## Run

```bash
npm run dev
# or
npm start
```

Open: `http://localhost:3000/weeks`

## Workflow

1. Create week (`YYYY-MM-DD_week`).
2. Upload photographed word-list images.
3. Run extraction (Gemini OCR -> strict TSV).
4. Validate/Edit table and save.
5. Generate images (text meta + illustration + card composition + webp compression <= 1000KB).
6. Build ZIP (`manifest.json` + `images/*.webp`) and download.
7. Regenerate repeats image generation from `validated.json`.

## Free-tier friendly throttling/backoff

All Gemini calls run through a single queue (`concurrency=1`) and include required wait between calls (`THROTTLE_DELAY_MS`).
Retryable failures (429/RESOURCE_EXHAUSTED etc.) use exponential backoff + jitter.

Config in `.env`:

- `THROTTLE_DELAY_MS`
- `MAX_RETRIES`
- `BASE_BACKOFF_MS`
- `MAX_BACKOFF_MS`
- `JITTER_MS`

## Storage

`DATA_DIR/weeks/{weekId}` contains uploads, extracted tsv, validated list, images, manifest, zip, and job status.

`DOWNLOAD_DIR/{weekId}.zip` receives copied final zip.
