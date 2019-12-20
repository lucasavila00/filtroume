// import KalmanFilter from "kalmanjs";
import * as THREE from "three";
import { CV } from "../opencv";

declare var cv: CV;
// const kalmanconfig = { R: 50, Q: 50 };

interface VecTransport {
  x: number;
  y: number;
  z: number;
}

export const decodeRvec = (
  rvec: import("../opencv/Mat").Mat,
): VecTransport => {
  const rout = new cv.Mat();

  // convert from rodrigues to a rotation matrix
  (cv as any).Rodrigues(rvec, rout);

  // apply padding to get a 4x4 three rotation matrix
  // from a 3x3 opencv rotation matrix
  var mat = new THREE.Matrix4();
  const r = rout.data64F;
  // prettier-ignore
  mat.set(
    r[0], r[1], r[2], 0,
    r[3], r[4], r[5], 0,
    r[6], r[7], r[8], 0,
    0,    0,    0,    1,
    );

  // get euler coordinates so that we can change them easier
  const euler = new THREE.Euler();
  euler.setFromRotationMatrix(mat);

  // free memory
  rout.delete();

  // open cv to open gl needs this conversion
  return {
    x: euler.x,
    y: -euler.y,
    z: -euler.z,
  };
};
