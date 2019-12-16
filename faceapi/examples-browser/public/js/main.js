let forwardTimes = [];
let withBoxes = true;
let selectedOpenCvMethoed = "0";

// function onChangeHideBoundingBoxes(e) {
//   withBoxes = !$(e.target).prop('checked')
// }

function updateTimeStats(timeInMs) {
  forwardTimes = [timeInMs]
    .concat(forwardTimes)
    .slice(0, 30);
  const avgTimeInMs =
    forwardTimes.reduce((total, t) => total + t) /
    forwardTimes.length;
  console.log({
    time: `${Math.round(avgTimeInMs)} ms`,
    fps: `${FuckingRound(1000 / avgTimeInMs)}`,
  });
}

async function onPlay() {
//   const videoEl = window.vid;
  const videoEl = document.getElementById("inputVideo")

  if (
    videoEl.paused ||
    videoEl.ended ||
    !isFaceDetectionModelLoaded()
  )
    return setTimeout(() => onPlay());

  const options = getFaceDetectorOptions();

  const ts = Date.now();
  let result = await faceapi
    .detectSingleFace(videoEl, options)
    .withFaceLandmarks(true);

  updateTimeStats(Date.now() - ts);

  if (result) {
  const canvas = document.getElementById("overlay")
  const dims = faceapi.matchDimensions(
      canvas,
      videoEl,
      true,
    );
    const resizedResult = faceapi.resizeResults(
      result,
      dims,
    );

    // resizedResults.forEach((res) => {

    const positions = resizedResult.landmarks.positions;
    const noseTip = positions[30];
    const bottomNose = positions[33];
    const chin = positions[8];

    const lefteyeleftcorner = positions[36];
    const lefteyerightcorner = positions[39];

    const righteyerightcorner = positions[45];
    const righteyeleftcorner = positions[42];

    const leftmouth = positions[48];
    const rightmouth = positions[54];

    const leftnostril = positions[31];
    const rightnostril = positions[35];
    // cvv
    focal_length = dims.width;
    center = [dims.width / 2, dims.height / 2];

    imagePoints = cv.matFromArray(10, 2, cv.CV_64F, [
      noseTip._x,
      noseTip._y,

      bottomNose._x,
      bottomNose._y,

      leftnostril._x,
      leftnostril._y,

      rightnostril._x,
      rightnostril._y,

      lefteyeleftcorner._x,
      lefteyeleftcorner._y,
      lefteyerightcorner._x,
      lefteyerightcorner._y,

      righteyerightcorner._x,
      righteyerightcorner._y,
      righteyeleftcorner._x,
      righteyeleftcorner._y,

      leftmouth._x,
      leftmouth._y,
      rightmouth._x,
      rightmouth._y,
    ]);
    //from sparkar
    objectPoints = cv.matFromArray(10, 3, cv.CV_64F, [
      //nose tip
      0.0,
      0.0,
      0.0,

      // bottom nose
      0.0,
      -60.0,
      -78.0,

      // left nostril
      -67.0,
      -58.0,
      -100.0,

      // right nostril
      67.0,
      -58.0,
      -100.0,

      //chin
      // -6.0,
      // -400.0,
      // -150.0,

      //lefteyeleftcorner
      -262.0,
      168.0,
      -240.0,
      //lefteyerightcorner
      -115.0,
      170.0,
      -210.0,

      //righteyerightcorner
      262.0,
      168.0,
      -240.0,
      //righteyeleftcorner
      115.0,
      170.0,
      -210.0,

      // // left mouth corner
      -148.0,
      -192.0,
      -181.0,
      //rightmouthcorner
      148.0,
      -192.0,
      -181.0,
    ]);

    // imagePoints = cv.matFromArray(6, 2, cv.CV_64F, [
    //     noseTip._x,
    //     noseTip._y,
    //     chin._x,
    //     chin._y,
    //     lefteyeleftcorner._x,
    //     lefteyeleftcorner._y,
    //     righteyerightcorner._x,
    //     righteyerightcorner._y,
    //     leftmouth._x,
    //     leftmouth._y,
    //     rightmouth._x,
    //     rightmouth._y
    // ]);
    // objectPoints = cv.matFromArray(6, 3, cv.CV_64F, [
    //   //nose
    //     0.0,
    //     0.0,
    //     0.0,
    //           //chin
    //     0.0,
    //     -330.0,
    //     -65.0,

    //     -225.0,
    //     170.0,
    //     -135.0,

    //     225.0,
    //     170.0,
    //     -135.0,

    //     -150.0,
    //     -150.0,
    //     -125.0,

    //     150.0,
    //     -150.0,
    //     -125.0
    // ]);
    cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [
      focal_length,
      0,
      center[0],
      0,
      focal_length,
      center[1],
      0,
      0,
      1,
    ]);
    distCoeffs = cv.Mat.zeros(4, 1, cv.CV_64F);
    rvec = new cv.Mat();
    tvec = new cv.Mat();
    outinliers = new cv.Mat();

    try {
      cv.solvePnPRansac(
        objectPoints,
        imagePoints,
        cameraMatrix,
        distCoeffs,
        rvec,
        tvec,
        false,
        100,
        8.0,
        0.99,
        outinliers,
        parseInt(selectedOpenCvMethoed, 10),
      );

      cv.solvePnPRefineVVS(
        objectPoints,
        imagePoints,
        cameraMatrix,
        distCoeffs,
        rvec,
        tvec,
      );

      pointf = cv.matFromArray(3, 1, cv.CV_64F, [
        0,
        0,
        1000,
      ]);
      outarrf = new cv.Mat();
      jacobf = new cv.Mat();

      cv.projectPoints(
        pointf,
        rvec,
        tvec,
        cameraMatrix,
        distCoeffs,
        outarrf,
        jacobf,
      );

      let frontx = outarrf.data64F[0];
      let fronty = outarrf.data64F[1];

      pointt = cv.matFromArray(3, 1, cv.CV_64F, [
        0,
        1000,
        0,
      ]);
      outarrt = new cv.Mat();
      jacobt = new cv.Mat();

      cv.projectPoints(
        pointt,
        rvec,
        tvec,
        cameraMatrix,
        distCoeffs,
        outarrt,
        jacobt,
      );

      let topx = outarrt.data64F[0];
      let topy = outarrt.data64F[1];

      points = cv.matFromArray(3, 1, cv.CV_64F, [
        1000,
        0,
        0,
      ]);
      outarrs = new cv.Mat();
      jacobs = new cv.Mat();

      cv.projectPoints(
        points,
        rvec,
        tvec,
        cameraMatrix,
        distCoeffs,
        outarrs,
        jacobs,
      );

      let sidex = outarrs.data64F[0];
      let sidey = outarrs.data64F[1];

      let ctx = canvas.getContext("2d");
      draw(
        ctx,
        noseTip,
        frontx,
        fronty,
        topx,
        topy,
        sidex,
        sidey,
      );
      // })
    } catch {
      console.error("err");
    }

    if (withBoxes) {
      faceapi.draw.drawDetections(canvas, resizedResult);
      faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
    }
  }

  setTimeout(() => onPlay());
}

