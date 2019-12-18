import * as faceapi from "face-api.js";

let inputSize = 128;
let scoreThreshold = 0.5;
export function PrecisionRound(num: number, prec = 2) {
  const f = Math.pow(10, prec);
  return Math.floor(num * f) / f;
}

export function getFaceDetectorOptions() {
  return new faceapi.TinyFaceDetectorOptions({
    inputSize,
    scoreThreshold,
  });
}
