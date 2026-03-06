import { getGeminiClient } from './client.js';
import { geminiQueue } from './queue.js';
import { config } from '../config.js';
import { textMetaSchema } from './schemas.js';
import { SYSTEM_PROMPT_TEXT_META, USER_PROMPT_TEXT_META } from './prompts.js';

const responseSchema = {
  type: 'OBJECT',
  properties: {
    pos_abbrev: { type: 'STRING', enum: ['n.', 'v.', 'adj.', 'adv.', 'prep.', 'pron.', 'conj.', 'interj.'] },
    example: { type: 'STRING' },
    meaning_ko: { type: 'STRING' }
  },
  required: ['pos_abbrev', 'example', 'meaning_ko']
};

export const generateTextMeta = async (item) => geminiQueue.run(async () => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: config.models.textMeta,
    contents: `${SYSTEM_PROMPT_TEXT_META}\n\n${USER_PROMPT_TEXT_META}\n\nword:${item.word}\npos:${item.pos}\nmeaning_ko:${item.meaning}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  return textMetaSchema.parse(parsed);
});
