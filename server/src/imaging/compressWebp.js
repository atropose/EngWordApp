import sharp from 'sharp';

export const compressWebp = async (inputBuffer, maxBytes = 1000 * 1024) => {
  let width = 1024;
  let quality = 80;
  while (width >= 512) {
    let q = quality;
    while (q >= 40) {
      const out = await sharp(inputBuffer).resize({ width, withoutEnlargement: true }).webp({ quality: q }).toBuffer();
      if (out.byteLength <= maxBytes) return out;
      q -= 8;
    }
    width -= 96;
  }
  throw new Error('Failed to compress image below 1000KB');
};
