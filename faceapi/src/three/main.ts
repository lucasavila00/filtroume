import * as THREE from "three";
import {
  EffectComposer,
  RenderPass,
  // ShaderPass,
} from "postprocessing";
// import { TextureFilter } from "three";

let _threeVideoTexture: any;
let _threeVideoMesh: any;
let _threeScene: THREE.Scene | null = null;
let _threeRenderer: THREE.WebGLRenderer | null = null;
let _threeComposer: any;

let _isVideoTextureReady = false;

let _glVideoTexture: any;

let _faceFilterCv: any;
let _gl: any;
let _videoElement: any;

let _scaleW = -1;

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
    gl_FragColor = texture2D(samplerVideo, vUV);\n\
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
  videoGeometry.addAttribute(
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
      _threeRenderer?.properties.update(
        _threeVideoTexture,
        "__webglTexture",
        _glVideoTexture,
      );
      _threeVideoTexture.magFilter = THREE.LinearFilter;
      _threeVideoTexture.minFilter = THREE.LinearFilter;
      _isVideoTextureReady = true;
      console.log("updated...");
    } catch (e) {
      console.log(
        "WARNING in THREE.JeelizHelper : the glVideoTexture is not fully initialized",
      );
    }
    delete threeMesh.onAfterRender;
  };
};
interface ISpec {
  alpha: boolean;
  videoElement: HTMLVideoElement;
  canvasElement: HTMLCanvasElement;
  GL: WebGLRenderingContext;
  videoTexture: WebGLTexture;
}

const init = (spec: ISpec) => {
  // _maxFaces = spec.maxFacesDetected;
  _glVideoTexture = spec.videoTexture;
  _gl = spec.GL;
  _faceFilterCv = spec.canvasElement;
  // _isMultiFaces = _maxFaces > 1;
  _videoElement = spec.videoElement;

  // enable 2 canvas mode if necessary:
  let threejsCanvas = _faceFilterCv;

  // if (typeof detectCallback !== "undefined") {
  //     _detect_callback = detectCallback;
  // }

  // init THREE.JS context:
  _threeRenderer = new THREE.WebGLRenderer({
    // context: (_isSeparateThreejsCanvas) ? null : WebGLDebugUtils.makeDebugContext(_gl),
    context: _gl,
    canvas: threejsCanvas,
    alpha: spec.alpha ? true : false,
  });

  _threeScene = new THREE.Scene();

  const rtParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
  };
  _threeComposer = new EffectComposer(
    _threeRenderer,
    new THREE.WebGLRenderTarget(1, 1, rtParameters),
  );

  // create_threeCompositeObjects();
  create_videoScreen();

  // handle device orientation change:
  // window.addEventListener(
  //   "orientationchange",
  //   function() {
  //     setTimeout(JEEFACEFILTERAPI.resize, 1000);
  //   },
  //   false,
  // );

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

const registerCamera = function(
  threeCamera: THREE.Camera,
  // lut: { url: string; size: number },
) {
  const renderAll = new RenderPass(
    _threeScene,
    threeCamera,
  );
  _threeComposer.addPass(renderAll);
  _threeComposer.setSize(
    _faceFilterCv.width,
    _faceFilterCv.height,
  );

  // const pixelPass = new ShaderPass(LutShader);
  // pixelPass.renderToScreen = true;
  // _threeComposer.addPass(pixelPass);

  // const makeLUTTexture = (function() {
  //   const imgLoader = new THREE.ImageLoader();
  //   const ctx = document
  //     .createElement("canvas")
  //     .getContext("2d");

  //   return function(info: {
  //     filter?: boolean;
  //     url: string;
  //     size: number;
  //   }) {
  //     const texture = makeIdentityLutTexture(
  //       info.filter
  //         ? THREE.LinearFilter
  //         : THREE.NearestFilter,
  //     );

  //     if (info.url && ctx) {
  //       const lutSize = info.size;

  //       // set the size to 2 (the identity size). We'll restore it when the
  //       // image has loaded. This way the code using the lut doesn't have to
  //       // care if the image has loaded or not
  //       info.size = 2;

  //       imgLoader.load(info.url, function(image) {
  //         const width = lutSize * lutSize;
  //         const height = lutSize;
  //         info.size = lutSize;
  //         ctx.canvas.width = width;
  //         ctx.canvas.height = height;
  //         ctx.drawImage(image, 0, 0);
  //         const imageData = ctx.getImageData(
  //           0,
  //           0,
  //           width,
  //           height,
  //         );

  //         (texture.image as any).data = new Uint8Array(
  //           imageData.data.buffer,
  //         );
  //         (texture.image as any).width = width;
  //         (texture.image as any).height = height;
  //         texture.needsUpdate = true;

  //         pixelPass.uniforms.lutMap.value = texture;
  //         pixelPass.uniforms.lutMapSize.value = lutSize;
  //       });
  //     }

  //     return texture;
  //   };
  // })();
  // const info = {
  //   name: "custom",
  //   url: lut.url,
  //   size: lut.size,
  //   filter: true,
  // };

  // pixelPass.uniforms.lutMap.value = makeLUTTexture(info);
  // pixelPass.uniforms.lutMapSize.value = info.size;
};

