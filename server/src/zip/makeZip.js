import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { weekPaths, rootPaths } from '../storage/paths.js';

export const makeZipForWeek = async (weekId, items) => {
  const p = weekPaths(weekId);
  const manifest = {
    weekId,
    createdAt: new Date().toISOString(),
    items: items.map((i) => ({
      id: i.id,
      word: i.word,
      pos: i.pos,
      meaning: i.meaning,
      example: i.example,
      image: `images/${i.id}.webp`
    }))
  };
  await fsPromises.writeFile(p.manifest, JSON.stringify(manifest, null, 2), 'utf8');

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(p.zip);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.file(p.manifest, { name: 'manifest.json' });
    archive.directory(p.images, 'images');
    archive.finalize();
  });

  await fsPromises.copyFile(p.zip, path.join(rootPaths.downloadDir, `${weekId}.zip`));
  return { manifest, zipPath: p.zip };
};
