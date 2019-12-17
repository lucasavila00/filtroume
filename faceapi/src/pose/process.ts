import * as faceapi from "face-api.js";
import { CV } from "../opencv";
import { generateImageAndObjectPoints } from "./prepare";
import { generateCameraMatrix } from "./camera";
import { gotTvec, gotRvec } from "../three/main";
declare var cv: CV;

let selectedOpenCvMethoed = 4; //cv.SOLVEPNP_UPNP;

export function extractHeadPoseInfo(
  resizedResult: faceapi.WithFaceLandmarks<
    { detection: faceapi.FaceDetection },
    faceapi.FaceLandmarks68
  >,
  dims: { width: number; height: number },
) {
  const positions = resizedResult.landmarks.positions;
  const {
    imagePoints,
    objectPoints,
  } = generateImageAndObjectPoints(positions);
  const cameraMatrix = generateCameraMatrix(dims);
  const distCoeffs = cv.Mat.zeros(4, 1, cv.CV_64F);
  let rvec = new cv.Mat();
  let tvec = new cv.Mat();
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

    let rout = new cv.Mat();
    (cv as any).Rodrigues(rvec, rout);
    const transposed = rout.t();
    let minusR = new cv.Mat();

    cv.multiply(
      transposed,
      cv.matFromArray(3, 3, cv.CV_64F, [
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
      ]),
      minusR,
    );

    let outvec = new cv.Mat();
    const src3 = cv.matFromArray(3, 3, cv.CV_64F, [
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
    ]);
    cv.gemm(minusR, tvec, 1, src3, 0, outvec);

    let outrvec = new cv.Mat();
    (cv as any).Rodrigues(transposed, outrvec);
    gotRvec(outrvec);
    gotTvec(
      outvec.data64F[0],
      outvec.data64F[1],
      outvec.data64F[2],
    );
    minusR.delete();
    rout.delete();
    transposed.delete();

    // const debug2d = () => {
    // const canvas: HTMLCanvasElement | null = document.getElementById(
    //   "overlay2",
    // ) as HTMLCanvasElement;
    // canvas
    //   .getContext("2d")!
    //   .clearRect(0, 0, canvas.width, canvas.height);
    // drawCube(
    //   rvec,
    //   tvec,
    //   cameraMatrix,
    //   distCoeffs,
    //   positions,
    //   canvas,
    // );
    // faceapi.draw.drawDetections(canvas, resizedResult);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
    // }
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    rvec.delete();
    tvec.delete();
    outinliers.delete();
    imagePoints.delete();
    objectPoints.delete();
  }
}
