import * as faceapi from "face-api.js";
import {
  getFaceDetectorOptions,
  isFaceDetectionModelLoaded,
} from "./controls";
import { updateTimeStats } from "./stats";
import * as threeManager from "./three/main";
import { cameraConfig } from "./constants";
import { drawOnVideoTexture } from "./three/drawVideoOnTexture";
import { extractHeadPoseInfo } from "./pose/process";

// let withFaceApiJsDebug = true;
let _videoEl: HTMLVideoElement | null = null;
let _videoTexture: WebGLTexture | null = null;
let _gl: WebGLRenderingContext | null = null;

async function onPlay(): Promise<void> {
  if (
    _videoEl == null ||
    _videoEl.paused ||
    _videoEl.ended ||
    !isFaceDetectionModelLoaded()
  ) {
    setTimeout(() => onPlay());
    return;
  }
  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);

  // const options = getFaceDetectorOptions();

  // const ts = Date.now();
  // let result = await faceapi
  //   .detectSingleFace(_videoEl, options)
  //   .withFaceLandmarks(true);

  // updateTimeStats(Date.now() - ts);

  // if (result) {
  //   const canvas: HTMLCanvasElement | null = document.getElementById(
  //     "overlay",
  //   ) as HTMLCanvasElement;
  //   //   // if (canvas == null) {
  //   //   //   setTimeout(() => onPlay());
  //   //   //   return;
  //   //   // }
  //   //   // const ctx = canvas.getContext("2d");

  //   const dims = faceapi.matchDimensions(
  //     canvas,
  //     _videoEl,
  //     true,
  //   );
  //   //   // console.log({ ctx });
  //   //   // ctx?.drawImage(
  //   //   //   videoEl,
  //   //   //   0,
  //   //   //   0,
  //   //   //   // canvas.width,
  //   //   //   // canvas.height,
  //   //   // );
  //   const resizedResult = faceapi.resizeResults(
  //     result,
  //     dims,
  //   );
  //   //   console.log({ resizedResult });
  //   //   // console.log({ dims, resizedResult });
  //   extractHeadPoseInfo(resizedResult, dims);

  //   //   if (withFaceApiJsDebug) {
  //   //     // faceapi.draw.drawDetections(canvas, resizedResult);
  //   //     // faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
  //   //   }
  // }
  threeManager.render();

  setTimeout(() => onPlay());
}

const initThree = () => {
  if (
    _videoEl == null ||
    _videoEl.paused ||
    _videoEl.ended
  ) {
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

  _videoTexture = _gl.createTexture();

  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);

  threeManager.start({
    videoElement: _videoEl!,
    canvasElement: canvas,
    videoTexture: _videoTexture!,
    GL: _gl!,
  });

  onPlay();
};

const downloadModelsAndRun = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://192.168.0.108:3007/",
  );

  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(
    "https://192.168.0.108:3007/",
  );
  // changeInputSize(128);

  // try to access users webcam and stream the images
  // to the video element
  const stream = await navigator.mediaDevices.getUserMedia(
    cameraConfig,
  );

  const video = document.createElement("video");
  video.setAttribute("autoplay", "true");
  video.srcObject = stream;
  _videoEl = video;

  // const _videoEl = document.getElementById(
  //   "inputVideo",
  // ) as HTMLVideoElement;
  // _videoEl.srcObject = stream;

  // onPlay();
  initThree();
};

downloadModelsAndRun();
