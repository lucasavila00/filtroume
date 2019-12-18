import * as faceapi from "face-api.js";
import { getFaceDetectorOptions } from "./controls";
import { updateTimeStats } from "./stats";
import * as threeManager from "./three/main";
import { cameraConfig } from "./constants";
import { drawOnVideoTexture } from "./three/video";
import { extractHeadPoseInfo } from "./pose/process";
import { openCvReady } from "./pose/ready";

let _videoEl: HTMLVideoElement | null = null;
let _videoTexture: WebGLTexture | null = null;
let _gl: WebGLRenderingContext | null = null;

const renderLoop = async () => {
  console.log("renderLoop started");
  if (
    _videoEl == null ||
    // _videoEl.paused ||
    _videoEl.ended
  ) {
    setTimeout(() => renderLoop());
    return;
  }
  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);

  const options = getFaceDetectorOptions();

  const ts = Date.now();
  let result = await faceapi
    .detectSingleFace(_videoEl, options)
    .withFaceLandmarks(true);

  updateTimeStats(Date.now() - ts);
  console.log({ result });
  if (result) {
    const dims = {
      width: _videoEl.videoWidth,
      height: _videoEl.videoHeight,
    };

    const resizedResult = faceapi.resizeResults(
      result,
      dims,
    );

    extractHeadPoseInfo(resizedResult, dims);
  }
  threeManager.render(!!result);

  setTimeout(() => renderLoop());
  console.log("renderLoop ended");
};

const prepareSceneAndRun = async () => {
  console.log("prepareSceneAndRun started");
  console.log({
    _videoEl,
    paused: _videoEl?.paused,
    ended: _videoEl?.ended,
  });
  if (
    _videoEl == null ||
    _videoEl.paused ||
    _videoEl.ended
  ) {
    console.log({
      _videoEl,
      paused: _videoEl?.paused,
      ended: _videoEl?.ended,
    });
    console.log("does not have _videoEl");
    setTimeout(prepareSceneAndRun, 16);
    return;
  }
  const canvas: HTMLCanvasElement | null = document.getElementById(
    "overlay",
  ) as HTMLCanvasElement;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  _gl = canvas.getContext("webgl");

  if (_gl == null) {
    console.log("does not have gl");
    setTimeout(prepareSceneAndRun, 16);
    return;
  }

  _videoTexture = _gl.createTexture();

  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);

  await threeManager.start({
    videoElement: _videoEl!,
    canvasElement: canvas,
    videoTexture: _videoTexture!,
    GL: _gl!,
  });

  renderLoop();
  console.log("prepareSceneAndRun ended");
};

const prepareModels = async () => {
  console.log("prepareModels started");

  await faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://filterme.firebaseapp.com/weights/",
  );

  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(
    "https://filterme.firebaseapp.com/weights/",
  );
  console.log("prepareModels ended");
};

const prepareVideo = async () => {
  console.log("prepareVideo started");
  // try to access users webcam and stream the images
  // to the video element
  const stream = await navigator.mediaDevices.getUserMedia(
    cameraConfig,
  );

  const video = document.createElement("video");
  video.setAttribute("autoplay", "true");
  video.setAttribute("playsinline", "true");
  video.setAttribute("muted", "true");
  video.setAttribute("loop", "true");
  video.setAttribute("controls", "true");
  video.srcObject = stream;
  await video.play();
  await openCvReady();
  // stream.onaddtrack()
  // video.play();
  _videoEl = video;
  console.log("prepareVideo ended");
};

const main = async () => {
  console.log("main started");
  await prepareModels();
  await prepareVideo();
  await prepareSceneAndRun();
  console.log("main ended... we depend on the render loop");
};
main();
