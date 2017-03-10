const config = require('./config.js')
const exec = require('child_process').exec;
const fs = require('fs');
const mic = require('mic');
const probe = require('node-ffprobe');

const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

const attentionWord = config.attentionWord;

/******************************************************************************
* Create Watson Services
*******************************************************************************/
const speechToText = new SpeechToTextV1({
  username: config.STTUsername,
  password: config.STTPassword,
  version: 'v1'
});

const toneAnalyzer = new ToneAnalyzerV3({
  username: config.ToneUsername,
  password: config.TonePassword,
  version: 'v3',
  version_date: '2016-05-19'
});

const conversation = new ConversationV1({
  username: config.ConUsername,
  password: config.ConPassword,
  version: 'v1',
  version_date: '2016-07-11'
});

const textToSpeech = new TextToSpeechV1({
  username: config.TTSUsername,
  password: config.TTSPassword,
  version: 'v1'
});

const visualRecognition = new VisualRecognitionV3({
  api_key: config.vrApiKey,
  version_date: '2016-05-19'
});

/******************************************************************************
* Configuring the Microphone
*******************************************************************************/
const micParams = { 
  rate: 44100, 
  channels: 2, 
  debug: false, 
  exitOnSilence: 6
}
const micInstance = mic(micParams);
const micInputStream = micInstance.getAudioStream();

let pauseDuration = 0;
micInputStream.on('pauseComplete', ()=> {
  console.log('Microphone paused for', pauseDuration, 'seconds.');
  setTimeout(function() {
      micInstance.resume();
      console.log('Microphone resumed.')
  }, Math.round(pauseDuration * 1000)); //Stop listening when speaker is talking
});

micInstance.start();
console.log('TJ is listening, you may speak now.');


/******************************************************************************
* Configure Camera
*******************************************************************************/
let ms = (new Date()).getTime().toString();
let imageFile = config.imagePath + "image_" + ms + ".jpg";
console.log(imageFile);

const camera = new RaspiCam({
  mode: "photo",
  width: 320,
  height: 240,
  quality: 20,
  output: imageFile,
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

camera.on("start", function( err, timestamp ){
  console.log("photo started at " + formatTimestamp(timestamp) );
});

camera.on("read", function( err, timestamp, filename ){
  console.log("photo image captured with filename: " + filename );
  recognizeCharacter();
  camera.stop();
});

camera.on("exit", function( timestamp ){
  console.log("photo child process has exited at " + formatTimestamp(timestamp) );
});


/******************************************************************************
* Speech To Text
*******************************************************************************/
const textStream = micInputStream.pipe(
  speechToText.createRecognizeStream({
    content_type: 'audio/l16; rate=44100; channels=2',
  })).setEncoding('utf8');

/******************************************************************************
* Get Emotional Tone
*******************************************************************************/
const getEmotion = (text) => {
  return new Promise((resolve) => {
    let maxScore = 0;
    let emotion = null;
    toneAnalyzer.tone({text: text}, (err, tone) => {
      let tones = tone.document_tone.tone_categories[0].tones;
      for (let i=0; i<tones.length; i++) {
        if (tones[i].score > maxScore){
          maxScore = tones[i].score;
          emotion = tones[i].tone_id;
        }
      }
      resolve({emotion, maxScore});
    })
  })
};

/******************************************************************************
* Get Recognize Character
*******************************************************************************/
const recognizeCharacter = () => {
  return new Promise((resolve) => {
    const params = {
      images_file: fs.createReadStream(imageFile),
      classifier_ids: [config.classifierId],
      threshold: 0
    }; 

    visualRecognition.classify(params, function(err, res) {
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

        if (recognizedClass == "elmo") {
          console.log("Hello, Elmo");
          resolve('Elmo');
        } else if (recognizedClass == "kermit") {
          console.log("Hello, Kermit");
          resolve('Kermit');
        } else if (recognizedClass == "big_bird") {
          console.log("Hello, Big Bird");
          resolve('Big Bird');
        } else {
          console.log("Hello, Cookie Monster");
          resolve('Cookie Monster');
        }
      }
    })
  })
};

/******************************************************************************
* Text To Speech
*******************************************************************************/
const speakResponse = (text) => {
  const params = {
    text: text,
    voice: config.voice,
    accept: 'audio/wav'
  };
  textToSpeech.synthesize(params)
  .pipe(fs.createWriteStream('output.wav'))
  .on('close', () => {
    probe('output.wav', function(err, probeData) {
      pauseDuration = probeData.format.duration + 0.2;
      micInstance.pause();
      exec('aplay output.wav', function (error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
    });
  });
}

/******************************************************************************
* Conversation
******************************************************************************/
let start_dialog = false;
let context = {};
let watson_response = '';

speakResponse('Hi there, I am awake.');
textStream.on('data', (user_speech_text) => {
  user_speech_text = user_speech_text.toLowerCase();
  console.log('Watson hears: ', user_speech_text);
  if (user_speech_text.indexOf(attentionWord.toLowerCase()) >= 0) {
    start_dialog = true;
  }

  if (start_dialog) {
    getEmotion(user_speech_text).then((detectedEmotion) => {
      context.emotion = detectedEmotion.emotion;
      conversation.message({
        workspace_id: config.ConWorkspace,
        input: {'text': user_speech_text},
        context: context
      }, (err, response) => {
        context = response.context;
        watson_response =  response.output.text[0];
        speakResponse(watson_response);
        console.log('Watson says:', watson_response);
        if (context.system.dialog_turn_counter == 2) {
          context = {};
          start_dialog = false;
        }
      });
    });  
  } else {
    console.log('Waiting to hear the word "', attentionWord, '"');
  }
});