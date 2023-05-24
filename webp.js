const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


const RESIZE_EXCLUDE_SUFFIX = /(wide_)/;

const QUALITY = 100;

async function convertDirectoryToWebP(inputDir, outputDir, maxwidth) {
  const files = await fs.promises.readdir(inputDir);
  const tasks = files.map(async (file) => {
    const filePath = path.join(inputDir, file);
    const stat = await fs.promises.stat(filePath);
    if (stat.isDirectory()) {
      const subdir = path.join(outputDir, file);
      await fs.promises.mkdir(subdir, { recursive: true });
      await convertDirectoryToWebP(filePath, subdir);
    } else if (stat.isFile() && /\.(png|jpe?g)$/i.test(file)) {
      const outFile = path.join(outputDir, path.basename(file, path.extname(file)) + '.webp');
      await sharp(filePath)
        .resize({ 
          width: !RESIZE_EXCLUDE_SUFFIX.test(file) && maxwidth ? parseInt(maxwidth) : null,
          withoutEnlargement:true
        })
        .toFile(outFile, {quality:QUALITY});
    }
  });
  await Promise.all(tasks);
}

const inputDir = process.argv[2];
const outputDir = process.argv[3];
const MAX_WIDTH = process.argv[4] || null;

if (!inputDir || !outputDir) {
  console.error('Usage: node convert-to-webp.js inputDir outputDir');
  process.exit(1);
}

convertDirectoryToWebP(inputDir, outputDir, MAX_WIDTH)
  .then(() => console.log('Conversion completed successfully.'))
  .catch((err) => console.error('Conversion failed:', err));
