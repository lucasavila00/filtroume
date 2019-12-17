import * as faceapi from "face-api.js";
import * as THREE from "three";
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

    // let rout = new cv.Mat();
    // (cv as any).Rodrigues(rvec, rout);
    // rout = rout.t();

    // let dst = new cv.Mat();

    // cv.multiply(
    //   rout,
    //   cv.matFromArray(3, 1, cv.CV_64F, [-1, -1, -1]),
    //   dst,
    // );

    // cv.multiply(dst, tvec, rout);

    // tvec = rout
    //   .mul(
    //     cv.matFromArray(3, 1, cv.CV_64F, [-1, -1, -1]),
    //     1,
    //   )
    //   .mul(tvec, 1);

    // (cv as any).Rodrigues(rout, rvec);

    // gotRvec(rvec);
    gotTvec(
      tvec.data64F[0],
      tvec.data64F[1],
      tvec.data64F[2],
    );

    // console.log((cv as any).Rodrigues(rvec));
    // console.log({ tvec });
    // drawCube(
    //   rvec,
    //   tvec,
    //   cameraMatrix,
    //   distCoeffs,
    //   positions,
    //   canvas,
    // );
  } catch (err) {
    console.error(err);
  }
}
