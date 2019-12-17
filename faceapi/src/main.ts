import * as faceapi from "face-api.js";
import {
  // getFaceDetectorOptions,
  changeInputSize,
  isFaceDetectionModelLoaded,
} from "./controls";
import { updateTimeStats } from "./stats";
// import { extractHeadPoseInfo } from "./pose/process";
import * as threeManager from "./three/main";
// import * as THREE from "three";

// let withFaceApiJsDebug = true;
let videoEl: HTMLVideoElement | null = null;
async function onPlay(): Promise<void> {
  // console.log("onPlay")

  // const videoEl = window.vid;
  // const videoEl: HTMLVideoElement | null = document.getElementById(
  //   "inputVideo",
  // ) as HTMLVideoElement;

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
  drawOnVideoTexture(_gl);

  // const options = getFaceDetectorOptions();

  const ts = Date.now();
  // let result = await faceapi
  //   .detectSingleFace(videoEl, options)
  //   .withFaceLandmarks(true);

  updateTimeStats(Date.now() - ts);

  // if (result) {
  //   const canvas: HTMLCanvasElement | null = document.getElementById(
  //     "overlay",
  //   ) as HTMLCanvasElement;
  //   // if (canvas == null) {
  //   //   setTimeout(() => onPlay());
  //   //   return;
  //   // }
  //   // const ctx = canvas.getContext("2d");

  //   const dims = faceapi.matchDimensions(
  //     canvas,
  //     videoEl,
  //     true,
  //   );
  //   // console.log({ ctx });
  //   // ctx?.drawImage(
  //   //   videoEl,
  //   //   0,
  //   //   0,
  //   //   // canvas.width,
  //   //   // canvas.height,
  //   // );
  //   const resizedResult = faceapi.resizeResults(
  //     result,
  //     dims,
  //   );
  //   console.log({ resizedResult });
  //   // console.log({ dims, resizedResult });
  //   // extractHeadPoseInfo(resizedResult, dims, canvas);

  //   if (withFaceApiJsDebug) {
  //     // faceapi.draw.drawDetections(canvas, resizedResult);
  //     // faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
  //   }
  // }
  threeManager.render();

  setTimeout(() => onPlay());
}
let _videoTexture: WebGLTexture | null = null;
let _gl: any = null;
// window.onPlay = onPlay;

const drawOnVideoTexture = (gl: WebGLRenderingContext) => {
  gl.bindTexture(gl.TEXTURE_2D, _videoTexture);
  const level = 0;
  const internalFormat = gl.RGB;
  // const width = 1;
  // const height = 1;
  // const border = 0;
  const srcFormat = gl.RGB;
  const srcType = gl.UNSIGNED_BYTE;
  // const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  // gl.texImage2D(
  //   gl.TEXTURE_2D,
  //   level,
  //   internalFormat,
  //   width,
  //   height,
  //   border,
  //   srcFormat,
  //   srcType,
  //   pixel,
  // );

  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    // width,
    // height,
    // border,
    srcFormat,
    srcType,
    videoEl!,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    gl.CLAMP_TO_EDGE,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    gl.CLAMP_TO_EDGE,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR,
  );
  gl.texParameterf(
    gl.TEXTURE_2D,
    gl.TEXTURE_MAG_FILTER,
    gl.LINEAR,
  );
};
const initThree = () => {
  if (videoEl == null || videoEl.paused || videoEl.ended) {
    // console.log({x:isFaceDetectionModelLoaded(), videoEl})
    setTimeout(initThree, 16);
    return;
  }
  const canvas: HTMLCanvasElement | null = document.getElementById(
    "overlay",
  ) as HTMLCanvasElement;

  canvas.width = 360;
  canvas.height = 640;
  _gl = canvas.getContext("webgl");

  if (_gl == null) {
    setTimeout(initThree, 16);
    return;
  }
  // console.log(video.paused);
  // console.log(video.ended);
  // const texture = gl?.createTexture();
  _videoTexture = _gl.createTexture();
  drawOnVideoTexture(_gl);
  threeManager.start({
    videoElement: videoEl!,
    canvasElement: canvas,
    videoTexture: _videoTexture!,
    GL: _gl!,
  });

  onPlay();
};
async function run() {
  changeInputSize(128);

  // try to access users webcam and stream the images
  // to the video element
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: {
        min: 640,
        ideal: 1280,
        max: 1920,
      },
      height: {
        min: 360,
        ideal: 720,
        max: 1080,
      },
      facingMode: "user",
    },
  });

  const video = document.createElement("video");
  video.setAttribute("autoplay", "true");
  video.srcObject = stream;
  videoEl = video;

  // const _videoEl = document.getElementById(
  //   "inputVideo",
  // ) as HTMLVideoElement;
  // _videoEl.srcObject = stream;

  // onPlay();
  initThree();
}

const downloadModelsAndRun = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://192.168.0.108:3007/",
  );

  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(
    "https://192.168.0.108:3007/",
  );
  run();
};

downloadModelsAndRun();
