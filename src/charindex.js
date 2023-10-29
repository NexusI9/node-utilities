//open a file and read the character at given index


const fs = require('fs');

// Check if the correct number of arguments is provided
if (process.argv.length !== 4) {
  console.log('Usage: node read-file.js <file_path> <index>');
  process.exit(1);
}

// Get the file path and index from command line arguments
const filePath = process.argv[2];
const index = parseInt(process.argv[3]);

// Read the file asynchronously
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading the file: ${err}`);
    process.exit(1);
  }

  // Check if the index is valid
  if (index < 0 || index >= data.length) {
    console.error('Invalid index. Index is out of range.');
    process.exit(1);
  }

  // Output the character at the specified index
  var character = '';
  for(let id = index; id < index+20; id++){
    character += data.charAt(id);
  }

  console.log(`Character at index ${index}: ${character}`);
});
