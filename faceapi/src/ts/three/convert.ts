import KalmanFilter from "../kalman";
import * as THREE from "three";
const kalmanConfig = { R: 1, Q: 3 };
const rx = new KalmanFilter(kalmanConfig);
const ry = new KalmanFilter(kalmanConfig);
const rz = new KalmanFilter(kalmanConfig);

export const decodeRvec = (
  q: THREE.Quaternion,
): THREE.Quaternion => {
  const euler = new THREE.Euler();
  euler.setFromQuaternion(q);
  const euler_opengl = new THREE.Euler(
    rx.filter(euler.x),
    ry.filter(euler.y),
    rz.filter(euler.z),
  );
  const nq = new THREE.Quaternion();
  nq.setFromEuler(euler_opengl);
  return nq;
};
