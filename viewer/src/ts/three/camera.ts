export const calcCameraParams = (
  _threeRenderer: THREE.WebGLRenderer,
  _videoElement: HTMLVideoElement,
) => {
  const canvasElement = _threeRenderer.domElement;
  const cvw = canvasElement.width;
  const cvh = canvasElement.height;
  const canvasAspectRatio = cvw / cvh;

  // compute vertical field of view:
  const vw = _videoElement.videoWidth;
  const vh = _videoElement.videoHeight;
  const videoAspectRatio = vw / vh;
  // const fovFactor = (vh > vw) ? (1.0 / videoAspectRatio) : 1.0;
  // const fov = _settings.cameraMinVideoDimFov * fovFactor;

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
  const params = {
    cvws,
    cvhs,
    offsetX,
    offsetY,
    cvw,
    cvh,
  };
  console.log({ params });
  return params;
};
