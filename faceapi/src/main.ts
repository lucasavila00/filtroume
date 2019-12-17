import * as faceapi from "face-api.js";
import { getFaceDetectorOptions } from "./controls";
import { updateTimeStats } from "./stats";
import * as threeManager from "./three/main";
import { cameraConfig } from "./constants";
import { drawOnVideoTexture } from "./three/video";
import { extractHeadPoseInfo } from "./pose/process";

let _videoEl: HTMLVideoElement | null = null;
let _videoTexture: WebGLTexture | null = null;
let _gl: WebGLRenderingContext | null = null;

async function onPlay(): Promise<void> {
  if (
    _videoEl == null ||
    _videoEl.paused ||
    _videoEl.ended
  ) {
    setTimeout(() => onPlay());
    return;
  }
  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);

  const options = getFaceDetectorOptions();

  const ts = Date.now();
  let result = await faceapi
    .detectSingleFace(_videoEl, options)
    .withFaceLandmarks(true);

  updateTimeStats(Date.now() - ts);

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

  setTimeout(() => onPlay());
}

const initThree = () => {
  if (
    _videoEl == null ||
    _videoEl.paused ||
    _videoEl.ended
  ) {
    setTimeout(initThree, 16);
    return;
  }
  const canvas: HTMLCanvasElement | null = document.getElementById(
    "overlay",
  ) as HTMLCanvasElement;

  canvas.width = _videoEl.videoWidth;
  canvas.height = _videoEl.videoHeight;

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

  // try to access users webcam and stream the images
  // to the video element
  const stream = await navigator.mediaDevices.getUserMedia(
    cameraConfig,
  );

  const video = document.createElement("video");
  video.setAttribute("autoplay", "true");
  video.srcObject = stream;
  _videoEl = video;

  initThree();
};

downloadModelsAndRun();
