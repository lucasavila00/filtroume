import * as THREE from "three";
import KalmanFilter from "kalmanjs";
import { CV } from "../opencv";
declare var cv: CV;

const kalmanconfig = { R: 1, Q: 50 };
const txKalman = new KalmanFilter(kalmanconfig);
const tyKalman = new KalmanFilter(kalmanconfig);
const tzKalman = new KalmanFilter(kalmanconfig);
export const gotTvec = (
  x: number,
  y: number,
  z: number,
) => {
  // console.log({ x, y, z });
  // threeCompositeObject.position.set(x / 1, y / 1, z / 1);
  _threeCamera!.position.set(
    txKalman.filter(x),
    tyKalman.filter(y),
    tzKalman.filter(z),
  );
};

const raKalman = new KalmanFilter(kalmanconfig);
const rbKalman = new KalmanFilter(kalmanconfig);
const rcKalman = new KalmanFilter(kalmanconfig);
export const gotRvec = (
  rvec: import("../opencv/Mat").Mat,
) => {
  const rout = new cv.Mat();
  const temp = cv.matFromArray(3, 1, cv.CV_64F, [
    raKalman.filter(rvec.data64F[0]),
    rbKalman.filter(rvec.data64F[1]),
    rcKalman.filter(rvec.data64F[2]),
  ]);

  (cv as any).Rodrigues(temp, rout);
  var quaternion = new THREE.Quaternion();
  var mat = new THREE.Matrix4();
  // console.log({ rout });
  const r = rout.data64F;
  // prettier-ignore
  mat.set(
      r[0], r[1], r[2],   0,
      r[3], r[4], r[5],   0,
      r[6], r[7], r[8],   0,
      0,    0,    0,      1
    );
  quaternion.setFromRotationMatrix(mat);
  // const euler = new THREE.Euler();
  // euler.setFromQuaternion(quaternion);

  _threeCamera!.rotation.setFromQuaternion(quaternion);
};
// import {
//   EffectComposer,
//   // RenderPass,
//   // ShaderPass,
// } from "postprocessing";
// import { TextureFilter } from "three";

// const LutShader = {
//   uniforms: {
//     tDiffuse: { value: null },
//     lutMap: {
//       value: null,
//     },
//     lutMapSize: { value: 2 },
//   },
//   vertexShader: `
//     varying highp vec2 vUv;
//     void main() {
//         vUv = uv;
//         gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
//     }
//     `,
//   fragmentShader: `
//     uniform sampler2D tDiffuse;
//     varying highp vec2 vUv;
//     uniform sampler2D lutMap;
//     uniform float lutMapSize;

//     vec4 sampleAs3DTexture(sampler2D tex, vec3 texCoord, float size) {
//         float sliceSize = 1.0 / size;                  // space of 1 slice
//         float slicePixelSize = sliceSize / size;       // space of 1 pixel
//         float width = size - 1.0;
//         float sliceInnerSize = slicePixelSize * width; // space of size pixels
//         float zSlice0 = floor( texCoord.z * width);
//         float zSlice1 = min( zSlice0 + 1.0, width);
//         float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
//         float yRange = (texCoord.y * width + 0.5) / size;
//         float s0 = xOffset + (zSlice0 * sliceSize);
//         float s1 = xOffset + (zSlice1 * sliceSize);
//         vec4 slice0Color = texture2D(tex, vec2(s0, yRange));
//         vec4 slice1Color = texture2D(tex, vec2(s1, yRange));
//         float zOffset = mod(texCoord.z * width, 1.0);
//         return mix(slice0Color, slice1Color, zOffset);
//       }

//     void main(){
//         vec4 originalColor = texture2D(tDiffuse, vUv);
//         gl_FragColor = sampleAs3DTexture(lutMap, originalColor.xyz, lutMapSize);
//     }
//     `,
// };
// const makeIdentityLutTexture = (function() {
//   const identityLUT = new Uint8Array([
//     0,
//     0,
//     0,
//     255, // black
//     255,
//     0,
//     0,
//     255, // red
//     0,
//     0,
//     255,
//     255, // blue
//     255,
//     0,
//     255,
//     255, // magenta
//     0,
//     255,
//     0,
//     255, // green
//     255,
//     255,
//     0,
//     255, // yellow
//     0,
//     255,
//     255,
//     255, // cyan
//     255,
//     255,
//     255,
//     255, // white
//   ]);

