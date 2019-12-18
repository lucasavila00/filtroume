import * as faceapi from "face-api.js";

import { CV } from "../opencv";
import { Mat } from "../opencv/Mat";
declare var cv: CV;

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

  const imagePoints = cv.matFromArray(10, 2, cv.CV_64F, [
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
  ]);
  //from sparkar
  const objectPoints = cv.matFromArray(10, 3, cv.CV_64F, [
    //nose tips
    0.0,
    0.0,
    0.0,

    // bottom nose
    0.0,
    -60.0,
    -78.0,

    // left nostril
    -67.0,
    -58.0,
    -100.0,

    // right nostril
    67.0,
    -58.0,
    -100.0,

    //chin
    // -6.0,
    // -400.0,
    // -150.0,

    //lefteyeleftcorner
    -262.0,
    168.0,
    -240.0,
    //lefteyerightcorner
    -115.0,
    170.0,
    -210.0,

    //righteyerightcorner
    262.0,
    168.0,
    -240.0,
    //righteyeleftcorner
    115.0,
    170.0,
    -210.0,

    // // left mouth corner
    -148.0,
    -192.0,
    -181.0,
    //rightmouthcorner
    148.0,
    -192.0,
    -181.0,
  ]);

  // imagePoints = (cv).matFromArray(6, 2, (cv).CV_64F, [
  //     noseTip.x,
  //     noseTip.y,
  //     chin.x,
  //     chin.y,
  //     lefteyeleftcorner.x,
  //     lefteyeleftcorner.y,
  //     righteyerightcorner.x,
  //     righteyerightcorner.y,
  //     leftmouth.x,
  //     leftmouth.y,
  //     rightmouth.x,
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
