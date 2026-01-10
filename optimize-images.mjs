import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HERO_DIR = path.join(__dirname, 'src/assets/images/hero');

const TARGETS = [
    { file: 'citadelle.jpg', output: 'citadelle.webp' },
    { file: 'palais-sanssouci.jpeg', output: 'palais-sanssouci.webp' }
];

async function optimize() {
    console.log('Starting optimization...');

    for (const target of TARGETS) {
        const inputPath = path.join(HERO_DIR, target.file);
        const outputPath = path.join(HERO_DIR, target.output);

        try {
            // Check if input exists
            await fs.access(inputPath);

            console.log(`Optimizing ${target.file}...`);

            await sharp(inputPath)
                .resize(1920, null, { // Max width 1920, maintain aspect ratio
                    withoutEnlargement: true
                })
                .webp({ quality: 80 }) // Convert to WebP, 80% quality
                .toFile(outputPath);

            const inputStats = await fs.stat(inputPath);
            const outputStats = await fs.stat(outputPath);

            console.log(`✅ ${target.output} created.`);
            console.log(`   Before: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   After:  ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Saved:  ${(100 * (1 - outputStats.size / inputStats.size)).toFixed(2)}%`);

        } catch (error) {
            console.error(`❌ Error processing ${target.file}:`, error.message);
        }
    }
}

optimize();