//   return function(filter: TextureFilter) {
//     const texture = new THREE.DataTexture(
//       identityLUT,
//       4,
//       2,
//       THREE.RGBAFormat,
//     );
//     texture.minFilter = filter;
//     texture.magFilter = filter;
//     texture.needsUpdate = true;
//     texture.flipY = false;
//     return texture;
//   };
// })();
// const addBall = (x: number, y: number, z: number) => {
//   const geometry = new THREE.SphereBufferGeometry();
//   const material = new THREE.MeshBasicMaterial({
//     color: "black",
//   });

//   const mesh = new THREE.Mesh(geometry, material);
//   mesh.position.set(x, y, z);
//   mesh.frustumCulled = false;
//   mesh.renderOrder = 10000;
//   // // threeStuffs.faceObject.add(CLOUDOBJ3D);
//   _threeScene!.add(mesh);
// };
let threeCompositeObject: THREE.Object3D;
function init_threeScene() {
  threeCompositeObject = new THREE.Object3D();

  const pivotCubeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(500, 500, 500),
    new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
      depthTest: false,
    }),
  );
  pivotCubeMesh.frustumCulled = false;
  // pivotCubeMesh.position.x = -100;
  // pivotCubeMesh.position.y = -400;
  // pivotCubeMesh.position.z = 1000;
  // threeCompositeObject.add(pivotCubeMesh);

  // const pivotCubeMesh2 = new THREE.Mesh(
  //   new THREE.BoxGeometry(200, 200, 200),
  //   new THREE.MeshNormalMaterial({
  //     side: THREE.DoubleSide,
  //     depthTest: false,
  //   }),
  // );
  // pivotCubeMesh2.frustumCulled = false;

  // threeCompositeObject.add(pivotCubeMesh2);

  _threeScene!.add(threeCompositeObject);
  lines();
} // end init_threeScene()
let line: THREE.Line;
const lines = () => {
  var material = new THREE.LineBasicMaterial({
    color: "black",
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
  line = new THREE.Line(geometry, material);

  // line.position.z = -1000;
  // line.rotateY(Math.PI / 3);
  threeCompositeObject!.add(line);
};
let _threeVideoTexture: THREE.DataTexture | null = null;
let _threeVideoMesh: THREE.Mesh | null = null;
let _threeScene: THREE.Scene | null = null;
let _threeRenderer: THREE.WebGLRenderer | null = null;
// let _threeComposer: any;

let _isVideoTextureReady = false;

let _glVideoTexture: WebGLTexture | null = null;

let _faceFilterCv: HTMLCanvasElement | null = null;
let _gl: WebGLRenderingContext | null = null;
let _videoElement: HTMLVideoElement | null = null;

let _threeCamera: THREE.PerspectiveCamera | null = null;

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
    gl_FragColor = texture2D(samplerVideo, vec2(1.0-vUV.x, 1.0-vUV.y));\n\
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

  // const rtParameters = {
  //   minFilter: THREE.LinearFilter,
  //   magFilter: THREE.LinearFilter,
  //   format: THREE.RGBFormat,
  // };
  // _threeComposer = new EffectComposer(
  //   _threeRenderer,
  //   new THREE.WebGLRenderTarget(1, 1, rtParameters),
  // );

  // create_threeCompositeObjects();
  create_videoScreen();

  const returnedDict = {
    videoMesh: _threeVideoMesh,
    renderer: _threeRenderer,
    scene: _threeScene,
  };
  // if (_isMultiFaces) {
  //   returnedDict.faceObjects = _threePivotedObjects;
  // } else {

  // returnedDict.faceObject = _threePivotedObjects[0];
  // }

  return returnedDict;
};

export const render =
  // function(detectState, threeCamera)
  () => {
    // const ds = [detectState];

    //update detection states
    // detect(ds);
    // update_positions3D(ds, threeCamera);
    // console.log("rendering...");
    _threeRenderer?.state.reset();
    // console.log({ _threeCamera, _threeScene });
    //trigger the render of the THREE.JS SCENE
    _threeRenderer?.render(_threeScene!, _threeCamera!);

    // console.log({ _threeScene, _threeCamera });
    // _threeComposer.render();
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

  update_camera(threeCamera);

  // threeCamera.position.set(30, 0, 0);
  // threeCamera.up = new THREE.Vector3(0, 0, 1);
  // threeCamera.lookAt(new THREE.Vector3(0, 0, 0));
  return threeCamera;
};
const _settings = {
  cameraMinVideoDimFov: 28, //Field of View for the smallest dimension of the video in degrees
};
const update_camera = function(
  threeCamera: THREE.PerspectiveCamera,
) {
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
  // const info = {
  //   lut: {
  //     url: "window.parent._lut",
  //     size: 16,
  //   },
  //   images: {
  //     top: "window.parent._img",
  //   },
  // };
  _glVideoTexture = videoTexture;
  _gl = GL;
  _faceFilterCv = canvasElement;
  _videoElement = videoElement;

  init();
  init_threeScene();
  _threeCamera = create_camera();
  // registerCamera(
  //   _threeCamera,
  //   // , info.lut
  // );
};
// const registerCamera = function(
//   threeCamera: THREE.Camera,
//   // lut: { url: string; size: number },
// ) {
//   const renderAll = new RenderPass(
//     _threeScene,
//     threeCamera,
//   );
//   _threeComposer.addPass(renderAll);
//   _threeComposer.setSize(
//     _faceFilterCv!.width,
//     _faceFilterCv!.height,
//   );

//   // const pixelPass = new ShaderPass(LutShader);
//   // pixelPass.renderToScreen = true;
//   // _threeComposer.addPass(pixelPass);

//   // const makeLUTTexture = (function() {
//   //   const imgLoader = new THREE.ImageLoader();
//   //   const ctx = document
//   //     .createElement("canvas")
//   //     .getContext("2d");

//   //   return function(info: {
//   //     filter?: boolean;
//   //     url: string;
//   //     size: number;
//   //   }) {
//   //     const texture = makeIdentityLutTexture(
//   //       info.filter
//   //         ? THREE.LinearFilter
//   //         : THREE.NearestFilter,
//   //     );

//   //     if (info.url && ctx) {
//   //       const lutSize = info.size;

//   //       // set the size to 2 (the identity size). We'll restore it when the
//   //       // image has loaded. This way the code using the lut doesn't have to
//   //       // care if the image has loaded or not
//   //       info.size = 2;

//   //       imgLoader.load(info.url, function(image) {
//   //         const width = lutSize * lutSize;
//   //         const height = lutSize;
//   //         info.size = lutSize;
//   //         ctx.canvas.width = width;
//   //         ctx.canvas.height = height;
//   //         ctx.drawImage(image, 0, 0);
//   //         const imageData = ctx.getImageData(
//   //           0,
//   //           0,
//   //           width,
//   //           height,
//   //         );

//   //         (texture.image as any).data = new Uint8Array(
//   //           imageData.data.buffer,
//   //         );
//   //         (texture.image as any).width = width;
//   //         (texture.image as any).height = height;
//   //         texture.needsUpdate = true;

//   //         pixelPass.uniforms.lutMap.value = texture;
//   //         pixelPass.uniforms.lutMapSize.value = lutSize;
//   //       });
//   //     }

//   //     return texture;
//   //   };
//   // })();
//   // const info = {
//   //   name: "custom",
//   //   url: lut.url,
//   //   size: lut.size,
//   //   filter: true,
//   // };

//   // pixelPass.uniforms.lutMap.value = makeLUTTexture(info);
//   // pixelPass.uniforms.lutMapSize.value = info.size;
// };
