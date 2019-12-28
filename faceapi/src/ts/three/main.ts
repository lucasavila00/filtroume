import * as THREE from "three";
import { IInfo } from "../info";
import {
  // BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";
import {
  ColorTransformEffect,
  makeIdentityLutTexture,
} from "./lut";
import { calcCameraParams } from "./camera";
import { registerDownloadButton } from "./download";
// import { lines } from "../debugPaint";

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
  const vw = _videoElement.videoWidth;
  const vh = _videoElement.videoHeight;
  const videoAspectRatio = vw / vh;

  _threeCompositeObject!.position.set(
    x,
    y / videoAspectRatio,
    z,
  );
};

export const gotRvec = (q: THREE.Quaternion) => {
  _threeCompositeObject!.rotation.setFromQuaternion(q);
};
const MAXLOCK = 9;
const MINLOCK = -2;
let _lock = 0;
const getFaceThingVisible = (foundFace: boolean) => {
  if (foundFace) {
    _lock = Math.min(MAXLOCK, _lock + 1);
  } else {
    _lock = Math.max(MINLOCK, _lock - 1);
  }
  return _lock > 0;
};

export const render = ({
  foundFace,
}: {
  foundFace: boolean;
}) => {
  _threeRenderer?.state.reset();
  _threeCompositeObject.visible = getFaceThingVisible(
    foundFace,
  );

  _threeComposer.render(clock.getDelta());

  // ugly hack to fix threejs (or threejs postprocessing lib) clearing canvas
  // and making download impossible
  if ((window as any).dlnow) {
    (window as any).dlnow();

    (window as any).dlnow = undefined;
  }
};

export const start = async ({
  videoElement,
  canvasElement,
  videoTexture,
  GL,
  buttonId,
  info,
}: {
  videoElement: HTMLVideoElement;
  canvasElement: HTMLCanvasElement;
  videoTexture: WebGLTexture;
  GL: WebGLRenderingContext;
  buttonId: string;
  info: IInfo;
}) => {
  _glVideoTexture = videoTexture;
  _gl = GL;
  _faceFilterCv = canvasElement;
  _videoElement = videoElement;

  _threeRenderer = new THREE.WebGLRenderer({
    context: _gl!,
    canvas: _faceFilterCv!,
    // alpha: false,
    // For screenshots to work with WebGL renderer, preserveDrawingBuffer should be set to true.
    preserveDrawingBuffer: true,
  });
  // setTimeout(() => {
  registerDownloadButton({
    buttonId,
    renderer: _threeRenderer,
    url: info.pathname
      ? pathnameToUrl(info.pathname)
      : undefined,
  });
  // }, 300);

  _threeScene = new THREE.Scene();

  create_videoScreen();

  init_threeScene(info.images.center);

  _threeCamera = create_camera();

  initComposer(info);
};
const makeLUTTexture = function(info: {
  url: string;
  size: number;
}) {
  const imgLoader = new THREE.ImageLoader();
  const ctx = document
    .createElement("canvas")
    .getContext("2d");
  const texture = makeIdentityLutTexture(
    THREE.LinearFilter,
  );
  if (info.url && ctx) {
    const lutSize = info.size;

    // set the size to 2 (the identity size). We'll restore it when the
    // image has loaded. This way the code using the lut doesn't have to
    // care if the image has loaded or not
    imgLoader.load(info.url, function(image) {
      const width = lutSize * lutSize;
      const height = lutSize;
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(
        0,
        0,
        width,
        height,
      );

      (_lutEf.uniforms as Map<string, THREE.Uniform>).get(
        "lutMapSize",
      )!.value = lutSize;
      (texture.image as any).data = new Uint8Array(
        imageData.data.buffer,
      );
      (texture.image as any).width = width;
      (texture.image as any).height = height;
      texture.needsUpdate = true;
    });
  }

  return texture;
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
    lutTexture: makeLUTTexture(info.lut),
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
const pathnameToUrl = (p: string) => {
  return "filtrou.me/" + p;
};

const init_threeScene = (
  imgUrl: string,
  // pathname?: string,
) => {
  _threeCompositeObject = new THREE.Object3D();
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(imgUrl),
    transparent: true,
  });
  const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(45, 45),
    planeMaterial,
  );
  // _threeCompositeObject.position.setZ(-200);
  const _scale = 1;
  _threeCompositeObject.scale.set(_scale, _scale, _scale);
  _threeCompositeObject.add(planeMesh);
  _threeScene!.add(_threeCompositeObject);
  // if (pathname) {
  //   console.log("got pathname, will add it to scene");
  //   _threeScene!.add(generateUrlTextPlane(pathname));
  // }
  // lines(_threeCompositeObject);
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

  //init video texture with black
  _threeVideoTexture = new THREE.DataTexture(
    new Uint8Array([0, 0, 0]),
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

  apply_videoTexture(_threeVideoMesh);
  _threeVideoMesh.renderOrder = -1000; //render first
  _threeVideoMesh.frustumCulled = false;
  _threeScene!.add(_threeVideoMesh);
};

const create_camera = function(zNear = 0.1, zFar = 10000) {
  const vw = _videoElement.videoWidth;
  const vh = _videoElement.videoHeight;
  const videoAspectRatio = vw / vh;

  const {
    cvws,
    cvhs,
    offsetX,
    offsetY,
    cvw,
    cvh,
  } = calcCameraParams(_threeRenderer, _videoElement);
  const hFOV = cvh > cvw ? 46 / videoAspectRatio : 46; // desired horizontal fov, in degrees

  // camera.updateProjectionMatrix();
  const threeCamera = new THREE.PerspectiveCamera(
    hFOV,
    videoAspectRatio,
    zNear,
    zFar,
  );
  threeCamera.setViewOffset(
    cvws,
    cvhs,
    offsetX,
    offsetY,
    cvw,
    cvh,
  );
  _threeRenderer.setSize(cvw, cvh);
  threeCamera.updateProjectionMatrix();
  return threeCamera;
};
