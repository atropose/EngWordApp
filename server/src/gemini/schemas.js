import { z } from 'zod';

export const textMetaSchema = z.object({
  pos_abbrev: z.enum(['n.', 'v.', 'adj.', 'adv.', 'prep.', 'pron.', 'conj.', 'interj.']),
  example: z.string().min(1),
  meaning_ko: z.string().min(1)
});
