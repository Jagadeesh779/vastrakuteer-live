import sharp from 'sharp';
import { renameSync } from 'fs';

const inputPath = './src/assets/logo.png';
const tempPath = './src/assets/logo_temp.png';
const outputPath = './src/assets/logo.png';

const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const buf = Buffer.from(data);

for (let i = 0; i < buf.length; i += channels) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    // If pixel is white or near-white, make it transparent
    if (r > 230 && g > 230 && b > 230) {
        buf[i + 3] = 0;
    }
}

await sharp(buf, { raw: { width, height, channels } })
    .png()
    .toFile(tempPath);

renameSync(tempPath, outputPath);
console.log('Done! Transparent logo saved to', outputPath);
