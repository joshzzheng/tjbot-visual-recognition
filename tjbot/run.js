const config = require('../config.js')
const RaspiCam = require('raspicam');
const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');

const vr = new VisualRecognitionV3({
  api_key: config.vrApiKey,
  version_date: '2016-05-19'
});

let ms = (new Date()).getTime().toString();
let imageFilename = "image_" + ms + ".jpg";
let imageFile = config.imagePath + imageFilename;

console.log(imageFilename);
console.log(imageFile);

const camera = new RaspiCam({
  mode: "photo",
  output: './photos/wtf.jpg',
  encoding: "jpg",
  timeout: 0 // take the picture immediately
});

const formatTimestamp = (timestamp) => {
  let date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = "0" + date.getMinutes();
  let seconds = "0" + date.getSeconds();
  return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

const recognizeCharacter = (imagePath) => {
  const params = {
    images_file: fs.createReadStream('./photos/wtf.jpg'),
    classifier_ids: [config.classifierId],
    threshold: 0
  }; 

  vr.classify(params, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      let classes = res.images[0].classifiers[0].classes
      let maxScore = classes[0].score
      let recognizedClass = classes[0].class
      for (let i=1; i<classes.length; i++) {
        if (classes[i].score > maxScore) {
          maxScore = classes[i].score;
          recognizedClass = classes[i].class;
        }
      }
      console.log("The character is: ", recognizedClass);
    }
  });
}

camera.on("start", function( err, timestamp ){
  console.log("photo started at " + formatTimestamp(timestamp) );
});

camera.on("read", function( err, timestamp, filename ){
  console.log("photo image captured with filename: " + filename );
  camera.stop();
});

camera.on("exit", function( timestamp ){
  console.log("photo child process has exited at " + formatTimestamp(timestamp) );
  recognizeCharacter(config.imagePath);
});

camera.start();