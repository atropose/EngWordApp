import sharp from 'sharp';

const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[m]));

export const composeCard = async ({ illustrationBuffer, word, pos, example, meaning }) => {
  const width = 1024;
  const imageArea = 768;
  const captionArea = 256;
  const resized = await sharp(illustrationBuffer).resize({ width, height: imageArea, fit: 'cover' }).png().toBuffer();

  const svg = `
  <svg width="${width}" height="${captionArea}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <text x="40" y="70" font-size="52" font-family="Arial, sans-serif" font-weight="700" fill="#111">${esc(word)}  ${esc(pos)}</text>
    <text x="40" y="140" font-size="34" font-family="Arial, sans-serif" fill="#333">${esc(example)}</text>
    <text x="40" y="205" font-size="34" font-family="Arial, sans-serif" fill="#333">${esc(meaning)}</text>
  </svg>`;

  return sharp({ create: { width, height: imageArea + captionArea, channels: 3, background: '#fff' } })
    .composite([{ input: resized, top: 0, left: 0 }, { input: Buffer.from(svg), top: imageArea, left: 0 }])
    .png()
    .toBuffer();
};
