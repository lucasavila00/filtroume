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
import {
  loadLayersModel,
  LayersModel,
} from "@tensorflow/tfjs-layers";
import * as tf from "@tensorflow/tfjs-core";

// import {loadLayersModel, LayersModel} from "@tensorflow/tfjs-layers/dist/exports"
// import {} from "@tensorflow/tfjs/dist/"
// declare var WebGLDebugUtils: any;
let _videoEl: HTMLVideoElement | null = null;
let _videoTexture: WebGLTexture | null = null;
let _gl: WebGLRenderingContext | null = null;
let _frameBuffer: WebGLFramebuffer | null = null;
let i = 0;
const toPython = (x: any[]) => {
  let temp: any = [];
  for (let index = 0; index < x.length; index += 2) {
    const element = x[index];
    const element2 = x[index + 1];
    temp = [...temp, [element, element2]];
  }

  // console.log(JSON.stringify(temp));
};
let pixels: Uint8Array;
const extractTensorFromFrameBuffer = (): tf.Tensor3D => {
  const x = 0;
  const y = 0;
  const width = _videoEl?.videoWidth!;
  const height = _videoEl?.videoHeight!;
  const format = _gl!.RGB;
  const type = _gl!.UNSIGNED_BYTE;
  if (pixels == null) {
    pixels = new Uint8Array(width * height * 3);
  }
  _gl!.bindFramebuffer(_gl!.FRAMEBUFFER, _frameBuffer);
  _gl!.readPixels(
    x,
    y,
    width,
    height,
    format,
    type,
    pixels,
  );
  return tf.tensor(pixels, [height, width, 3]);
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
  drawOnVideoTexture(_gl!, _videoTexture!, _videoEl);

  // const tensorData = extractTensorFromFrameBuffer();

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
    extractHeadPoseInfo(resizedResult, async example => {
      toPython(example);
      const prediction = model?.predict(
        [
          tf.tensor(
            [...example],
            // .map((p, i) =>
            //   i % 2 == 0 ? p : 1 - p,
            // )
            [1, 10, 2],
          ),
        ],
        { batchSize: 1 },
      );
      // console.log(JSON.stringify([...example]));
      // toPython([...example]);
      if (prediction instanceof Array) {
        throw "awaited one";
        // prediction.forEach(x => console.warn(x.dataSync()));
      } else {
        const data = await prediction.data();

        return { data: [...data] };
        // console.log();
      }
      // console.log({ example, prediction });
    });
  } else {
    // console.log("did not get resul");
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

const prepareVideo = async ({}: // idealWidth,
// idealHeight,
{
  idealWidth: number;
  idealHeight: number;
}) => {
  console.log("prepareVideo started");
  const canvas: HTMLCanvasElement | null = document.getElementById(
    "overlay",
  ) as HTMLCanvasElement;
  // try to access users webcam and stream the images
  // to the video element
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
    // video: {
    //   width: {
    //     ideal: idealWidth,
    //   },
    //   height: {
    //     ideal: idealHeight,
    //   },
    // },
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

const size_canvas = (cb: () => void) => {
  const canvas: HTMLCanvasElement | null = document.getElementById(
    "overlay",
  ) as HTMLCanvasElement;

  if (!canvas) {
    console.log("camvas not found");
    setTimeout(() => size_canvas(cb), 16);
    return;
    // throw Error("canvas not found on size canvas");
  }
  const sizes = [
    window["innerWidth"],
    window["innerHeight"],
  ];

  canvas.setAttribute("width", String(sizes[0]));
  canvas.setAttribute("height", String(sizes[1]));
  cb();
};
const main = async () => {
  console.log("main started");

  //   size_canvas({
  //     canvasId: "overlay",
  //     callback: async function(isError, bestVideoSettings) {
  //       if (isError) {
  //         // showError("jeeliz");
  //       } else {
  // init_faceFilter(bestVideoSettings, info);
  // showTutorial();
  // if (info.pathname) {
  // showInfoPathname(info.pathname);
  //   // }
  // const  fixOrientation = function(w, h)  {
  //     var md = new MobileDetect(window.navigator.userAgent),  d = {
  //         w: w,
  //         h: h
  //     };

  //     if (md.phone() || md.tablet()) {
  //         if (window.matchMedia('(orientation:portrait)').matches) {
  //             if (md.userAgent() !== 'Safari') {
  //                 d.w = h;
  //                 d.h = w;
  //             }
  //         }
  //     }

  //     return d;
  // }
  size_canvas(async () => {
    await Promise.all([
      prepareModels(),
      prepareVideo({ idealHeight: 720, idealWidth: 1280 }),
    ]);

    prepareSceneAndRun();
    console.log(
      "main ended... we depend on the render loop",
    );
  });
  // }
  //     },
  //     onResize: function() {
  //       // THREE.JeelizHelper.update_camera(THREECAMERA);
  //     },
  //   });
};
main();