export const render =
  // function(detectState, threeCamera)
  () => {
    // const ds = [detectState];

    //update detection states
    // detect(ds);
    // update_positions3D(ds, threeCamera);
    console.log("rendering...");
    _threeRenderer?.state.reset();
    console.log({ _threeCamera, _threeScene });
    //trigger the render of the THREE.JS SCENE
    _threeRenderer?.render(_threeScene!, _threeCamera!);
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
    zFar ? zFar : 100,
  );
  // threeCamera.position.y = -100;
  update_camera(threeCamera);

  return threeCamera;
};
const _settings = {
  cameraMinVideoDimFov: 46, //Field of View for the smallest dimension of the video in degrees
};
const update_camera = function(
  threeCamera: THREE.PerspectiveCamera,
) {
  // compute aspectRatio:
  const canvasElement = _threeRenderer!.domElement;
  const cvw = canvasElement.width;
  const cvh = canvasElement.height;

  console.log({ cvw, cvh });
  const canvasAspectRatio = cvw / cvh;

  // compute vertical field of view:
  const vw = _videoElement.videoWidth;
  const vh = _videoElement.videoHeight;
  const videoAspectRatio = vw / vh;
  const fovFactor = vh > vw ? 1.0 / videoAspectRatio : 1.0;
  const fov = _settings.cameraMinVideoDimFov * fovFactor;

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
  _scaleW = cvw / cvws;
  console.log({ _scaleW });

  // apply parameters:
  threeCamera.aspect = canvasAspectRatio;
  threeCamera.fov = fov;
  console.log(
    "INFO in JeelizThreejsHelper.update_camera() : camera vertical estimated FoV is",
    fov,
  );
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

function init_threeScene(
  spec: ISpec,
  // images: { top: string },
) {
  init(spec);
  // const mat = new THREE.MeshBasicMaterial({
  //   // map: new THREE.TextureLoader().load(images.top),
  //   // transparent: true,
  //   color: "#000",
  //   transparent: false,
  // });
  // const CLOUDMESH = new THREE.Mesh(
  //   new THREE.PlaneGeometry(3.75, 3.75),
  //   mat,
  // );
  // CLOUDMESH.position.setY(1);
  // CLOUDMESH.frustumCulled = false;
  // CLOUDMESH.renderOrder = 10000;

  // const CLOUDOBJ3D = new THREE.Object3D();
  // CLOUDOBJ3D.add(CLOUDMESH);

  // // threeStuffs.faceObject.add(CLOUDOBJ3D);
  // _threeScene!.add(CLOUDOBJ3D);
  _threeCamera = create_camera();
  console.log("initedddd");
} // end init_threeScene()
// const makeSpec = ( ):ISpec => {

// }

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
  const spec: ISpec = {
    alpha: false,
    videoElement,
    canvasElement,
    videoTexture,
    GL,
  };
  // const info = {
  //   lut: {
  //     url: "window.parent._lut",
  //     size: 16,
  //   },
  //   images: {
  //     top: "window.parent._img",
  //   },
  // };
  init_threeScene(
    spec,
    // , info.images
  );
  if (!_threeCamera) {
    console.error("there is no three camera");
    return;
  }
  registerCamera(
    _threeCamera,
    // , info.lut
  );
};
