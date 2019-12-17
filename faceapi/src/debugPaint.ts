import KalmanFilter from "kalmanjs";
import * as faceapi from "face-api.js";
import * as THREE from "three";
import { CV } from "./opencv";
declare var cv: CV;

const kalmanconfig = { R: 1, Q: 50 };
const cache: { [key: string]: any } = {
  nosetipx: new KalmanFilter(kalmanconfig),
  nosetipy: new KalmanFilter(kalmanconfig),
  frontx: new KalmanFilter(kalmanconfig),
  fronty: new KalmanFilter(kalmanconfig),
  topx: new KalmanFilter(kalmanconfig),
  topy: new KalmanFilter(kalmanconfig),
  sidex: new KalmanFilter(kalmanconfig),
  sidey: new KalmanFilter(kalmanconfig),
};
const smooth = (name: string, value: number) => {
  return cache[name].filter(value);
};

const drawDebugCube = (
  ctx: CanvasRenderingContext2D,
  _noseTip: { x: number; y: number },
  _frontx: number,
  _fronty: number,
  _topx: number,
  _topy: number,
  _sidex: number,
  _sidey: number,
) => {
  try {
    const noseTip = {
      x: smooth("nosetipx", _noseTip.x),
      y: smooth("nosetipy", _noseTip.y),
    };
    const frontx = smooth("frontx", _frontx);
    const fronty = smooth("fronty", _fronty);

    const topx = smooth("topx", _topx);
    const topy = smooth("topy", _topy);

    const sidex = smooth("sidex", _sidex);
    const sidey = smooth("sidey", _sidey);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(frontx, fronty, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.arc(noseTip.x, noseTip.y, 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.moveTo(frontx, fronty);
    ctx.lineTo(noseTip.x, noseTip.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.fillStyle = "green";
    ctx.moveTo(topx, topy);
    ctx.lineTo(noseTip.x, noseTip.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    ctx.moveTo(sidex, sidey);
    ctx.lineTo(noseTip.x, noseTip.y);
    ctx.stroke();
  } catch (err) {
    console.error("errrrr");
    console.error(err);
  }
};

export function drawCube(
  rvec: import("/Users/lucasdeavilamartins/ff/faceapi/src/opencv/Mat").Mat,
  tvec: import("/Users/lucasdeavilamartins/ff/faceapi/src/opencv/Mat").Mat,
  cameraMatrix: import("/Users/lucasdeavilamartins/ff/faceapi/src/opencv/Mat").Mat,
  distCoeffs: import("/Users/lucasdeavilamartins/ff/faceapi/src/opencv/MatExpr").MatExpr,
  positions: faceapi.Point[],
  canvas: HTMLCanvasElement,
) {
  const pointf = cv.matFromArray(3, 1, cv.CV_64F, [
    0,
    0,
    1000,
  ]);
  const outarrf = new cv.Mat();
  const jacobf = new cv.Mat();
  cv.projectPoints(
    pointf,
    rvec,
    tvec,
    cameraMatrix,
    distCoeffs,
    outarrf,
    jacobf,
  );
  let frontx = outarrf.data64F[0];
  let fronty = outarrf.data64F[1];
  const pointt = cv.matFromArray(3, 1, cv.CV_64F, [
    0,
    1000,
    0,
  ]);
  const outarrt = new cv.Mat();
  const jacobt = new cv.Mat();
  cv.projectPoints(
    pointt,
    rvec,
    tvec,
    cameraMatrix,
    distCoeffs,
    outarrt,
    jacobt,
  );
  let topx = outarrt.data64F[0];
  let topy = outarrt.data64F[1];
  const points = cv.matFromArray(3, 1, cv.CV_64F, [
    1000,
    0,
    0,
  ]);
  const outarrs = new cv.Mat();
  const jacobs = new cv.Mat();
  cv.projectPoints(
    points,
    rvec,
    tvec,
    cameraMatrix,
    distCoeffs,
    outarrs,
    jacobs,
  );
  let sidex = outarrs.data64F[0];
  let sidey = outarrs.data64F[1];
  const noseTip = positions[30];
  let ctx = canvas.getContext("2d")!;
  drawDebugCube(
    ctx,
    noseTip,
    frontx,
    fronty,
    topx,
    topy,
    sidex,
    sidey,
  );
}

export const lines = (
  threeCompositeObject: THREE.Object3D,
) => {
  var material = new THREE.LineBasicMaterial({
    color: "green",
    linewidth: 25,
  });
  var geometry = new THREE.Geometry();

  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -60.0, -78.0),
  );
  // left nostril
  geometry.vertices.push(
    new THREE.Vector3(-67.0, -58.0, -100.0),
  );
  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -60.0, -78.0),
  );
  // right nostril
  geometry.vertices.push(
    new THREE.Vector3(67.0, -58.0, -100.0),
  );
  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  //righteyerightcorner
  geometry.vertices.push(
    new THREE.Vector3(262.0, 168.0, -240.0),
  );
  //righteyeleftcorner
  geometry.vertices.push(
    new THREE.Vector3(115.0, 170.0, -210.0),
  );
  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  //lefteyeleftcorner
  geometry.vertices.push(
    new THREE.Vector3(-262.0, 168.0, -240.0),
  );
  //lefteyerightcorner
  geometry.vertices.push(
    new THREE.Vector3(-115.0, 170.0, -210.0),
  );
  //nose tips
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -60.0, -78.0),
  );
  // left mouth corner
  geometry.vertices.push(
    new THREE.Vector3(-148.0, -192.0, -181.0),
  );
  //rightmouthcorner
  geometry.vertices.push(
    new THREE.Vector3(148.0, -192.0, -181.0),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -60.0, -78.0),
  );
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  line.renderOrder = 50000;
  threeCompositeObject.add(line);
};
