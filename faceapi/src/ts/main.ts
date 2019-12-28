import * as faceapi from "face-api.js";
import { getFaceDetectorOptions } from "./controls";
import { updateTimeStats } from "./stats";
import * as threeManager from "./three/main";
import { drawOnVideoTexture } from "./three/video";
import { extractHeadPoseInfo } from "./pose/process";
import {
  loadLayersModel,
  LayersModel,
} from "@tensorflow/tfjs-layers";
import { getInfo, IInfo } from "./info";
// import * as tf from "@tensorflow/tfjs-core";

const CANVAS_ID = "overlay";

let _videoEl: HTMLVideoElement | null = null;
let _videoTexture: WebGLTexture | null = null;
let _gl: WebGLRenderingContext | null = null;
let _frameBuffer: WebGLFramebuffer | null = null;

// let pixels: Uint8Array;

// const extractTensorFromFrameBuffer = (): tf.Tensor3D => {
//   const x = 0;
//   const y = 0;
//   const width = _videoEl?.videoWidth!;
//   const height = _videoEl?.videoHeight!;
//   const format = _gl!.RGB;
//   const type = _gl!.UNSIGNED_BYTE;
//   if (pixels == null) {
//     pixels = new Uint8Array(width * height * 3);
//   }
//   _gl!.bindFramebuffer(_gl!.FRAMEBUFFER, _frameBuffer);
//   _gl!.readPixels(
//     x,
//     y,
//     width,
//     height,
//     format,
//     type,
//     pixels,
//   );
//   return tf.tensor(pixels, [height, width, 3]);
// };
const renderLoop = async () => {
  if (_videoEl == null || _videoEl.ended) {
    setTimeout(() => renderLoop());
    return;
  }
  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);
  // const inputSize = 128;
  // let tensorData = extractTensorFromFrameBuffer();
  // const td = tf.image
  //   .resizeBilinear(tensorData, [inputSize, inputSize])
  //   .as3D(inputSize, inputSize, 3);
  // let batchTensor = tf
  //   .stack([td].map(t => t.toFloat()))
  //   .as4D(1, inputSize, inputSize, 3);

  // // let batchTensor = tensorData.toBatchTensor(128, false).toFloat()
  // batchTensor = batchTensor.div(
  //   tf.scalar(256),
  // ) as tf.Tensor4D;

  const options = getFaceDetectorOptions();

  const ts = Date.now();
  let result = await faceapi
    .detectSingleFace(_videoEl, options)
    .withFaceLandmarks(true);

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
    extractHeadPoseInfo(resizedResult, model!);
  }
  threeManager.render({ foundFace: !!result });
  setTimeout(() => renderLoop());
};

const BUTTON_ID = "ss_btn";
const prepareSceneAndRun = async (info: IInfo) => {
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
    CANVAS_ID,
  ) as HTMLCanvasElement;

  _gl = canvas.getContext("webgl");

  if (_gl == null) {
    console.error(
      "Webgl context could not be found... Trying again in 16ms.",
    );
    setTimeout(prepareSceneAndRun, 16);
    return;
  }

  _videoTexture = _gl.createTexture();

  _frameBuffer = _gl.createFramebuffer();
  _gl.bindTexture(_gl.TEXTURE_2D, _videoTexture);

  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);
  // check if you can read from this type of texture.
  // make this the current frame buffer
  _gl.bindFramebuffer(_gl.FRAMEBUFFER, _frameBuffer);

  // attach the texture to the framebuffer.
  _gl.framebufferTexture2D(
    _gl.FRAMEBUFFER,
    _gl.COLOR_ATTACHMENT0,
    _gl.TEXTURE_2D,
    _videoTexture,
    0,
  );

  _gl.bindTexture(_gl.TEXTURE_2D, null);

  _gl.bindFramebuffer(_gl.FRAMEBUFFER, null);

  await threeManager.start({
    videoElement: _videoEl!,
    canvasElement: canvas,
    videoTexture: _videoTexture!,
    GL: _gl!,
    buttonId: BUTTON_ID,
    info,
  });

  renderLoop();
};

let model: LayersModel;

const prepareModels = async () => {
  console.log("prepareModels started");

  await faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://filterme.firebaseapp.com/weights/",
  );

  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(
    "https://filterme.firebaseapp.com/weights/",
  );
  try {
    model = await loadLayersModel(
      "https://filterme.firebaseapp.com/mdl/model.json",
    );
  } catch (err) {
    console.error(err);
  }

  console.log("prepareModels ended");
};

const prepareVideo = async () => {
  // we assume that the canvas was created and it will be found,
  // that's why the cast is safe.
  const canvas: HTMLCanvasElement = document.getElementById(
    CANVAS_ID,
  ) as HTMLCanvasElement;

  // TODO: try optimizing the app so that bigger resolutions
  // could be supported
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: { max: 720 },
      height: { max: 720 },
      aspectRatio:
        window.innerHeight > window.innerWidth
          ? canvas.height / canvas.width
          : canvas.width / canvas.height,
      facingMode: "user",
    },
  });

  const video = document.createElement("video");
  // I really don't know if all of this is needed but if
  // all of this is set this way then it will work on iPhone.
  // Sadly I don't have and iPhone at hands to see what's really needed.
  video.setAttribute("autoplay", "true");
  video.setAttribute("playsinline", "true");
  video.setAttribute("muted", "true");
  video.setAttribute("loop", "true");
  video.setAttribute("controls", "true");
  video.srcObject = stream;
  await video.play();
  _videoEl = video;
};

const delay = (delay: number) =>
  new Promise(rs => setTimeout(rs, delay));

const sizeCanvas = async (): Promise<void> => {
  const canvas: HTMLCanvasElement | null = document.getElementById(
    CANVAS_ID,
  ) as HTMLCanvasElement;

  if (!canvas) {
    // canvas not initialized yet
    // wait 16ms and try again
    await delay(16);
    return sizeCanvas();
  }

  canvas.setAttribute("width", String(window.innerWidth));
  canvas.setAttribute("height", String(window.innerHeight));
};

const removeLoading = () => {
  const el = document.getElementById("loading");

  el!.style.display = "none";
};
const showDownloadButton = () => {
  const el = document.getElementById(BUTTON_ID);
  el!.style.display = "inline";
};

enum ErrorKind {
  noinfo,
  // nocam,
  unknown,
}
const showErrorMessage = (k: ErrorKind) => {
  const el = document.getElementById("err_wrapper");
  el!.style.display = "flex";
  if (k === ErrorKind.noinfo) {
    el!.innerHTML = `This filter could not be found<a href="https://filtrou.me">Click here to create a new filter</a>`;
  } else {
    el!.innerHTML =
      "Error loading filter. Check your internet connection and if you have a camera.";
  }
};
const main = async () => {
  try {
    let info = await getInfo();
    if (!info) {
      showErrorMessage(ErrorKind.noinfo);
      // info = {
      //   lut: {
      //     url: "https://localhost:3007/luts/lut0.png",
      //     size: 16,
      //   },
      //   images: {
      //     center: "https://localhost:3007/luts/lut0.png",
      //   },
      //   pathname: "abc",
      // };
      // // return info;
      // // display error info
      // console.error("info not found!!!!");
      return;
    }

    await Promise.all([
      prepareModels(),
      sizeCanvas().then(prepareVideo),
    ]);
    await prepareSceneAndRun(info);
    showDownloadButton();
  } catch (err) {
    console.error(err);
    showErrorMessage(ErrorKind.unknown);
  } finally {
    removeLoading();
  }
};
main();
