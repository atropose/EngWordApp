import fs from 'fs/promises';
import path from 'path';
import { weekPaths, rootPaths } from './paths.js';

const POS_MAP = {
  '명사': 'n.', '동사': 'v.', '형용사': 'adj.', '부사': 'adv.', '전치사': 'prep.', '대명사': 'pron.', '접속사': 'conj.', '감탄사': 'interj.'
};
const ALLOWED_POS = new Set(['n.', 'v.', 'adj.', 'adv.', 'prep.', 'pron.', 'conj.', 'interj.']);

export const normalizePos = (value = '') => {
  const v = String(value).trim().toLowerCase();
  if (POS_MAP[value?.trim?.()]) return POS_MAP[value.trim()];
  const mapping = {
    noun: 'n.', n: 'n.', 'n.': 'n.', verb: 'v.', v: 'v.', 'v.': 'v.', adjective: 'adj.', adj: 'adj.', 'adj.': 'adj.', adverb: 'adv.', adv: 'adv.', 'adv.': 'adv.', preposition: 'prep.', prep: 'prep.', 'prep.': 'prep.', pronoun: 'pron.', pron: 'pron.', 'pron.': 'pron.', conjunction: 'conj.', conj: 'conj.', 'conj.': 'conj.', interjection: 'interj.', interj: 'interj.', 'interj.': 'interj.'
  };
  return mapping[v] || (ALLOWED_POS.has(v) ? v : 'n.');
};

export const ensureWeekDirs = async (weekId) => {
  const p = weekPaths(weekId);
  await Promise.all([p.base, p.uploads, p.extracted, p.images].map((d) => fs.mkdir(d, { recursive: true })));
  return p;
};

export const listWeeks = async () => {
  await fs.mkdir(rootPaths.weeksDir, { recursive: true });
  const entries = await fs.readdir(rootPaths.weeksDir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const id = e.name;
    const p = weekPaths(id);
    const hasZip = await fs.access(p.zip).then(() => true).catch(() => false);
    out.push({ id, hasZip });
  }
  return out.sort((a, b) => b.id.localeCompare(a.id));
};

export const saveValidated = async (weekId, rows) => {
  const normalized = rows.map((r, idx) => ({
    id: String(idx + 1).padStart(3, '0'),
    word: String(r.word || '').trim(),
    pos: normalizePos(r.pos),
    meaning: String(r.meaning || '').trim()
  })).filter((r) => r.word && r.meaning);

  await fs.writeFile(weekPaths(weekId).validated, JSON.stringify(normalized, null, 2), 'utf8');
  return normalized;
};

export const loadValidated = async (weekId) => {
  const p = weekPaths(weekId).validated;
  try {
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch {
    return [];
  }
};

export const loadMergedRows = async (weekId) => {
  try {
    const raw = await fs.readFile(weekPaths(weekId).mergedTsv, 'utf8');
    return raw.split('\n').map((l) => l.trim()).filter(Boolean).map((line, idx) => {
      const [word = '', pos = '', meaning = ''] = line.split('\t');
      return { id: String(idx + 1).padStart(3, '0'), word: word.trim(), pos: normalizePos(pos), meaning: meaning.trim() };
    });
  } catch {
    return [];
  }
};

export const writeJobStatus = async (weekId, status) => {
  await fs.writeFile(weekPaths(weekId).jobStatus, JSON.stringify(status, null, 2), 'utf8');
};

export const readJobStatus = async (weekId) => {
  try {
    return JSON.parse(await fs.readFile(weekPaths(weekId).jobStatus, 'utf8'));
  } catch {
    return null;
  }
};

export const listUploads = async (weekId) => {
  const dir = weekPaths(weekId).uploads;
  try {
    const files = await fs.readdir(dir);
    return files.sort();
  } catch {
    return [];
  }
};

export const clearImages = async (weekId) => {
  const dir = weekPaths(weekId).images;
  await fs.mkdir(dir, { recursive: true });
  const files = await fs.readdir(dir);
  await Promise.all(files.map((f) => fs.rm(path.join(dir, f), { force: true })));
};
