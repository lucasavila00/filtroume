import * as THREE from "three";
import { processTvec, processRVec } from "./kalman";
import { getInfo } from "./info";
import {
  // BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  Effect,
  BlendFunction,
} from "postprocessing";
import { TextureFilter } from "three";
const fragment = `
uniform sampler2D colorTransformLookup;
uniform float lutMapSize;

vec4 sampleAs3DTexture(sampler2D tex, vec3 texCoord, float size) {
  float sliceSize = 1.0 / size;                  // space of 1 slice
  float slicePixelSize = sliceSize / size;       // space of 1 pixel
  float width = size - 1.0;
  float sliceInnerSize = slicePixelSize * width; // space of size pixels
  float zSlice0 = floor( texCoord.z * width);
  float zSlice1 = min( zSlice0 + 1.0, width);
  float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
  float yRange = (texCoord.y * width + 0.5) / size;
  float s0 = xOffset + (zSlice0 * sliceSize);
  float s1 = xOffset + (zSlice1 * sliceSize);
  vec4 slice0Color = texture2D(tex, vec2(s0, yRange));
  vec4 slice1Color = texture2D(tex, vec2(s1, yRange));
  float zOffset = mod(texCoord.z * width, 1.0);
  return mix(slice0Color, slice1Color, zOffset);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

  outputColor = sampleAs3DTexture(colorTransformLookup, inputColor.xyz, lutMapSize);

}`;
class ColorTransformEffect extends Effect {
  constructor({
    lutTexture,
  }: {
    lutTexture: THREE.DataTexture;
  }) {
    super("ColorTransformEffect", fragment, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        [
          "colorTransformLookup",
          new THREE.Uniform(lutTexture),
        ],
        ["lutMapSize", new THREE.Uniform(2)],
      ]),
    });

    lutTexture.magFilter = THREE.LinearFilter;
    lutTexture.minFilter = THREE.LinearFilter;
    lutTexture.format = THREE.RGBAFormat;
    lutTexture.flipY = false;
    lutTexture.generateMipmaps = false;
    lutTexture.needsUpdate = true;
  }
}

const clock = new THREE.Clock();

let threeCompositeObject: THREE.Object3D;
let _threeVideoTexture: THREE.DataTexture;
let _threeVideoMesh: THREE.Mesh;
let _threeScene: THREE.Scene;
let _threeRenderer: THREE.WebGLRenderer;
let _isVideoTextureReady = false;
let _glVideoTexture: WebGLTexture;
let _faceFilterCv: HTMLCanvasElement;
let _gl: WebGLRenderingContext;
let _videoElement: HTMLVideoElement;
let _threeCamera: THREE.PerspectiveCamera;
let _threeComposer: any;
let _lutEf: any;
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
  threeCompositeObject.visible = foundFace;
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

  init();

  init_threeScene(info.images.top);

  _threeCamera = create_camera();

  // TODO: passar o lut pro effect composer

  const rtParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
  };
  _threeComposer = new EffectComposer(
    _threeRenderer,
    new THREE.WebGLRenderTarget(1, 1, rtParameters),
  );

  // const lutPass = new ShaderPass(
  //   new THREE.ShaderMaterial(LutShader),
  // );

  // lutPass.setInput("main");

  _lutEf = new ColorTransformEffect({
    lutTexture: makeLUTTexture({
      url: "https://localhost:3007/lut0.png",
    }),
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
  // _threeComposer.addPass(lutPass);

  _threeComposer.addPass(effectPass);
  _threeComposer.setSize(
    _faceFilterCv!.width,
    _faceFilterCv!.height,
  );

  // console.log(lutPass);

  // lutPass.uniform.lutMap.value = makeLUTTexture(
  //   {
  //     url: "./lut0.png",
  //   },
  //   lutPass,
  // );
  // lutPass.uniform.lutMapSize.value = 2;
};
const init_threeScene = (imgUrl: string) => {
  threeCompositeObject = new THREE.Object3D();
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(imgUrl),
    transparent: true,
  });
  const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1500, 1500),
    planeMaterial,
  );

  threeCompositeObject.add(planeMesh);
  _threeScene!.add(threeCompositeObject);
  lines();
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

const init = () => {
  // init THREE.JS context:
  _threeRenderer = new THREE.WebGLRenderer({
    context: _gl!,
    canvas: _faceFilterCv!,
    alpha: false,
  });

  _threeScene = new THREE.Scene();

  create_videoScreen();
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

const lines = () => {
  var material = new THREE.LineBasicMaterial({
    color: "green",
    linewidth: 25,
  });
  var geometry = new THREE.Geometry();

  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -60.0, -78.0),
  );
  // left nostril
  geometry.vertices.push(
    new THREE.Vector3(-67.0, -58.0, -100.0),
  );
  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -60.0, -78.0),
  );
  // right nostril
  geometry.vertices.push(
    new THREE.Vector3(67.0, -58.0, -100.0),
  );
  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  //righteyerightcorner
  geometry.vertices.push(
    new THREE.Vector3(262.0, 168.0, -240.0),
  );
  //righteyeleftcorner
  geometry.vertices.push(
    new THREE.Vector3(115.0, 170.0, -210.0),
  );
  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  //lefteyeleftcorner
  geometry.vertices.push(
    new THREE.Vector3(-262.0, 168.0, -240.0),
  );
  //lefteyerightcorner
  geometry.vertices.push(
    new THREE.Vector3(-115.0, 170.0, -210.0),
  );
  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -60.0, -78.0),
  );
  // left mouth corner
  geometry.vertices.push(
    new THREE.Vector3(-148.0, -192.0, -181.0),
  );
  //rightmouthcorner
  geometry.vertices.push(
    new THREE.Vector3(148.0, -192.0, -181.0),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -60.0, -78.0),
  );
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  line.renderOrder = 50000;
  threeCompositeObject!.add(line);
};

const makeLUTTexture = function(info: { url: string }) {
  const imgLoader = new THREE.ImageLoader();
  const ctx = document
    .createElement("canvas")
    .getContext("2d");
  const texture = makeIdentityLutTexture(
    THREE.LinearFilter,
  );
  console.log("maeking textureeeee");
  if (info.url && ctx) {
    const lutSize = 16;
    console.log("has url and canvas lut");

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

      (texture.image as any).data = new Uint8Array(
        imageData.data.buffer,
      );
      (texture.image as any).width = width;
      (texture.image as any).height = height;
      texture.needsUpdate = true;
      (_lutEf.uniforms as Map<string, THREE.Uniform>).get(
        "lutMapSize",
      )!.value = 16;
    });
  }

  return texture;
};

const makeIdentityLutTexture = function(
  filter: TextureFilter,
) {
  const identityLUT = new Uint8Array([
    0,
    0,
    0,
    255, // black
    255,
    0,
    0,
    255, // red
    0,
    0,
    255,
    255, // blue
    255,
    0,
    255,
    255, // magenta
    0,
    255,
    0,
    255, // green
    255,
    255,
    0,
    255, // yellow
    0,
    255,
    255,
    255, // cyan
    255,
    255,
    255,
    255, // white
  ]);

  const texture = new THREE.DataTexture(
    identityLUT,
    4,
    2,
    THREE.RGBAFormat,
  );
  texture.minFilter = filter;
  texture.magFilter = filter;
  texture.needsUpdate = true;
  texture.flipY = false;
  return texture;
};
