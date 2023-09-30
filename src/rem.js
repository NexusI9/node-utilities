const fs = require('fs');
const path = require('path');

function removeThumbnailDirectories(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file.toLowerCase() === 'thumbnails') {
        // Remove the thumbnail directory
        fs.rmdirSync(filePath, { recursive: true });
        console.log(`Removed directory: ${filePath}`);
      } else {
        // Recursively check subdirectories
        removeThumbnailDirectories(filePath);
      }
    }
  });
}

// Usage: node remove-thumbnails.js <directory_path>
// Example: node remove-thumbnails.js /path/to/directory
const directoryPath = process.argv[2];

if (!directoryPath) {
  console.error('Please provide a directory path!');
  process.exit(1);
}

removeThumbnailDirectories(directoryPath);
