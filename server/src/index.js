import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { ensureRootDirs } from './storage/paths.js';
import { weeksRouter } from './routes/weeks.js';
import { apiRouter } from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await ensureRootDirs();

const app = express();
const statusMap = new Map();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(weeksRouter({ statusMap }));
app.use(apiRouter({ statusMap }));

app.get('/', (_req, res) => res.redirect('/weeks'));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send(`<pre>${err.message}</pre>`);
});

app.listen(config.port, () => {
  console.log(`Server running: http://localhost:${config.port}`);
});
