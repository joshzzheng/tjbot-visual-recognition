const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');
const config = require('./config.js')

const visual_recognition = new VisualRecognitionV3({
  api_key: config.visualRecognitionApiKey,
  version_date: '2016-05-19'
});

const params = {
  images_file: fs.createReadStream('./photo/bigBird.png'),
  classifier_ids: ['seasame_730911508'],
  threshold: 0
};

visual_recognition.classify(params, function(err, res) {
  if (err)
    console.log(err);
  else
    console.log(JSON.stringify(res, null, 2));
});