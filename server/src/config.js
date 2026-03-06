import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const toInt = (v, d) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export const config = {
  port: toInt(process.env.PORT, 3000),
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '',
  dataDir: path.resolve(process.env.DATA_DIR || './data'),
  downloadDir: path.resolve(process.env.DOWNLOAD_DIR || './downloads'),
  models: {
    extract: process.env.GEMINI_MODEL_EXTRACT || 'gemini-2.5-flash',
    textMeta: process.env.GEMINI_MODEL_TEXTMETA || 'gemini-2.5-flash',
    image: process.env.GEMINI_MODEL_IMAGE || 'gemini-2.5-flash-image'
  },
  throttle: {
    delayMs: toInt(process.env.THROTTLE_DELAY_MS, 6000),
    maxRetries: toInt(process.env.MAX_RETRIES, 8),
    baseBackoffMs: toInt(process.env.BASE_BACKOFF_MS, 1500),
    maxBackoffMs: toInt(process.env.MAX_BACKOFF_MS, 60000),
    jitterMs: toInt(process.env.JITTER_MS, 1200)
  }
};
