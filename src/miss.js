//compate two directories and check for differences

const fs = require('fs');
const path = require('path');

function compareDirectories(dir1, dir2) {
  const dir1Contents = fs.readdirSync(dir1);
  const dir2Contents = fs.readdirSync(dir2);

  const missingDirectories = [];

  dir1Contents.forEach((item) => {
    const itemPath = path.join(dir1, item);
    const itemStat = fs.statSync(itemPath);

    if (itemStat.isDirectory()) {
      const matchingDir = dir2Contents.find((dir) => { 
        return dir.toLowerCase() === item.toLowerCase()
    });


      if (!matchingDir) {
        missingDirectories.push(item);
      }
    }
  });

  return missingDirectories;
}

// Usage: node compare-directories.js <directory1_path> <directory2_path>
// Example: node compare-directories.js /path/to/directory1 /path/to/directory2
const directory1Path = process.argv[2];
const directory2Path = process.argv[3];

if (!directory1Path || !directory2Path) {
  console.error('Please provide two directory paths!');
  process.exit(1);
}

let missingDirs = compareDirectories(directory1Path, directory2Path);

if(!missingDirs.length){ missingDirs = compareDirectories(directory2Path, directory1Path); }

if (missingDirs.length === 0) {
  console.log('No missing directories found.');
} else {
  console.log('Missing directories:');
  missingDirs.forEach((dir) => console.log(dir));
}
