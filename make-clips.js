const fs = require('fs');
const tj = require('@tmcw/togeojson');
const { DOMParser } = require('xmldom');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const { URL } = require('url');
const interpolate = require('./interpolate')

// set data paths
const CWD = process.cwd();
const CONFIG_PATH = `${CWD}/doc.json`;
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
const copy_path = `${CWD}/${CONFIG.google.doc[0].filepath}`
const directory = './data/';
const out = './static/';

const { config: { offset, duration }, chapters } = JSON.parse(fs.readFileSync(`${copy_path}`, 'utf-8'));

let video;
let gps;
let gps_interpolate;

const cutVid = (start, clipDuration, outFile) => {
  ffmpeg(video)
    .seek(start)
    .duration(clipDuration)
    .output(outFile)
    .on('end', (err) => {
      if (!err) { console.log(`saved ${outFile}`); }
    })
    .on('error', (err) => {
      console.log('error: ', err);
    })
    .run();
};

const makeImgs = (timestamps, folder) => {
  ffmpeg(video)
    .screenshots({
      timestamps,
      folder,
      filename: '%s.png',
    })
    .on('error', (err) => {
      console.log(err);
    });
};

fs.readdirSync(directory).forEach((file) => {
  if (file.endsWith('.mp4')) {
    video = `${directory}/${file}`;
  } else if (file.endsWith('.gpx')) {
      const gpx = new DOMParser().parseFromString(fs.readFileSync(`${directory}/${file}`, 'utf8'));
      gps = tj.gpx(gpx);

      // Filter GPS points
      const start = Date.parse(gps.features[0].properties.time);
      gps.features[0].properties.coordTimes = gps.features[0].properties.coordTimes
        .map((time) => (Date.parse(time) - start) / 1000)
        .filter((time) => time < duration);

      // Make new gps_interpolate JSON
      gps_interpolate = JSON.parse(JSON.stringify(gps));
      gps_interpolate.features[0].properties.coordTimes = [...Array(parseInt(duration)).keys()];
      gps_interpolate.features[0].geometry.coordinates = [];

      // Fill in missing times and get interpolated points, so there is a GPS per second
      const gpxCoords = gps.features[0].geometry.coordinates;
      const gpxTimes = gps.features[0].properties.coordTimes;

      let gpxInterpCoords = gps_interpolate.features[0].geometry.coordinates
      gpxInterpCoords[0] = gpxCoords[0]

      for (var i = 1; i < gpxTimes.length; i++) {
        if(gpxTimes[i] - gpxTimes[i-1] ==1 ) {

          gpxInterpCoords[gpxTimes[i]] = gpxCoords[i]

        } else {

          // Interpolating between: gpxTimes[i-1] and gpxTimes[i], startCoord and endCoord)
          let startCoord = gpxCoords[i-1]
          let endCoord = gpxCoords[i]
          gpxInterpCoords[gpxTimes[i-1]] = gpxCoords[i-1]
          gpxInterpCoords[gpxTimes[i]] = gpxCoords[i]

          // Run Interpolation and add missing points
          let missingCount = gpxTimes[i]- gpxTimes[i-1] -1
          let newPoints = interpolate.getPoints(startCoord, endCoord, missingCount)
          for (var j=0; j < newPoints.length; j++){
            gpxInterpCoords[gpxTimes[i-1]+1+j] = newPoints[j]
          }

        }
      }

      fs.writeFileSync(`./route.json`, JSON.stringify(gps_interpolate));
    }

});


chapters.forEach((chapter) => {
  if (chapter.video) {
    cutVid(chapter.video.start, chapter.video.duration, `./static/vids/${chapter.id}.mp4`);
  }

});

const chunkArray = (array, size) => {
  const result = [];
  const arrayCopy = [...array];
  while (arrayCopy.length > 0) {
    result.push(arrayCopy.splice(0, size));
  }
  return result;
};

if (!fs.existsSync(`${out}imgs/`)) {
  fs.mkdirSync(`${out}imgs/`);
}
console.log('making screenshots, this may take a moment');
chunkArray(gps_interpolate.features[0].properties.coordTimes, 50).forEach((chunk) => {
  console.log(chunk);
  makeImgs(chunk, `${out}imgs/`);
});
