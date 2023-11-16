const fs = require('fs');
const os = require('os');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const BITRATE = [1,2]; //Mbits

//go through a directory and replace MP4 to WEBM

// Set the FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Function to convert a video to WebM
function convertToWebM(inputFile, outputFile, resizeWidth = null) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputFile).videoCodec('libvpx') //libvpx-vp9 could be used too
      .videoBitrate(BITRATE[1]*1000, true) 
      .outputOptions(
        '-minrate', BITRATE[0],
        '-maxrate', BITRATE[1]*1000,
        '-threads', '3', //Use number of real cores available on the computer - 1
        '-flags', '+global_header', //WebM won't love if you if you don't give it some headers
        '-psnr') //Show PSNR measurements in output. Anything above 40dB indicates excellent fidelity
      .on('progress', function (progress) {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('error', (err) => reject(err) )
      .on('end', (err, stdout, stderr) => {
        console.log(stdout);
        console.log('Processing finished.');
        var regex = /LPSNR=Y:([0-9\.]+) U:([0-9\.]+) V:([0-9\.]+) \*:([0-9\.]+)/
        var psnr = stdout.match(regex);
        console.log('This WebM transcode scored a PSNR of: ');
        console.log(psnr[4] + 'dB');
        resolve();
      })

    if (resizeWidth) {
      command.size(`${resizeWidth}x?`);
    }

    command.save(outputFile);
  });
}

//Move the MP4 file to desktop
function moveFileToDesktop(inputFile){
   // Get the desktop directory
   const desktopDir = path.join(os.homedir(), 'Desktop');
   // Create the "MP4" subdirectory if it doesn't exist
   const mp4Dir = path.join(desktopDir, 'MP4');
   if (!fs.existsSync(mp4Dir)) {
     fs.mkdirSync(mp4Dir);
   }
   // Move the MP4 file to the "MP4" subdirectory
   const movedFilePath = path.join(mp4Dir, path.basename(inputFile));
   fs.renameSync(inputFile, movedFilePath);
}

// Function to recursively find MP4 files in a directory
function findMp4Files(directory) {
  const files = fs.readdirSync(directory);
  const mp4Files = [];

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      mp4Files.push(...findMp4Files(filePath)); // Recursively search subdirectories
    } else if (file.endsWith('.mp4')) {
      mp4Files.push(filePath);
    }
  }

  return mp4Files;
}

// Main function
async function main(directory, resizeWidth = null, resizeHeight = null) {
  const mp4Files = findMp4Files(directory);

  if (mp4Files.length === 0) {
    console.log('No MP4 files found in the directory.');
    return;
  }

  fs.mkdirSync(path.join( directory, 'webm'), { recursive: true });

  for (const mp4File of mp4Files) {
    const webmFile = path.join(directory,'webm', path.basename(mp4File, '.mp4') + '.webm');;

    try {
      console.log(`Converting ${mp4File} to ${webmFile}`);
      await convertToWebM(mp4File, webmFile, resizeWidth, resizeHeight);
      console.log(`\n\nConversion completed.`);
    } catch (error) {
      console.error(`Error converting ${mp4File}: ${error.message}`);
    }
  }
}

// Usage
const directory = process.argv[2]; // Directory path
const resizeWidth = process.argv[3]; // Optional width for resizing

if (!directory) {
  console.error('Please provide a directory path.');
  process.exit(1);
}

main(directory, resizeWidth);
