import express from 'express';
import { readJobStatus } from '../storage/weekStore.js';

export const apiRouter = ({ statusMap }) => {
  const router = express.Router();

  router.get('/api/weeks/:weekId/status', async (req, res) => {
    const { weekId } = req.params;
    const mem = statusMap.get(weekId);
    const file = await readJobStatus(weekId);
    res.json(mem || file || { weekId, state: 'idle' });
  });

  return router;
};
