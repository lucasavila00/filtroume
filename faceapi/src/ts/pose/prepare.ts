import * as faceapi from "face-api.js";

import KalmanFilter from "../kalman";

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
  return xs;
  // return xs.map((x, index) => ks[index].filter(x));
};

export const generateImageAndObjectPoints = (
  positions: faceapi.Point[],
): {
  imagePoints: number[];
} => {
  const noseTip = positions[30];
  const bottomNose = positions[33];

  const lefteyeleftcorner = positions[36];
  const righteyerightcorner = positions[45];

  const lefteyerightcorner = positions[39];
  const righteyeleftcorner = positions[42];

  const leftmouth = positions[48];
  const rightmouth = positions[54];

  const leftnostril = positions[31];
  const rightnostril = positions[35];

  const imagePoints =
    // cv.matFromArray(
    //   10,
    //   2,
    //   cv.CV_64F,
    // a rede neural foi treinada com x e y invertidos.
    // o faceapijs ja inverte o y, precisamos inverter o x
    applyKalman([
      1 - noseTip.x,
      noseTip.y,
      1 - bottomNose.x,
      bottomNose.y,

      1 - leftnostril.x,
      leftnostril.y,

      1 - rightnostril.x,
      rightnostril.y,

      1 - lefteyeleftcorner.x,
      lefteyeleftcorner.y,
      1 - lefteyerightcorner.x,
      lefteyerightcorner.y,

      1 - righteyerightcorner.x,
      righteyerightcorner.y,
      1 - righteyeleftcorner.x,
      righteyeleftcorner.y,

      1 - leftmouth.x,
      leftmouth.y,
      1 - rightmouth.x,
      rightmouth.y,
    ]);
  // );

  //from sparkar
  // const objectPoints =
  //   //  cv.matFromArray(10, 3, cv.CV_64F,
  //   [
  //     //nose tips0
  //     0.0,
  //     -1 * 0.003874,
  //     -1 * 0.290468,

  //     // bottom nose1
  //     0.0,
  //     -1 * -1.26207,
  //     -1 * -1.14108,

  //     // left nostril2
  //     -0.85877,
  //     -1 * -1.05017,
  //     -1 * -1.53035,

  //     // right nostril3
  //     0.85877,
  //     -1 * -1.05017,
  //     -1 * -1.53035,

  //     //chin
  //     // 0.0,g
  //     // -8.01629,
  //     // -3.32839,

  //     //lefteyeleftcorner4
  //     -4.49893,
  //     -1 * 3.21601,
  //     -1 * -4.22082,

  //     //lefteyerightcorner5
  //     -1.9326,
  //     -1 * 3.14086,
  //     -1 * -3.78216,

  //     //righteyerightcorner6
  //     4.49893,
  //     -1 * 3.21601,
  //     -1 * -4.22082,

  //     //righteyeleftcorner7
  //     1.9326,
  //     -1 * 3.14086,
  //     -1 * -3.78216,

  //     // left mouth corner8
  //     -2.17298,
  //     -1 * -3.62696,
  //     -1 * -3.15651,
  //     //rightmouthcorner9
  //     2.17298,
  //     -1 * -3.62696,
  //     -1 * -3.15651,
  //   ];
  // );

  return {
    imagePoints,
  };
};
