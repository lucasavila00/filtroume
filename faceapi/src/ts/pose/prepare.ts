import * as faceapi from "face-api.js";

import { CV } from "../opencv";
import { Mat } from "../opencv/Mat";
import KalmanFilter from "../kalman";

declare var cv: CV;
const kalmanconfig = { R: 0.8, Q: 1 };

let ks = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  0,
].map(_ => {
  return new KalmanFilter(kalmanconfig);
});

const applyKalman = (xs: number[]): number[] => {
  return xs.map((x, index) => ks[index].filter(x));
};

export const generateImageAndObjectPoints = (
  positions: faceapi.Point[],
): {
  imagePoints: Mat;
  objectPoints: Mat;
} => {
  const noseTip = positions[30];
  const bottomNose = positions[33];

  const lefteyeleftcorner = positions[36];
  const lefteyerightcorner = positions[39];

  const righteyerightcorner = positions[45];
  const righteyeleftcorner = positions[42];

  const leftmouth = positions[48];
  const rightmouth = positions[54];

  const leftnostril = positions[31];
  const rightnostril = positions[35];

  const imagePoints = cv.matFromArray(
    10,
    2,
    cv.CV_64F,
    applyKalman([
      noseTip.x,
      noseTip.y,

      bottomNose.x,
      bottomNose.y,

      leftnostril.x,
      leftnostril.y,

      rightnostril.x,
      rightnostril.y,

      lefteyeleftcorner.x,
      lefteyeleftcorner.y,
      lefteyerightcorner.x,
      lefteyerightcorner.y,

      righteyerightcorner.x,
      righteyerightcorner.y,
      righteyeleftcorner.x,
      righteyeleftcorner.y,

      leftmouth.x,
      leftmouth.y,
      rightmouth.x,
      rightmouth.y,
    ]),
  );

  //from sparkar
  const objectPoints = cv.matFromArray(10, 3, cv.CV_64F, [
    //nose tips
    0.0,
    -1 * 0.003874,
    -1 * 0.290468,

    // bottom nose
    0.0,
    -1 * -1.26207,
    -1 * -1.14108,

    // left nostril
    -0.85877,
    -1 * -1.05017,
    -1 * -1.53035,

    // right nostril
    0.85877,
    -1 * -1.05017,
    -1 * -1.53035,

    //chin
    // 0.0,g
    // -8.01629,
    // -3.32839,

    //lefteyeleftcorner
    -4.49893,
    -1 * 3.21601,
    -1 * -4.22082,

    //lefteyerightcorner
    -1.9326,
    -1 * 3.14086,
    -1 * -3.78216,

    //righteyerightcorner
    4.49893,
    -1 * 3.21601,
    -1 * -4.22082,

    //righteyeleftcorner
    1.9326,
    -1 * 3.14086,
    -1 * -3.78216,

    // left mouth corner
    -2.17298,
    -1 * -3.62696,
    -1 * -3.15651,
    //rightmouthcorner
    2.17298,
    -1 * -3.62696,
    -1 * -3.15651,
  ]);

  // imagePoints = (cv).matFromArray(6, 2, (cv).CV_64F, [
  //     noseTip.x ,
  //     noseTip.y ,
  //     chin.x ,
  //     chin.y ,
  //     lefteyeleftcorner.x ,
  //     lefteyeleftcorner.y ,
  //     righteyerightcorner.x ,
  //     righteyerightcorner.y ,
  //     leftmouth.x ,
  //     leftmouth.y ,
  //     rightmouth.x ,
  //     rightmouth.y
  // ]);
  // objectPoints = (cv).matFromArray(6, 3, (cv).CV_64F, [
  //   //nose
  //     0.0,
  //     0.0,
  //     0.0,
  //           //chin
  //     0.0,
  //     -330.0,
  //     -65.0,

  //     -225.0,
  //     170.0,
  //     -135.0,

  //     225.0,
  //     170.0,
  //     -135.0,

  //     -150.0,
  //     -150.0,
  //     -125.0,

  //     150.0,
  //     -150.0,
  //     -125.0
  // ]);
  return {
    imagePoints,
    objectPoints,
  };
};
