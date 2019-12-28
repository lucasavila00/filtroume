import * as faceapi from "face-api.js";

let inputSize = 128;
let scoreThreshold = 0.2;

export function getFaceDetectorOptions() {
  return new faceapi.TinyFaceDetectorOptions({
    inputSize,
    scoreThreshold,
  });
}
