import * as faceapi from "face-api.js"

let inputSize = 128;
let scoreThreshold = 0.5;
export function FuckingRound(num: number, prec =2 ) {
  
  const f = Math.pow(10, prec);
  return Math.floor(num * f) / f;
}

export function isFaceDetectionModelLoaded() {
    return true;
// return !!faceapi.nets.tinyFaceDetector.params;
}

export function getFaceDetectorOptions() {
  return new faceapi.TinyFaceDetectorOptions({
        inputSize,
        scoreThreshold,
      });
}

export function changeInputSize(size: string | number) {
  inputSize = parseInt(String(size), 10);

}