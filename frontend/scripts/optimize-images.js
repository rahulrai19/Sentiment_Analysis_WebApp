import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputDir = join(__dirname, '../public');
const outputDir = join(__dirname, '../public/optimized');

// Create output directory if it doesn't exist
await fs.mkdir(outputDir, { recursive: true });

const images = [
  'Back1.jpg',
  'banner1.jpg',
  'back.jpg',
  'banner.jpg',
  'party.jpg'
];

async function optimizeImage(filename) {
  const inputPath = join(inputDir, filename);
  const outputPath = join(outputDir, filename.replace(/\.(jpg|jpeg|png)$/, '.webp'));
  
  try {
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log(`Optimized ${filename} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error optimizing ${filename}:`, error);
  }
}

async function optimizeAllImages() {
  for (const image of images) {
    await optimizeImage(image);
  }
}

await optimizeAllImages(); 