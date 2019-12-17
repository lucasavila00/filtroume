import * as THREE from "three";
import { processTvec, processRVec } from "./kalman";
import { getInfo, IInfo } from "./info";
import {
  // BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";
import {
  ColorTransformEffect,
  makeLUTTexture,
} from "./lut";

const clock = new THREE.Clock();

let _threeCompositeObject: THREE.Object3D;
let _threeVideoTexture: THREE.DataTexture;
let _threeVideoMesh: THREE.Mesh;
let _threeScene: THREE.Scene;
let _threeRenderer: THREE.WebGLRenderer;
let _glVideoTexture: WebGLTexture;
let _faceFilterCv: HTMLCanvasElement;
let _gl: WebGLRenderingContext;
let _videoElement: HTMLVideoElement;
let _threeCamera: THREE.PerspectiveCamera;

let _threeComposer: any;
let _lutEf: any;

let _isVideoTextureReady = false;

export const gotTvec = (
  x: number,
  y: number,
  z: number,
) => {
  const filtered = processTvec({ x, y, z });
  _threeCamera!.position.set(
    filtered.x,
    filtered.y,
    filtered.z,
  );
};

export const gotRvec = (
  rvec: import("../opencv/Mat").Mat,
) => {
  const { x, y, z } = processRVec(rvec);
  _threeCamera!.rotation.x = x;
  _threeCamera!.rotation.y = y;
  _threeCamera!.rotation.z = z;
};

export const render = (foundFace: boolean) => {
  _threeRenderer?.state.reset();
  _threeCompositeObject.visible = foundFace;
  // _threeRenderer?.render(_threeScene!, _threeCamera!);
  _threeComposer.render(clock.getDelta());
};

export const start = ({
  videoElement,
  canvasElement,
  videoTexture,
  GL,
}: {
  videoElement: HTMLVideoElement;
  canvasElement: HTMLCanvasElement;
  videoTexture: WebGLTexture;
  GL: WebGLRenderingContext;
}) => {
  _glVideoTexture = videoTexture;
  _gl = GL;
  _faceFilterCv = canvasElement;
  _videoElement = videoElement;

  const info = getInfo();

  _threeRenderer = new THREE.WebGLRenderer({
    context: _gl!,
    canvas: _faceFilterCv!,
    alpha: false,
  });

  _threeScene = new THREE.Scene();

  create_videoScreen();

  init_threeScene(info.images.center);

  _threeCamera = create_camera();

  initComposer(info);
};
const initComposer = (info: IInfo) => {
  const rtParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
  };
  _threeComposer = new EffectComposer(
    _threeRenderer,
    new THREE.WebGLRenderTarget(1, 1, rtParameters),
  );

  _lutEf = new ColorTransformEffect({
    lutTexture: makeLUTTexture(info.lut, _lutEf),
  });
  const effectPass = new EffectPass(
    _threeCamera,
    _lutEf,
    // new BloomEffect({ luminanceThreshold: 0.5 }),
  );
  effectPass.renderToScreen = true;
  _threeComposer.addPass(
    new RenderPass(_threeScene, _threeCamera),
  );

  _threeComposer.addPass(effectPass);
  _threeComposer.setSize(
    _faceFilterCv!.width,
    _faceFilterCv!.height,
  );
};

const init_threeScene = (imgUrl: string) => {
  _threeCompositeObject = new THREE.Object3D();
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(imgUrl),
    transparent: true,
  });
  const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1500, 1500),
    planeMaterial,
  );

  _threeCompositeObject.add(planeMesh);
  _threeScene!.add(_threeCompositeObject);
  // lines();
};

