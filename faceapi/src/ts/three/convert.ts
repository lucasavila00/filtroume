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
  // Apply Kalman filter while in Rodrigues coordinates
  // as it wont flip axes and is meaningful for interpolations
  const rout = new cv.Mat();
  const temp = cv.matFromArray(3, 1, cv.CV_64F, [
    rvec.data64F[0],
    rvec.data64F[1],
    rvec.data64F[2],
  ]);

  // const temp = cv.matFromArray(3, 1, cv.CV_64F, [
  //   rvec.data64F[0],
  //   rvec.data64F[1],
  //   rvec.data64F[2],
  // ]);

  // convert from rodrigues to a rotation matrix
  (cv as any).Rodrigues(temp, rout);

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

  // TODO: why this coordinate change is needed?
  // TODO: move to another function
  return {
    x: euler.x - Math.PI,
    y: -euler.y,
    z: -euler.z,
  };
};
