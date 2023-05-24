const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const colors = require('colors');

if (process.argv.length !== 4) {
  console.log('Usage: node script.js <dir1> <dir2>');
  process.exit(1);
}

const dir1 = process.argv[2];
const dir2 = process.argv[3];

function getMD5(filePath) {
  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5');
  hash.update(data);
  return hash.digest('hex');
}

function traverseDirectories(dir1Path, dir2Path, relativePath = '') {
  const dir1Files = fs.readdirSync(dir1Path);
  const dir2Files = fs.readdirSync(dir2Path);

  const dir1Hashes = {};
  const dir2Hashes = {};

  dir1Files.forEach(file => {
    const filePath = path.join(dir1Path, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      dir1Hashes[file] = traverseDirectories(
        path.join(dir1Path, file),
        path.join(dir2Path, file),
        path.join(relativePath, file)
      );
    } else {
      dir1Hashes[file] = { path: path.join(relativePath, file), hash: getMD5(filePath) };
    }
  });

  dir2Files.forEach(file => {
    const filePath = path.join(dir2Path, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      dir2Hashes[file] = traverseDirectories(
        path.join(dir1Path, file),
        path.join(dir2Path, file),
        path.join(relativePath, file)
      );
    } else {
      dir2Hashes[file] = { path: path.join(relativePath, file), hash: getMD5(filePath) };
    }
  });

  const commonDirs = Object.keys(dir1Hashes).filter(dir =>
    Object.prototype.hasOwnProperty.call(dir2Hashes, dir)
  );

  const result = [];

  commonDirs.forEach(dir => {
    const dir1File = dir1Hashes[dir];
    const dir2File = dir2Hashes[dir];
    const dir1FilePath = dir1File.path;
    const dir2FilePath = dir2File.path;
    const dir1FileHash = dir1File.hash;
    const dir2FileHash = dir2File.hash;
    const dir1FileColor = dir1FileHash === dir2FileHash ? colors.green : colors.red;
    const dir2FileColor = dir1FileHash === dir2FileHash ? colors.green : colors.red;
    result.push({ path: dir1FilePath, hash1: dir1FileHash, hash2: dir2FileHash, color1: dir1FileColor, color2: dir2FileColor });
  });

  return result;
}

// Main execution
const result = traverseDirectories(dir1, dir2);

// Outputting the results
result.forEach(entry => {
  console.log(entry.path);
  console.log(`${entry.color1(entry.hash1)}\t${entry.color2(entry.hash2)}`);
  console.log(); // Add an empty line between each entry
});
