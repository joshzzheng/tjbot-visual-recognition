let RaspiCam = require('raspicam');

let camera = new RaspiCam({
  mode: "photo",
  output: "./photo/image.jpg",
  encoding: "jpg",
  timeout: 0 // take the picture immediately
});

const formatTimestamp = (timestamp) => {
  let date = new Date(timestamp*1000);
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
  camera.stop();
});

camera.on("exit", function( timestamp ){
  console.log("photo child process has exited at " + formatTimestamp(timestamp) );
});

camera.start();