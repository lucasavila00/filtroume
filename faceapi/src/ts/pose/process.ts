import * as faceapi from "face-api.js";
import { generateImageAndObjectPoints } from "./prepare";
import { gotTvec, gotRvec } from "../three/main";
import * as THREE from "three";
import KalmanFilter from "../kalman";

const denormalize_output = (output: number[]) => {
  const scale = [
    0.27826497,
    0.27882718,
    0.28062612,
    0.06817394,
    20.16609635,
    20.19031697,
    14.49778802,
  ];
  const mean = [
    -2.33248697e-3,
    3.50833716e-4,
    6.01956989e-4,
    8.72593478e-1,
    -6.62163347e-3,
    -1.1112033e-1,
    -6.12360264e1,
  ];

  return output.map((x, i) => x * scale[i] + mean[i]);
};
const kalmanConfig = { R: 1, Q: 3 };
const kx = new KalmanFilter(kalmanConfig);
const ky = new KalmanFilter(kalmanConfig);
const kz = new KalmanFilter(kalmanConfig);

export async function extractHeadPoseInfo(
  resizedResult: faceapi.WithFaceLandmarks<
    { detection: faceapi.FaceDetection },
    faceapi.FaceLandmarks68
  >,
  pnpWithAi: (
    x: number[],
  ) => Promise<{
    data: number[];
  }>,
) {
  const positions = resizedResult.landmarks.positions;
  const { imagePoints } = generateImageAndObjectPoints(
    positions,
  );

  try {
    const res = await pnpWithAi(imagePoints);

    const den = denormalize_output(res.data);

    var q = new THREE.Quaternion(
      den[0],
      den[1],
      den[2],
      den[3],
    );

    gotRvec(q);

    gotTvec(
      kx.filter(den[4]),
      ky.filter(den[5]),
      kz.filter(den[6]),
    );
  } catch (err) {
    console.error("error resolving pose!!!!");
    console.error(err);
    throw err;
  }
}
