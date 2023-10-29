const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const homeDir = require('os').homedir();

const RESIZE_EXCLUDE_PREFIX = ["wide-","video-"];
const OUPUT_DIR = `${homeDir}/Desktop/webp`;
const QUALITY = 100;

const filterPrefix = new RegExp(`^(${RESIZE_EXCLUDE_PREFIX.join('|')})`);

function createOutputDir(outputDir) {

  const make = () => new Promise( (resolve, reject) => {
    fs.mkdir(outputDir, { recursive: true }, (err) => {
      if (err) { reject(err); }
      else{ resolve(true); }
    });
  });

  return new Promise((resolve, reject) => {
    fs.access(outputDir, (err) => {
      if (err) {
        make()
          .then( () => resolve(true) )
          .catch( (err) => reject(err) );
      } else {
        fs.rm(outputDir, {recursive: true} , (err) => {
          if(err){ reject(err); }
          make()
          .then( () => resolve(true) )
          .catch( (err) => reject(err) );
        });
      }
    });
  });

}

async function convertDirectoryToWebP(inputDir,outputDir, maxwidth) {

  //process files
  const files = await fs.promises.readdir(inputDir);
  const tasks = files.map(async (file) => {
    if(file === "webp"){ return; }
    const filePath = path.join(inputDir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      const subdir = path.join(outputDir, file);
      await fs.promises.mkdir(subdir, { recursive: true });

      await convertDirectoryToWebP(filePath, subdir, maxwidth);

    } else if (stat.isFile() && /\.(png|jpe?g|webp)$/i.test(file)) {

      const outFile = path.join(outputDir, path.basename(file, path.extname(file)) + '.webp');
      await sharp(filePath)
        .resize({
          width: !file.match(filterPrefix) && parseInt(maxwidth) || null,
          withoutEnlargement: true
        })
        .toFile(outFile, { quality: QUALITY });
    }
  });
  await Promise.all(tasks);
}

const inputDir = process.argv[2];
const MAX_WIDTH = process.argv[3] || null;

if (!inputDir) {
  console.error('Usage: node webp.js <inputDir> <size>');
  process.exit(1);
}

const outputDir = `${inputDir}/webp`;

createOutputDir(outputDir)
.then(() => convertDirectoryToWebP(inputDir,outputDir,MAX_WIDTH))
.then(() => console.log('Conversion completed successfully.'))
.catch((err) => console.error('Conversion failed:', err));