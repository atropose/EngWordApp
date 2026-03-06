import fs from 'fs/promises';
import path from 'path';
import { getGeminiClient } from './client.js';
import { geminiQueue } from './queue.js';
import { config } from '../config.js';
import { SYSTEM_PROMPT_EXTRACT_TSV, USER_PROMPT_EXTRACT_TSV } from './prompts.js';

export const extractTsvFromImage = async (imagePath) => geminiQueue.run(async () => {
  const ai = getGeminiClient();
  const b64 = (await fs.readFile(imagePath)).toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';

  const response = await ai.models.generateContent({
    model: config.models.extract,
    contents: [{
      role: 'user',
      parts: [
        { text: `${SYSTEM_PROMPT_EXTRACT_TSV}\n\n${USER_PROMPT_EXTRACT_TSV}` },
        { inlineData: { mimeType: mime, data: b64 } }
      ]
    }]
  });

  return (response.text || '').trim();
});
