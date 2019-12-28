import * as faceapi from "face-api.js";
import { generateImageAndObjectPoints } from "./prepare";
import { gotTvec, gotRvec } from "../three/main";
import * as THREE from "three";
import KalmanFilter from "../kalman";
import { LayersModel } from "@tensorflow/tfjs-layers";
import * as tf from "@tensorflow/tfjs-core";

const denormalizeOutput = (output: number[]) => {
  const scale = [
    0.27886152,
    0.27881693,
    0.28100003,
    0.06806152,
    20.15907429,
    20.19870753,
    14.49564505,
  ];
  const mean = [
    -2.12522415e-3,
    2.64508744e-4,
    -1.33624768e-3,
    8.72294454e-1,
    2.55325474e-2,
    -2.17989691e-1,
    -6.12684035e1,
  ];

  return output.map((x, i) => x * scale[i] + mean[i]);
};
const kalmanConfig = { R: 1, Q: 3 };

const kx = new KalmanFilter(kalmanConfig);
const ky = new KalmanFilter(kalmanConfig);
const kz = new KalmanFilter(kalmanConfig);
const rx = new KalmanFilter(kalmanConfig);
const ry = new KalmanFilter(kalmanConfig);
const rz = new KalmanFilter(kalmanConfig);

const applyKalmanOnRotation = (
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

const pnpWithAi = async (
  imagePoints: number[],
  model: LayersModel,
) => {
  const prediction = model.predict(
    [tf.tensor([...imagePoints], [1, 10, 2])],
    { batchSize: 1 },
  );
  if (prediction instanceof Array) {
    // This will never happen but let's make TS happy :)
    throw "Incorrect data shape.";
  } else {
    const data = await prediction.data();
    return [...data];
  }
};

export async function extractHeadPoseInfo(
  resizedResult: faceapi.WithFaceLandmarks<
    { detection: faceapi.FaceDetection },
    faceapi.FaceLandmarks68
  >,
  model: LayersModel,
) {
  const positions = resizedResult.landmarks.positions;
  const { imagePoints } = generateImageAndObjectPoints(
    positions,
  );

  const denormalizedResponse = denormalizeOutput(
    await pnpWithAi(imagePoints, model),
  );

  var q = new THREE.Quaternion(
    denormalizedResponse[0],
    denormalizedResponse[1],
    denormalizedResponse[2],
    denormalizedResponse[3],
  );

  gotRvec(applyKalmanOnRotation(q));
  gotTvec(
    kx.filter(denormalizedResponse[4]),
    ky.filter(denormalizedResponse[5]),
    kz.filter(denormalizedResponse[6]),
  );
}
