export const calcCameraParams = (
  _threeRenderer: THREE.WebGLRenderer,
  _videoElement: HTMLVideoElement,
) => {
  const _settings = {
    cameraMinVideoDimFov: 47, //Field of View for the smallest dimension of the video in degrees
  };
  // compute aspectRatio:
  const canvasElement = _threeRenderer.domElement;
  const cvw = canvasElement.width;
  const cvh = canvasElement.height;
  // console.log({ cvw, cvh });
  const canvasAspectRatio = cvw / cvh;

  // compute vertical field of view:
  const vw = _videoElement.videoWidth;
  const vh = _videoElement.videoHeight;
  const videoAspectRatio = vw / vh;
  const fovFactor = vh > vw ? 1.0 / videoAspectRatio : 1.0;
  // const fovh = 2 * Math.atan(cvh / (2 * cvw)) * 180;
  // const fovw = 2 * Math.atan(cvw / (2 * cvw)) * 180;
  // console.log({ fovh, fovw, vh, vw });
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

  return {
    canvasAspectRatio,
    fov,
    cvws,
    cvhs,
    offsetX,
    offsetY,
    cvw,
    cvh,
  };
};
