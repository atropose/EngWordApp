import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { ensureWeekDirs, listWeeks, listUploads, loadMergedRows, loadValidated, normalizePos, saveValidated, writeJobStatus, clearImages } from '../storage/weekStore.js';
import { weekPaths } from '../storage/paths.js';
import { extractTsvFromImage } from '../gemini/extractTsv.js';
import { generateTextMeta } from '../gemini/generateTextMeta.js';
import { generateIllustrationBuffer } from '../gemini/generateIllustration.js';
import { composeCard } from '../imaging/composeCard.js';
import { compressWebp } from '../imaging/compressWebp.js';
import { makeZipForWeek } from '../zip/makeZip.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const weeksRouter = ({ statusMap }) => {
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage() });

  const setStatus = async (weekId, patch) => {
    const next = { weekId, updatedAt: new Date().toISOString(), ...statusMap.get(weekId), ...patch };
    statusMap.set(weekId, next);
    await writeJobStatus(weekId, next);
  };

  router.get('/weeks', asyncHandler(async (_req, res) => {
    res.render('index', { weeks: await listWeeks() });
  }));

  router.get('/weeks/new', (_req, res) => {
    res.render('progress', { page: 'new-week' });
  });

  router.post('/weeks/new', asyncHandler(async (req, res) => {
    const date = req.body.date || new Date().toISOString().slice(0, 10);
    const weekId = `${date}_week`;
    await ensureWeekDirs(weekId);
    res.redirect(`/weeks/${weekId}`);
  }));

  router.get('/weeks/:weekId', asyncHandler(async (req, res) => {
    const { weekId } = req.params;
    await ensureWeekDirs(weekId);
    res.render('week', { weekId, uploads: await listUploads(weekId) });
  }));

  router.post('/weeks/:weekId/upload', upload.array('photos', 30), asyncHandler(async (req, res) => {
    const { weekId } = req.params;
    const p = await ensureWeekDirs(weekId);
    for (const f of req.files || []) {
      await fs.writeFile(path.join(p.uploads, f.originalname), f.buffer);
    }
    res.redirect(`/weeks/${weekId}`);
  }));

  router.post('/weeks/:weekId/extract', asyncHandler(async (req, res) => {
    const { weekId } = req.params;
    const p = await ensureWeekDirs(weekId);
    const uploads = await listUploads(weekId);
    let merged = '';
    await setStatus(weekId, { job: 'extract', state: 'running', current: 0, total: uploads.length });
    for (let i = 0; i < uploads.length; i += 1) {
      const file = uploads[i];
      const tsv = await extractTsvFromImage(path.join(p.uploads, file));
      await fs.writeFile(path.join(p.extracted, `${String(i + 1).padStart(3, '0')}.tsv`), `${tsv.trim()}\n`, 'utf8');
      merged += `${tsv.trim()}\n`;
      await setStatus(weekId, { current: i + 1, total: uploads.length, message: file });
    }
    await fs.writeFile(p.mergedTsv, merged, 'utf8');
    await setStatus(weekId, { state: 'done', message: 'Extraction complete' });
    res.redirect(`/weeks/${weekId}/validate`);
  }));

  router.get('/weeks/:weekId/validate', asyncHandler(async (req, res) => {
    const { weekId } = req.params;
    const existing = await loadValidated(weekId);
    const rows = existing.length ? existing : await loadMergedRows(weekId);
    res.render('validate', { weekId, rows });
  }));

  router.post('/weeks/:weekId/validate/normalize-pos', asyncHandler(async (req, res) => {
    const rows = (req.body.rows || []).map((r) => ({ ...r, pos: normalizePos(r.pos) }));
    res.json({ rows });
  }));

  router.post('/weeks/:weekId/validate/save', asyncHandler(async (req, res) => {
    const { weekId } = req.params;
    const rows = req.body.rows || [];
    const saved = await saveValidated(weekId, rows);
    res.json({ ok: true, count: saved.length });
  }));

  const runGenerate = async (weekId) => {
    const p = weekPaths(weekId);
    const rows = await loadValidated(weekId);
    if (!rows.length) throw new Error('No validated rows found');
    await clearImages(weekId);
    const manifestItems = [];
    await setStatus(weekId, { job: 'generate', state: 'running', current: 0, total: rows.length });
    for (let i = 0; i < rows.length; i += 1) {
      const item = rows[i];
      const meta = await generateTextMeta(item);
      const ill = await generateIllustrationBuffer({ word: item.word, meaning: item.meaning });
      const card = await composeCard({ illustrationBuffer: ill, word: item.word, pos: meta.pos_abbrev, example: meta.example, meaning: meta.meaning_ko });
      const webp = await compressWebp(card, 1000 * 1024);
      const id = String(i + 1).padStart(3, '0');
      await fs.writeFile(path.join(p.images, `${id}.webp`), webp);
      manifestItems.push({ ...item, id, pos: meta.pos_abbrev, meaning: meta.meaning_ko, example: meta.example });
      await setStatus(weekId, { current: i + 1, total: rows.length, message: item.word });
    }
    await fs.writeFile(p.validated, JSON.stringify(manifestItems, null, 2));
    await setStatus(weekId, { state: 'done', message: 'Image generation complete' });
  };

  router.post('/weeks/:weekId/generate', asyncHandler(async (req, res) => {
    await runGenerate(req.params.weekId);
    res.redirect(`/weeks/${req.params.weekId}`);
  }));

  router.post('/weeks/:weekId/regenerate', asyncHandler(async (req, res) => {
    await runGenerate(req.params.weekId);
    res.redirect(`/weeks/${req.params.weekId}`);
  }));

  router.post('/weeks/:weekId/buildZip', asyncHandler(async (req, res) => {
    const { weekId } = req.params;
    const items = await loadValidated(weekId);
    await makeZipForWeek(weekId, items);
    res.redirect(`/weeks/${weekId}`);
  }));

  router.get('/weeks/:weekId/download', asyncHandler(async (req, res) => {
    const p = weekPaths(req.params.weekId);
    res.download(p.zip);
  }));

  return router;
};
