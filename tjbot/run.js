const RaspiCam = require('raspicam');
const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');
const config = require('../config.js')

const vr = new VisualRecognitionV3({
  api_key: config.vrApiKey,
  version_date: '2016-05-19'
});

const camera = new RaspiCam({
  mode: "photo",
  output: "./photo/image.jpg",
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
    images_file: fs.createReadStream(imagePath),
    classifier_ids: [config.classifierId],
    threshold: 0
  }; 

  vr.classify(params, function(err, res) {
    if (err)
      console.log(err);
    else
      console.log(JSON.stringify(res, null, 2));
  });
}

camera.on("start", function( err, timestamp ){
  console.log("photo started at " + formatTimestamp(timestamp) );
});

camera.on("read", function( err, timestamp, filename ){
  console.log("photo image captured with filename: " + filename );
  camera.stop();
  recognizeCharacter(config.imagePath);
});

camera.on("exit", function( timestamp ){
  console.log("photo child process has exited at " + formatTimestamp(timestamp) );
});

camera.start();