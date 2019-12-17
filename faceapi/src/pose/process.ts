import * as faceapi from "face-api.js";
import { CV } from "../opencv";
import { drawCube } from "../debugPaint";
import { generateImageAndObjectPoints } from "./prepare";
import { generateCameraMatrix } from "./camera";
declare var cv: CV;
let selectedOpenCvMethoed = 4; //cv.SOLVEPNP_UPNP;

export function extractHeadPoseInfo(
  resizedResult: faceapi.WithFaceLandmarks<
    { detection: faceapi.FaceDetection },
    faceapi.FaceLandmarks68
  >,
  dims: { width: number; height: number },
  canvas: HTMLCanvasElement,
) {
  const positions = resizedResult.landmarks.positions;
  const {
    imagePoints,
    objectPoints,
  } = generateImageAndObjectPoints(positions);
  const cameraMatrix = generateCameraMatrix(dims);
  const distCoeffs = cv.Mat.zeros(4, 1, cv.CV_64F);
  const rvec = new cv.Mat();
  const tvec = new cv.Mat();
  const outinliers = new cv.Mat();
  try {
    cv.solvePnPRansac(
      objectPoints,
      imagePoints,
      cameraMatrix,
      distCoeffs,
      rvec,
      tvec,
      false,
      100,
      8.0,
      0.99,
      outinliers,
      selectedOpenCvMethoed,
    );
    cv.solvePnPRefineVVS(
      objectPoints,
      imagePoints,
      cameraMatrix,
      distCoeffs,
      rvec,
      tvec,
    );
    drawCube(
      rvec,
      tvec,
      cameraMatrix,
      distCoeffs,
      positions,
      canvas,
    );
  } catch (err) {
    console.error(err);
  }
}
