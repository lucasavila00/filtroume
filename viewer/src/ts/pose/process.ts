import { gotTvec, gotRvec } from "../three/main";
import * as THREE from "three";
import KalmanFilter from "../kalman";
import { LayersModel } from "@tensorflow/tfjs-layers";
import * as tf from "@tensorflow/tfjs-core";

const denormalizeOutput = (output: number[]) => {
  const scale = [
    0.2757907,
    0.27300393,
    0.2815135,
    0.06738858,
    19.90217464,
    20.18727223,
    14.15780724,
  ];
  const mean = [
    -7.08806138e-3,
    -1.44241489e-3,
    2.81328166e-4,
    8.7496564e-1,
    6.67847506e-2,
    -5.86922866e-1,
    -6.17359176e1,
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
    [tf.tensor([...imagePoints], [1, 6, 2])],
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
  resizedResult: number[][],
  model: LayersModel,
) {
  const flattenedResults = resizedResult.reduce(
    (p, c) => [...p, ...c],
    [],
  );
  const denormalizedResponse = denormalizeOutput(
    await pnpWithAi(flattenedResults, model),
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
