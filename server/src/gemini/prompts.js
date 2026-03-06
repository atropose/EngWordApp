export const SYSTEM_PROMPT_EXTRACT_TSV = `You extract English vocabulary rows from photographed worksheet pages.`;
export const USER_PROMPT_EXTRACT_TSV = `Return ONLY plain TSV lines. No markdown, no code fences, no explanations, no extra text, no blank lines.
Each line must be exactly: WORD<TAB>POS<TAB>KOREAN
Use POS abbreviations only: n., v., adj., adv., prep., pron., conj., interj.
If POS is Korean, map as:
명사->n., 동사->v., 형용사->adj., 부사->adv., 전치사->prep., 대명사->pron., 접속사->conj., 감탄사->interj.
Keep order as in image. Keep hyphen/apostrophe in words. No numbering, no synonyms, no extra columns.`;

export const SYSTEM_PROMPT_TEXT_META = `You must output strict JSON only.`;
export const USER_PROMPT_TEXT_META = `Given a vocabulary item, produce JSON with keys: pos_abbrev, example, meaning_ko.
Rules:
pos_abbrev must be one of n., v., adj., adv., prep., pron., conj., interj.
example must be child-friendly 6-12 words, simple vocabulary.
meaning_ko must keep same meaning with spell/spacing correction only.
No extra keys.`;

export const SYSTEM_PROMPT_ILLUSTRATION = `Generate a kid-safe cartoon style illustration.`;
export const USER_PROMPT_ILLUSTRATION = `Create a clean cartoon-style image that evokes the meaning of the word.
ABSOLUTELY NO TEXT, no letters, no numbers, no watermark.
Friendly, not scary, no violence. Simple background.
Reserve blank space at the bottom (about 25% height) for caption overlay.`;
