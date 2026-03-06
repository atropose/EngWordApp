import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';

export const rootPaths = {
  dataDir: config.dataDir,
  downloadDir: config.downloadDir,
  weeksDir: path.join(config.dataDir, 'weeks')
};

export const weekPaths = (weekId) => {
  const base = path.join(rootPaths.weeksDir, weekId);
  return {
    base,
    uploads: path.join(base, 'uploads'),
    extracted: path.join(base, 'extracted'),
    mergedTsv: path.join(base, 'merged.tsv'),
    validated: path.join(base, 'validated.json'),
    images: path.join(base, 'images'),
    manifest: path.join(base, 'manifest.json'),
    zip: path.join(base, `${weekId}.zip`),
    jobStatus: path.join(base, 'jobStatus.json')
  };
};

export const ensureRootDirs = async () => {
  await fs.mkdir(rootPaths.weeksDir, { recursive: true });
  await fs.mkdir(rootPaths.downloadDir, { recursive: true });
};
