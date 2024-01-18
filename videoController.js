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
    const resizedFrame = frame.rescale(2.5); // Adjust the scaling factor as needed
    const faces = classifier.detectMultiScale(resizedFrame);

    // const faces = classifier.detectMultiScale(frame);
    
    // Print detection results
    console.log(`Detected ${faces.objects.length || 0} faces in the frame: ${imagePath}`);
    console.log("..........Face details:", faces);
}

module.exports = {
    processExtractedFrames: async () => {
        console.log("Processing extracted frames...");
        const framesDirectory = 'frames'; // Adjust to your frames directory
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
            console.log('Starting frame extraction...');
            const videoPath = '/home/subrat/Downloads/Captain Miller - Hindi Official Trailer-(HDvideo9).mp4';  // Replace with your video file path
            const outputDirectory = 'frames';

            if (!fs.existsSync(outputDirectory)) {
                fs.mkdirSync(outputDirectory);
                console.log(`Created directory: ${outputDirectory}`);
            }

            const frameInterval = 20; // seconds

            const videoDuration = await getVideoDuration(videoPath);
            const numFrames = Math.floor(videoDuration / frameInterval);

            console.log(`Video duration: ${videoDuration} seconds`);
            console.log(`Extracting frames at ${frameInterval} seconds interval...`);
            
            const timestamps = Array.from({ length: numFrames }, (_, i) => i * frameInterval);
            console.log("Timestamps:", timestamps);

            const filters = timestamps.map((timestamp) => `eq(n\\,${Math.floor(timestamp * 30)})`);

            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .on('progress', (progress) => console.log(`Progress: ${progress.percent}%`))
                    .on('end', resolve)
                    .on('error', (err) => reject(err))
                    .output(`${outputDirectory}/frame%d.jpg`)
                    .complexFilter([`select='${filters.join('+')}',setpts=N/FRAME_RATE/TB`])
                    .run();
            });

            // Call the face detection function after extracting frames
            await module.exports.processExtractedFrames();

            console.log('Frames extracted successfully!');
            res.send('Frames extracted successfully!');
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).send('Something went wrong');
        }
    },
};


//Clean Node Modules and Package-lock:
// Remove the node_modules directory and the package-lock.json file to start fresh.

// bash
// Copy code
// rm -rf node_modules
// rm package-lock.json
// Install OpenCV Dependencies Locally:
// Ensure that the OpenCV dependencies are available locally by installing them within your project directory.

// bash
// Copy code
// npm install opencv-build
// This command installs the necessary OpenCV dependencies locally.

// Retry Installing opencv4nodejs:
// Attempt to install opencv4nodejs again.

// bash
// Copy code
// npm install opencv4nodejs
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