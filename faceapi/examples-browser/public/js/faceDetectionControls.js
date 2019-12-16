const SSD_MOBILENETV1 = "ssd_mobilenetv1";
const TINY_FACE_DETECTOR = "tiny_face_detector";

let selectedFaceDetector = TINY_FACE_DETECTOR;

// ssd_mobilenetv1 options
let minConfidence = 0.5;

// tiny_face_detector options
let inputSize = 128;
let scoreThreshold = 0.5;

//mtcnn options
let minFaceSize = 20;
function FuckingRound(num, prec) {
  if (prec == null) {
    prec = 2;
  }
  const f = Math.pow(10, prec);
  return Math.floor(num * f) / f;
}

function getFaceDetectorOptions() {
  return selectedFaceDetector === SSD_MOBILENETV1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : new faceapi.TinyFaceDetectorOptions({
        inputSize,
        scoreThreshold,
      });
}


function changeInputSize(size) {
  inputSize = parseInt(size);

}

function getCurrentFaceDetectionNet() {
  if (selectedFaceDetector === SSD_MOBILENETV1) {
    return faceapi.nets.ssdMobilenetv1;
  }
  if (selectedFaceDetector === TINY_FACE_DETECTOR) {
    return faceapi.nets.tinyFaceDetector;
  }

  if (selectedFaceDetector === MTCNN) {
    return faceapi.nets.mtcnn;
  }
}

function isFaceDetectionModelLoaded() {
  return !!getCurrentFaceDetectionNet().params;
}

async function changeFaceDetector(detector) {


  selectedFaceDetector = detector;


  if (!isFaceDetectionModelLoaded()) {
    await getCurrentFaceDetectionNet().load("/");
  }


}

