import * as faceapi from "face-api.js";
import KalmanFilter from "kalmanjs";

import { CV } from "./opencv";
declare var cv: CV;

// import * as cv from "./opencv/opencv"
// const cv : any = {}
import {
  FuckingRound,
  getFaceDetectorOptions,
  changeInputSize,
  isFaceDetectionModelLoaded,
} from "./controls";

let forwardTimes: number[] = [];
let withBoxes = true;
let selectedOpenCvMethoed = "0";
function updateTimeStats(timeInMs: number) {
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

async function onPlay(): Promise<void> {
  // console.log("onPlay")

  //   const videoEl = window.vid;
  const videoEl: HTMLVideoElement | null = document.getElementById(
    "inputVideo",
  ) as HTMLVideoElement;

  if (
    videoEl == null ||
    videoEl.paused ||
    videoEl.ended ||
    !isFaceDetectionModelLoaded()
  ) {
    // console.log({x:isFaceDetectionModelLoaded(), videoEl})
    setTimeout(() => onPlay());
    return;
  }

  const options = getFaceDetectorOptions();

  const ts = Date.now();
  let result = await faceapi
    .detectSingleFace(videoEl, options)
    .withFaceLandmarks(true);

  updateTimeStats(Date.now() - ts);

  if (result) {
    const canvas: HTMLCanvasElement | null = document.getElementById(
      "overlay",
    ) as HTMLCanvasElement;
    if (canvas == null) {
      setTimeout(() => onPlay());
      return;
    }
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
    // const chin = positions[8];

    const lefteyeleftcorner = positions[36];
    const lefteyerightcorner = positions[39];

    const righteyerightcorner = positions[45];
    const righteyeleftcorner = positions[42];

    const leftmouth = positions[48];
    const rightmouth = positions[54];

    const leftnostril = positions[31];
    const rightnostril = positions[35];
    // cvv
    const focal_length = dims.width;
    const center = [dims.width / 2, dims.height / 2];

    const imagePoints = cv.matFromArray(10, 2, cv.CV_64F, [
      noseTip.x,
      noseTip.y,

      bottomNose.x,
      bottomNose.y,

      leftnostril.x,
      leftnostril.y,

      rightnostril.x,
      rightnostril.y,

      lefteyeleftcorner.x,
      lefteyeleftcorner.y,
      lefteyerightcorner.x,
      lefteyerightcorner.y,

      righteyerightcorner.x,
      righteyerightcorner.y,
      righteyeleftcorner.x,
      righteyeleftcorner.y,

      leftmouth.x,
      leftmouth.y,
      rightmouth.x,
      rightmouth.y,
    ]);
    //from sparkar
    const objectPoints = cv.matFromArray(10, 3, cv.CV_64F, [
      //nose tips
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

    // imagePoints = (cv).matFromArray(6, 2, (cv).CV_64F, [
    //     noseTip.x,
    //     noseTip.y,
    //     chin.x,
    //     chin.y,
    //     lefteyeleftcorner.x,
    //     lefteyeleftcorner.y,
    //     righteyerightcorner.x,
    //     righteyerightcorner.y,
    //     leftmouth.x,
    //     leftmouth.y,
    //     rightmouth.x,
    //     rightmouth.y
    // ]);
    // objectPoints = (cv).matFromArray(6, 3, (cv).CV_64F, [
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
    const cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [
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
    const distCoeffs = cv.Mat.zeros(4, 1, cv.CV_64F);
    const rvec = new cv.Mat();
    const tvec = new cv.Mat();
    const outinliers = new cv.Mat();

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

      const pointf = cv.matFromArray(3, 1, cv.CV_64F, [
        0,
        0,
        1000,
      ]);
      const outarrf = new cv.Mat();
      const jacobf = new cv.Mat();

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

      const pointt = cv.matFromArray(3, 1, cv.CV_64F, [
        0,
        1000,
        0,
      ]);
      const outarrt = new cv.Mat();
      const jacobt = new cv.Mat();

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

      const points = cv.matFromArray(3, 1, cv.CV_64F, [
        1000,
        0,
        0,
      ]);
      const outarrs = new cv.Mat();
      const jacobs = new cv.Mat();

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

      let ctx = canvas.getContext("2d")!;
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
// window.onPlay = onPlay;

async function run() {
  console.log("run");
  // load face detection and face landmark models
  //   await changeFaceDetector(TINY_FACE_DETECTOR);

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
  const videoEl = document.getElementById(
    "inputVideo",
  ) as HTMLVideoElement;
  //   const videoEl = $("#inputVideo").get(0);
  videoEl.srcObject = stream;
  onPlay();
}

const kalmanconfig = { R: 1, Q: 50 };
const cache: { [key: string]: any } = {
  nosetipx: new KalmanFilter(kalmanconfig),
  nosetipy: new KalmanFilter(kalmanconfig),
  frontx: new KalmanFilter(kalmanconfig),
  fronty: new KalmanFilter(kalmanconfig),
  topx: new KalmanFilter(kalmanconfig),
  topy: new KalmanFilter(kalmanconfig),
  sidex: new KalmanFilter(kalmanconfig),
  sidey: new KalmanFilter(kalmanconfig),
};
const smooth = (name: string, value: number) => {
  return cache[name].filter(value);
};

const draw = (
  ctx: CanvasRenderingContext2D,
  _noseTip: { x: number; y: number },
  _frontx: number,
  _fronty: number,
  _topx: number,
  _topy: number,
  _sidex: number,
  _sidey: number,
) => {
  try {
    const noseTip = {
      x: smooth("nosetipx", _noseTip.x),
      y: smooth("nosetipy", _noseTip.y),
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
    ctx.arc(noseTip.x, noseTip.y, 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.moveTo(frontx, fronty);
    ctx.lineTo(noseTip.x, noseTip.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.moveTo(topx, topy);
    ctx.lineTo(noseTip.x, noseTip.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    ctx.moveTo(sidex, sidey);
    ctx.lineTo(noseTip.x, noseTip.y);
    ctx.stroke();
  } catch (err) {
    console.error("errrrr");
    console.error(err);
  }
};

const init = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://localhost:3007/",
  );

  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(
    "https://localhost:3007/",
  );
  run();
};

init();
