import KKalmanFilter from "../kalman";

import * as faceapi from "face-api.js";
import { CV } from "../opencv";
import { Mat } from "../opencv/Mat";
import { generateImageAndObjectPoints } from "./prepare";
import { generateCameraMatrix } from "./camera";
import { gotTvec, gotRvec } from "../three/main";
import { drawCube } from "../debugPaint";
declare var cv: CV;

let selectedOpenCvMethoed = 4; //cv.SOLVEPNP_UPNP;
const kalmanconfig = { R: 1, Q: 0.5 };
// const kalmanconfigR = { R: 0.2, Q: 1 };

// class KalmanFilter extends KKalmanFilter {
//   private TRESH: number;
//   constructor(p: any, TRESH = 0.1) {
//     super(p);
//     this.TRESH = TRESH;
//   }
//   public filter = (x: number) => {
//     const ret = super.filter(x);
//     const diff = Math.abs(ret - x);
//     if (diff > this.TRESH) {
//       this.reset(); // estimated signal without noise
//       super.filter(x);
//       return x;
//     } else {
//       return ret;
//     }
//   };
// }

const txKalman = new KKalmanFilter(kalmanconfig);
const tyKalman = new KKalmanFilter(kalmanconfig);
const tzKalman = new KKalmanFilter(kalmanconfig);
const rxKalman = new KKalmanFilter(kalmanconfig);
const ryKalman = new KKalmanFilter(kalmanconfig);
const rzKalman = new KKalmanFilter(kalmanconfig);

const getKalman = (
  x: number,
  y: number,
  z: number,

  rx: number,
  ry: number,
  rz: number,
) => {
  // return {
  //   tx: x,
  //   ty: y,
  //   tz: z,
  //   rx,
  //   ry,
  //   rz,
  // };

  let nx = txKalman.filter(x);
  const diffx = Math.abs(nx - x);

  let ny = tyKalman.filter(y);
  const diffy = Math.abs(ny - y);

  let nz = tzKalman.filter(z);
  const diffz = Math.abs(nz - z);

  let nrx = rxKalman.filter(rx);
  const diffrx = Math.abs(nrx - rx);

  let nry = ryKalman.filter(ry);
  const diffry = Math.abs(nry - ry);

  let nrz = rzKalman.filter(rz);
  const diffrz = Math.abs(nrz - rz);

  const maxDiffTranslate = 300;

  const maxDiffRotate = 0.5;

  if (
    diffx > maxDiffTranslate ||
    diffy > maxDiffTranslate ||
    diffz > maxDiffTranslate ||
    diffrx > maxDiffRotate ||
    diffry > maxDiffRotate ||
    diffrz > maxDiffRotate
  ) {
    txKalman.reset();
    nx = txKalman.filter(x);

    tyKalman.reset();
    ny = tyKalman.filter(y);

    tzKalman.reset();
    nz = tzKalman.filter(z);

    rxKalman.reset();
    nrx = rxKalman.filter(rx);

    ryKalman.reset();
    nry = ryKalman.filter(ry);

    rzKalman.reset();
    nrz = rzKalman.filter(rz);
  }

  return {
    tx: nx,
    ty: ny,
    tz: nz,
    rx: nrx,
    ry: nry,
    rz: nrz,
  };
};

let rvec: any;
let tvec: any;
const denormalize_sym_item = (
  item: number,
  factor: number,
) => {
  const ret = (item - 0.5) * 2 * factor;

  return ret;
};

const denormalize_output = (...output: number[]) => {
  const MAX_RADIUS = 100;

  const MAX_Y = 50;

  // -1.8 -- 1.8
  const rx = denormalize_sym_item(output[0], 1.8);
  // # -3.5 -- 3.5
  const ry = denormalize_sym_item(output[1], 3.5);
  // # -3.5 -- 3.5
  const rz = denormalize_sym_item(output[2], 3.5);

  const tx = denormalize_sym_item(
    output[3],
    MAX_RADIUS * 1.5,
  );

  const ty = denormalize_sym_item(output[4], MAX_Y * 1.5);

  const tz = output[5] * (MAX_RADIUS * 1.5);

  return [rx, ry, rz, tx, ty, tz];
};
export const resetPred = () => {
  rvec = null;
  tvec = null;
};
let i = 0;
export async function extractHeadPoseInfo(
  resizedResult: faceapi.WithFaceLandmarks<
    { detection: faceapi.FaceDetection },
    faceapi.FaceLandmarks68
  >,
  pnpWithAi: (
    x: Mat,
  ) => Promise<{
    tvec: number[];
    rvec: number[];
  }>,
) {
  const positions = resizedResult.landmarks.positions;
  const {
    imagePoints,
    objectPoints,
  } = generateImageAndObjectPoints(positions);

  const cameraMatrix = generateCameraMatrix();
  const distCoeffs = cv.Mat.zeros(4, 1, cv.CV_64F);
  const outinliers = new cv.Mat();
  try {
    if (rvec == null || tvec == null) {
      rvec = new cv.Mat();
      tvec = new cv.Mat();
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
    }
    cv.solvePnPRefineVVS(
      objectPoints,
      imagePoints,
      cameraMatrix,
      distCoeffs,
      rvec,
      tvec,
    );

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
    // // faceapi.draw.drawDetections(canvas, resizedResult);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
    const res = await pnpWithAi(imagePoints);

    const den = denormalize_output(
      res.rvec[0],
      res.rvec[1],
      res.rvec[2],
      res.tvec[0],
      res.tvec[1],
      res.tvec[2],
    );
    const _tk1 = getKalman(
      den[3],
      den[4],
      den[5],
      den[0],
      den[1],
      den[2],

      // tvec.data64F[0],
      // tvec.data64F[1],
      // tvec.data64F[2],
      // rvec.data64F[0],
      // rvec.data64F[1],
      // rvec.data64F[2],
    );
    // const _tk2 = getKalman(
    //   tvec.data64F[0],
    //   tvec.data64F[1],
    //   tvec.data64F[2],
    //   rvec.data64F[0],
    //   rvec.data64F[1],
    //   rvec.data64F[2],
    // );
    // i++;
    // if (i > 3) {
    //   i = 0;
    // }
    // const tk = i < 16 ? _tk1 : _tk2;
    const tk = _tk1;
    // console.log({ _tk1, _tk2 });
    let _rvec = cv.matFromArray(3, 1, cv.CV_64F, [
      tk.rx,
      tk.ry,
      tk.rz,
    ]);

    let _tvec = cv.matFromArray(3, 1, cv.CV_64F, [
      tk.tx,
      tk.ty,
      tk.tz,
    ]);
    let rout = new cv.Mat();
    (cv as any).Rodrigues(_rvec, rout);

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
    cv.gemm(minusR, _tvec, 1, src3, 0, outvec);

    let outrvec = new cv.Mat();
    (cv as any).Rodrigues(transposed, outrvec);
    gotRvec(outrvec);
    gotTvec(
      outvec.data64F[0],
      outvec.data64F[1],
      outvec.data64F[2],
    );

    // console.log(
    //   JSON.stringify({
    //     res,
    //     tvec: [...tvec.data64F],
    //     outvec: [...outvec.data64F],
    //     rvec: [...rvec.data64F],
    //     outrvec: [...outrvec.data64F],
    //   }),
    // );

    minusR.delete();
    rout.delete();
    transposed.delete();
  } catch (err) {
    console.error("error resolving pose!!!!");
    console.error(err);
    throw err;
  } finally {
    outinliers.delete();
    imagePoints.delete();
    objectPoints.delete();
  }
}