async function run() {
  // load face detection and face landmark models
  await changeFaceDetector(TINY_FACE_DETECTOR);
  await faceapi.loadFaceLandmarkModel("/");

  changeInputSize(128);

  // try to access users webcam and stream the images
  // to the video element
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {},
  });

  // const video = document.createElement('video')
  // video.setAttribute('autoplay',true);
  // video.srcObject = stream
  // window.vid = video;
  // onPlay()
  const videoEl = document.getElementById("inputVideo")
//   const videoEl = $("#inputVideo").get(0);
  videoEl.srcObject = stream;
}



const kalmanconfig = { R: 1, Q: 50 };
const cache = {
  nosetipx: new KalmanFilter(kalmanconfig),
  nosetipy: new KalmanFilter(kalmanconfig),
  frontx: new KalmanFilter(kalmanconfig),
  fronty: new KalmanFilter(kalmanconfig),
  topx: new KalmanFilter(kalmanconfig),
  topy: new KalmanFilter(kalmanconfig),
  sidex: new KalmanFilter(kalmanconfig),
  sidey: new KalmanFilter(kalmanconfig),
};
const smooth = (name, value) => {
  return cache[name].filter(value);
};

const draw = (
  ctx,
  _noseTip,
  _frontx,
  _fronty,
  _topx,
  _topy,
  _sidex,
  _sidey,
) => {
  try {
    const noseTip = {
      _x: smooth("nosetipx", _noseTip._x),
      _y: smooth("nosetipy", _noseTip._y),
    };
    const frontx = smooth("frontx", _frontx);
    const fronty = smooth("fronty", _fronty);

    const topx = smooth("topx", _topx);
    const topy = smooth("topy", _topy);

    const sidex = smooth("sidex", _sidex);
    const sidey = smooth("sidey", _sidey);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(frontx, fronty, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.arc(noseTip._x, noseTip._y, 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.moveTo(frontx, fronty);
    ctx.lineTo(noseTip._x, noseTip._y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.moveTo(topx, topy);
    ctx.lineTo(noseTip._x, noseTip._y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    ctx.moveTo(sidex, sidey);
    ctx.lineTo(noseTip._x, noseTip._y);
    ctx.stroke();
  } catch (err) {
    console.error("errrrr");
    console.error(err);
  }
};

const init = () => {
    console.log("initt")
  faceapi.nets.faceLandmark68TinyNet
    .loadFromUri("/")
    .then(() => run());
};