const create_videoScreen = () => {
  const videoScreenVertexShaderSource =
    "attribute vec2 position;\n\
  varying vec2 vUV;\n\
  void main(void){\n\
    gl_Position = vec4(position, 0., 1.);\n\
    vUV = 0.5+0.5*position;\n\
  }";

  const videoScreenFragmentShaderSource =
    "precision lowp float;\n\
  uniform sampler2D samplerVideo;\n\
  varying vec2 vUV;\n\
  void main(void){\n\
    gl_FragColor = texture2D(samplerVideo, vec2(vUV.x, vUV.y));\n\
  }";

  //init video texture with red
  _threeVideoTexture = new THREE.DataTexture(
    new Uint8Array([255, 0, 0]),
    1,
    1,
    THREE.RGBFormat,
  );
  _threeVideoTexture.needsUpdate = true;

  //CREATE THE VIDEO BACKGROUND
  const videoMaterial = new THREE.RawShaderMaterial({
    depthWrite: false,
    depthTest: false,
    vertexShader: videoScreenVertexShaderSource,
    fragmentShader: videoScreenFragmentShaderSource,
    uniforms: {
      samplerVideo: { value: _threeVideoTexture },
    },
  });
  const videoGeometry = new THREE.BufferGeometry();
  const videoScreenCorners = new Float32Array([
    -1,
    -1,
    1,
    -1,
    1,
    1,
    -1,
    1,
  ]);
  videoGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(videoScreenCorners, 2),
  );
  videoGeometry.setIndex(
    new THREE.BufferAttribute(
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      1,
    ),
  );
  _threeVideoMesh = new THREE.Mesh(
    videoGeometry,
    videoMaterial,
  );
  apply_videoTexture(_threeVideoMesh);
  _threeVideoMesh.renderOrder = -1000; //render first
  _threeVideoMesh.frustumCulled = false;
  _threeScene!.add(_threeVideoMesh);
};
const apply_videoTexture = (threeMesh: THREE.Mesh) => {
  if (_isVideoTextureReady) {
    return;
  }
  threeMesh.onAfterRender = function() {
    // Replace _threeVideoTexture.__webglTexture by the real video texture:
    try {
      _threeRenderer!.properties.update(
        _threeVideoTexture,
        "__webglTexture",
        _glVideoTexture,
      );
      _threeVideoTexture!.magFilter = THREE.LinearFilter;
      _threeVideoTexture!.minFilter = THREE.LinearFilter;
      _isVideoTextureReady = true;
      // console.log("updated...");
    } catch (e) {
      console.log(
        "WARNING in THREE.JeelizHelper : the glVideoTexture is not fully initialized",
      );
    }
    delete threeMesh.onAfterRender;
  };
};

const create_camera = function(
  zNear?: number,
  zFar?: number,
) {
  const threeCamera = new THREE.PerspectiveCamera(
    1,
    1,
    zNear ? zNear : 0.1,
    zFar ? zFar : 10000,
  );
  const _settings = {
    cameraMinVideoDimFov: 28, //Field of View for the smallest dimension of the video in degrees
  };
  // compute aspectRatio:
  const canvasElement = _threeRenderer!.domElement;
  const cvw = canvasElement.width;
  const cvh = canvasElement.height;
  // console.log({ cvw, cvh });
  const canvasAspectRatio = cvw / cvh;

  // compute vertical field of view:
  const vw = _videoElement!.videoWidth;
  const vh = _videoElement!.videoHeight;
  const videoAspectRatio = vw / vh;
  const fovFactor = vh > vw ? 1.0 / videoAspectRatio : 1.0;
  // const fovh = 2 * Math.atan(cvh / (2 * cvw));
  // const fovw = 2 * Math.atan(cvw / (2 * cvw));
  // const fov = vh > vw ? fovh : fovw;
  const fov = _settings.cameraMinVideoDimFov * fovFactor;

  // console.log({ fovFactor, fovh, fovw });

  // compute X and Y offsets in pixels:
  let scale = 1.0;
  if (canvasAspectRatio > videoAspectRatio) {
    // the canvas is more in landscape format than the video, so we crop top and bottom margins:
    scale = cvw / vw;
  } else {
    // the canvas is more in portrait format than the video, so we crop right and left margins:
    scale = cvh / vh;
  }
  const cvws = vw * scale,
    cvhs = vh * scale;
  const offsetX = (cvws - cvw) / 2.0;
  const offsetY = (cvhs - cvh) / 2.0;
  // _scaleW = cvw / cvws;
  // console.log({ _scaleW, offsetX, offsetY });

  // apply parameters:
  threeCamera.aspect = canvasAspectRatio;

  threeCamera.fov = fov;

  // console.log({ offsetX, offsetY });

  threeCamera.setViewOffset(
    cvws,
    cvhs,
    offsetX,
    offsetY,
    cvw,
    cvh,
  );
  threeCamera.updateProjectionMatrix();

  // update drawing area:
  _threeRenderer!.setSize(cvw, cvh);
  _threeRenderer!.setViewport(0, 0, cvw, cvh);
  return threeCamera;
};
