const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const cv = require('opencv4nodejs');


// Set the path to the ffprobe binary
ffmpeg.setFfprobePath('/usr/bin/ffprobe');

async function getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata.format.duration);
            }
        });
    });
}
function processImage(imagePath) {
    const frame = cv.imread(imagePath);

    // Implement your detection logic here
    // e.g., face detection
    const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
    const faces = classifier.detectMultiScale(frame);

    // Print detection results
    console.log(`Detected ${faces.length} faces in the frame: ${imagePath}`);
}
  
 module.exports = {
    processExtractedFrames : async ( )=>{
        const framesDirectory = require('./frames'); // Adjust to your frames directory
        if (!fs.existsSync(framesDirectory)) {
            console.log(`Error: Frames directory "${framesDirectory}" not found.`);
            return;
        }
    
        fs.readdirSync(framesDirectory).forEach((file) => {
            const imagePath = path.join(framesDirectory, file);
            processImage(imagePath);
        });
    },
    extractFrames: async (req, res) => {
        try {
            console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^>>>>>>>>>>>>>>');
            const videoPath = '/home/subrat/Downloads/Captain Miller - Hindi Official Trailer-(HDvideo9).mp4';  // Replace with your video file path
            const outputDirectory = 'frames';

            if (!fs.existsSync(outputDirectory)) {
                fs.mkdirSync(outputDirectory);
                console.log(`Created directory: ${outputDirectory}`);
            }

            const frameInterval = 20; // seconds

            const videoDuration = await getVideoDuration(videoPath);
            const numFrames = Math.floor(videoDuration / frameInterval);
            
            const timestamps = Array.from({ length: numFrames }, (_, i) => i * frameInterval);
            console.log(timestamps,"?????????????",videoDuration,">>>>>>>>",numFrames)
            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .on('progress', (progress) => console.log(progress))
                    .on('end', resolve)
                    .on('error', (err) => reject(err))
                    .output(`${outputDirectory}/frame%d.jpg`)
                    .screenshots({
                        count: numFrames,
                        folder: outputDirectory,
                        size: '320x240',
                        filename: 'thumbnail-at-%s-seconds.png',
                    })
                    .run();
            });

            res.send('Frames extracted successfully!');
        } catch (error) {
            console.log(error);
            return res.status(500).send('Something went wrong');
        }
    },
};
// module.exports = {

//     extractFrames: async (req, res) => {
//         try {
//             console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^>>>>>>>>>>>>>>')
//             const videoPath = '/home/subrat/Downloads/Captain Miller - Hindi Official Trailer-(HDvideo9).mp4';  // Replace with your video file path
//             const outputDirectory = 'frames';

//             if (!fs.existsSync(outputDirectory)) {
//                 fs.mkdirSync(outputDirectory);
//                 console.log(`Created directory: ${outputDirectory}`);
//             }
//             ffmpeg(videoPath)
//                 .on('progress', (progress) => console.log(progress))
//                 .on('end', () => {
//                     res.send('Frames extracted successfully!');
//                 })
//                 .on('error', (err) => {
//                     res.status(500).send(`Error extracting frames: ${err}`);
//                 })
//                 .output(`${outputDirectory}/frame%d.jpg`)
//                 .screenshots({
//                     count: 1,
//                     folder: outputDirectory,
//                     size: '320x240',
//                     filename: 'thumbnail-at-%s-seconds.png',
//                 });

//         } catch (error) {
//             console.log(error)
//              return res.status(500).send('Something went wrong ')
             
//         }
//     },
// }