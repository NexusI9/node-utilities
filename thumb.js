//Generates thumbnails with prefix s_ at the given size

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DEFAULT_SIZE = 450;
const DEFAULT_PREFIX = "s_";

function resizeImage(inputPath, outputPath, width) {
    return sharp(inputPath)
        .resize({ width })
        .toFile(outputPath);
}

function removeImage(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error removing ${filePath}: ${err}`);
        } else {
            console.log(`Removed ${filePath}`);
        }
    });
}

function processImagesInDirectory(directory, width, command) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${directory}: ${err}`);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(directory, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Error reading file ${filePath}: ${err}`);
                    return;
                }

                if (stats.isDirectory()) {
                    processImagesInDirectory(filePath, width, command);
                } else {

                    switch (command) {
                        case 'resize':
                            const extname = path.extname(filePath).toLowerCase();
                            if (['.jpg', '.jpeg', '.png', '.webp'].includes(extname)) {
                                const outputFileName = `${DEFAULT_PREFIX}${file}`;
                                const outputPath = path.join(directory, outputFileName);
        
                                resizeImage(filePath, outputPath, width)
                                    .then(() => {
                                        console.log(`Resized ${file} to ${width} pixels width.`);
                                    })
                                    .catch((err) => {
                                        console.error(`Error resizing ${file}: ${err}`);
                                    });
                            }
                        break;


                        case 'purge':
                            console.log(file);
                            if(file.match(/^s_/)){ removeImage(filePath); }
                        break;
                    }
                }
            });
        });
    });
}

// Check if command-line arguments are provided correctly
const command = process.argv[2];
const source = process.argv[3];
const width = parseInt(process.argv[4], 10) || DEFAULT_SIZE;

if (!command || !['purge', 'resize'].includes(command) ) {
    console.log('Usage: node resize-images.js <command> <input_directory> <width>');
    return;
}else{
    processImagesInDirectory(source, width, command);
}



