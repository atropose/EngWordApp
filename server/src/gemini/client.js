import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

let client;
export const getGeminiClient = () => {
  if (!config.apiKey) throw new Error('Missing GOOGLE_API_KEY or GEMINI_API_KEY');
  if (!client) client = new GoogleGenAI({ apiKey: config.apiKey });
  return client;
};
