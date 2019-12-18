import * as faceapi from "face-api.js";
import { getFaceDetectorOptions } from "./controls";
import { updateTimeStats } from "./stats";
import * as threeManager from "./three/main";
import { cameraConfig } from "./constants";
import { drawOnVideoTexture } from "./three/video";
import {
  extractHeadPoseInfo,
  resetPred,
} from "./pose/process";
import { openCvReady } from "./pose/ready";
import { size_canvas } from "./three/canvas";
// declare var WebGLDebugUtils: any;

let _videoEl: HTMLVideoElement | null = null;
let _videoTexture: WebGLTexture | null = null;
let _gl: WebGLRenderingContext | null = null;

const renderLoop = async () => {
  // console.log("renderLoop started");
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

  if (result) {
    // console.log("got results");
    const dims = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const resizedResult = faceapi.resizeResults(
      result,
      dims,
    );

    extractHeadPoseInfo(resizedResult, dims);
  } else {
    resetPred();
  }
  threeManager.render(!!result);

  setTimeout(() => renderLoop());
  // console.log("renderLoop ended");
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

  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  // canvas.width = _videoEl.videoWidth;
  // canvas.height = _videoEl.videoHeight;

  // const canvas2: HTMLCanvasElement | null = document.getElementById(
  //   "overlay2",
  // ) as HTMLCanvasElement;

  // canvas2.width = _videoEl.videoWidth;
  // canvas2.height = _videoEl.videoHeight;

  // canvas2.width = window.innerWidth;
  // canvas2.height = window.innerHeight;

  // _gl = WebGLDebugUtils.makeDebugContext(
  //   canvas.getContext("webgl"),
  // );

  _gl = canvas.getContext("webgl");

  // ctx = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"));

  if (_gl == null) {
    console.error("does not have gl");
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

const prepareVideo = async ({
  idealWidth,
  idealHeight,
}: {
  idealWidth: number;
  idealHeight: number;
}) => {
  console.log("prepareVideo started");
  // try to access users webcam and stream the images
  // to the video element
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: {
        ideal: idealWidth,
      },
      height: {
        ideal: idealHeight,
      },
      facingMode: "user",
    },
  });

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

  size_canvas({
    isFullScreen: true,
    canvasId: "overlay",

    callback: async function(isError, bestVideoSettings) {
      if (isError) {
        // showError("jeeliz");
      } else {
        // init_faceFilter(bestVideoSettings, info);
        // showTutorial();
        // if (info.pathname) {
        // showInfoPathname(info.pathname);
        // }
        await Promise.all([
          prepareModels(),
          prepareVideo(bestVideoSettings),
        ]);

        prepareSceneAndRun();
        console.log(
          "main ended... we depend on the render loop",
        );
      }
    },
    onResize: function() {
      // THREE.JeelizHelper.update_camera(THREECAMERA);
    },
  });
};
main();
