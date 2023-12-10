//Remove all the fill attributes from SVG

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Get the folder path from the command line arguments
const folderPath = process.argv[2];

if (!folderPath) {
  console.error('Please provide the folder path as a command line argument.');
  process.exit(1);
}

// Create the "output" subfolder if it doesn't exist
const outputFolder = path.join(folderPath, 'output');
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

function processSVGFile(inputFilePath, outputFolder) {
  // Read the SVG file content
  const svgContent = fs.readFileSync(inputFilePath, 'utf-8');

  // Load the SVG content into cheerio
  const $ = cheerio.load(svgContent, { xmlMode: true });

  // Remove the fill attribute with a hex code
  $('*').removeAttr('fill');

  // Construct the output file path within the "output" subfolder
  const fileName = path.basename(inputFilePath);
  const outputFilePath = path.join(outputFolder, fileName);

  // Save the modified SVG content to the output file
  fs.writeFileSync(outputFilePath, $.xml(), 'utf-8');
}

function processFolder(folder) {
  // Read the contents of the folder
  const files = fs.readdirSync(folder);

  files.forEach(file => {
    const filePath = path.join(folder, file);

    // Check if it's a directory
    if (fs.statSync(filePath).isDirectory()) {
      // Recursively process subfolders
      processFolder(filePath);
    } else {
      // Process SVG files
      if (path.extname(file).toLowerCase() === '.svg') {
        processSVGFile(filePath, outputFolder);
        console.log(`Processed: ${filePath}`);
      }
    }
  });
}

// Start processing from the specified folder
processFolder(folderPath);
