import * as faceapi from "face-api.js";
import { getFaceDetectorOptions } from "./controls";
import { updateTimeStats } from "./stats";
import * as threeManager from "./three/main";
// import { cameraConfig } from "./constants";
import { drawOnVideoTexture } from "./three/video";
import {
  extractHeadPoseInfo,
  // resetPred,
} from "./pose/process";
import { openCvReady } from "./pose/ready";
import { size_canvas } from "./three/canvas";
import * as tf from "@tensorflow/tfjs";
// declare var WebGLDebugUtils: any;
let i = 0;
let _videoEl: HTMLVideoElement | null = null;
let _videoTexture: WebGLTexture | null = null;
let _gl: WebGLRenderingContext | null = null;
let _fb: WebGLFramebuffer | null = null;

const toPython = (x: any[]) => {
  let temp: any = [];
  for (let index = 0; index < x.length; index += 2) {
    const element = x[index];
    const element2 = x[index + 1];
    temp = [...temp, [element, element2]];
  }

  // console.log(JSON.stringify(temp));
};

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

  const options = getFaceDetectorOptions();

  const ts = Date.now();
  let result = await faceapi
    .detectSingleFace(_videoEl, options)
    .withFaceLandmarks(true);
  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);

  updateTimeStats(Date.now() - ts);

  if (result) {
    const dims = {
      width: 1,
      height: 1,
    };

    const resizedResult = faceapi.resizeResults(
      result,
      dims,
    );
    extractHeadPoseInfo(resizedResult, async example => {
      const prediction = model?.predict(
        [tf.tensor([...example.data64F], [1, 10, 2])],
        { batchSize: 1 },
      );
      toPython([...example.data64F]);
      if (prediction instanceof Array) {
        throw "awaited one";
        // prediction.forEach(x => console.warn(x.dataSync()));
      } else {
        const data = await prediction.data();

        return {
          rvec: [data[0], data[1], data[2]],
          tvec: [data[3], data[4], data[5]],
        };
        // console.log();
      }
      // console.log({ example, prediction });
    });
  } else {
    // resetPred();
  }
  threeManager.render(!!result);
  // if (i < 25) {
  // i++;
  setTimeout(() => renderLoop());
  // }
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

  _fb = _gl.createFramebuffer();
  _gl.bindTexture(_gl.TEXTURE_2D, _videoTexture);

  // make this the current frame buffer
  _gl.bindFramebuffer(_gl.FRAMEBUFFER, _fb);

  // attach the texture to the framebuffer.
  _gl.framebufferTexture2D(
    _gl.FRAMEBUFFER,
    _gl.COLOR_ATTACHMENT0,
    _gl.TEXTURE_2D,
    _videoTexture,
    0,
  );
  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);
  // check if you can read from this type of texture.
  // const canRead =
  //   _gl.checkFramebufferStatus(_gl.FRAMEBUFFER) ==
  //   _gl.FRAMEBUFFER_COMPLETE;
  // console.log({ canRead });
  _gl.bindTexture(_gl.TEXTURE_2D, null);

  // Unbind the framebuffer
  _gl.bindFramebuffer(_gl.FRAMEBUFFER, null);
  await threeManager.start({
    videoElement: _videoEl!,
    canvasElement: canvas,
    videoTexture: _videoTexture!,
    GL: _gl!,
  });

  renderLoop();
  console.log("prepareSceneAndRun ended");
};

let model: tf.LayersModel;

const prepareModels = async () => {
  console.log("prepareModels started");

  await faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://filterme.firebaseapp.com/weights/",
  );

  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(
    "https://filterme.firebaseapp.com/weights/",
  );
  try {
    model = await tf.loadLayersModel(
      "https://localhost:3007/mdl/model.json",
    );
  } catch (err) {
    console.error(err);
  }

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
  // await openCvReady();
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
