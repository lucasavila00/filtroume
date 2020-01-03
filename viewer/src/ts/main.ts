import { updateTimeStats } from "./stats";
import * as threeManager from "./three/main";
import { drawOnVideoTexture } from "./three/video";
import { extractHeadPoseInfo } from "./pose/process";
import {
  loadLayersModel,
  LayersModel,
} from "@tensorflow/tfjs-layers";
import { getInfo, IInfo } from "./info";
import * as blazeface from "@tensorflow-models/blazeface";
import { BlazeFaceModel } from "@tensorflow-models/blazeface/dist/face";

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
const getBestPrediction = (
  ps: blazeface.NormalizedFace[],
): blazeface.NormalizedFace => {
  return ps.sort((a, b) => {
    const ap = a.probability;
    const bp = b.probability;
    if (typeof ap === "number" && typeof bp === "number") {
      return bp - ap;
    }
    return 0;
  })[0];
};
const normalizeLandmarks = (lmks: number[][]) => {
  return lmks.map(point => {
    const x = point[0] / _videoEl!.videoWidth;
    const y = 1 - point[1] / _videoEl!.videoHeight;

    return [x, y];
  });
};
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

  const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
  const ts = Date.now();

  const predictions = await model2.estimateFaces(
    _videoEl,
    returnTensors,
  );
  updateTimeStats(Date.now() - ts);

  if (predictions.length > 0) {
    const { landmarks } = getBestPrediction(predictions);
    const normalized = normalizeLandmarks(
      landmarks as number[][],
    );
    extractHeadPoseInfo(normalized, model!);
  }

  threeManager.render({
    foundFace: predictions.length > 0,
  });
  setTimeout(() => renderLoop());
};

const BUTTON_ID = "ss_btn";
const prepareSceneAndRun = async (info: IInfo) => {
  if (
    _videoEl == null ||
    _videoEl.paused ||
    _videoEl.ended
  ) {
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
let model2: BlazeFaceModel;

const prepareModels = async () => {
  console.log("prepareModels started");

  model2 = await blazeface.load();

  try {
    model = await loadLayersModel(
      "https://filterme.firebaseapp.com/mdl2/model.json",
    );
  } catch (err) {
    console.error(err);
  }

  console.log("prepareModels ended");
};
const getStream = async (canvas: HTMLCanvasElement) => {
  const commonOpts = {
    width: { max: 720 },
    height: { max: 720 },
    aspectRatio:
      window.innerHeight > window.innerWidth
        ? canvas.height / canvas.width
        : canvas.width / canvas.height,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      {
        audio: false,
        video: {
          ...commonOpts,
          // we try with exact because otherwise iPhones will use
          // the back camera
          facingMode: { exact: "user" },
        },
      },
    );

    return stream;
  } catch (err) {
    console.error("error while getting media...");
    // using exact with a chromebook will error
    // even though it only has one camera and is facing the user
    // using the facingMode contraint like this works, though
    const stream = await navigator.mediaDevices.getUserMedia(
      {
        audio: false,
        video: {
          ...commonOpts,
          facingMode: "user",
        },
      },
    );

    return stream;
  }
};
const prepareVideo = async () => {
  // we assume that the canvas was created and it will be found,
  // that's why the cast is safe.
  const canvas: HTMLCanvasElement = document.getElementById(
    CANVAS_ID,
  ) as HTMLCanvasElement;

  // TODO: try optimizing the app so that bigger resolutions
  // could be supported

  const stream = await getStream(canvas);

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
    const res = await Promise.all([
      getInfo(),
      prepareModels(),
      sizeCanvas().then(prepareVideo),
    ]);

    let info = res[0];
    if (!info) {
      if (process.env.NODE_ENV === "development") {
        info = {
          lut: {
            url: "https://localhost:3007/luts/hpbb.png",
            size: 16,
          },
          images: {
            center: "https://localhost:3007/luts/lut0.png",
          },
          pathname: "abc",
        };
      } else {
        showErrorMessage(ErrorKind.noinfo);
        return;
      }
    }

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
