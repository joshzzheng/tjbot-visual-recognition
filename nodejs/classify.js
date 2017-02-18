const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');
const config = require('../config.js')

const vr = new VisualRecognitionV3({
  api_key: config.vrApiKey,
  version_date: '2016-05-19'
});

const params = {
  images_file: fs.createReadStream('../data/test/bigBird.png'),
  classifier_ids: [config.classifierId],
  threshold: 0
};

vr.classify(params, function(err, res) {
  if (err)
    console.log(err);
  else
    console.log(JSON.stringify(res, null, 2));
});