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
  return value;
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
  rvec: import("./opencv/Mat").Mat,
  tvec: import("./opencv/Mat").Mat,
  cameraMatrix: import("./opencv/Mat").Mat,
  distCoeffs: import("./opencv/MatExpr").MatExpr,
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
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -1.26207, -1.14108),
  );
  // left nostril
  geometry.vertices.push(
    new THREE.Vector3(-0.85877, -1.05017, -1.53035),
  );
  //nose tips
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -1.26207, -1.14108),
  );
  // right nostril
  geometry.vertices.push(
    new THREE.Vector3(0.85877, -1.05017, -1.53035),
  );
  //nose tips
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );

  //righteyerightcorner
  geometry.vertices.push(
    new THREE.Vector3(4.49893, 3.21601, -4.22082),
  );
  //righteyeleftcorner
  geometry.vertices.push(
    new THREE.Vector3(1.9326, 3.14086, -3.78216),
  );
  //nose tips
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );

  //lefteyeleftcorner
  geometry.vertices.push(
    new THREE.Vector3(-4.49893, 3.21601, -4.22082),
  );
  //lefteyerightcorner
  geometry.vertices.push(
    new THREE.Vector3(-1.9326, 3.14086, -3.78216),
  );

  //nose tips
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -1.26207, -1.14108),
  );
  // left mouth corner
  geometry.vertices.push(
    new THREE.Vector3(-2.17298, -3.62696, -3.15651),
  );
  //rightmouthcorner
  geometry.vertices.push(
    new THREE.Vector3(2.17298, -3.62696, -3.15651),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -1.26207, -1.14108),
  );
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  line.renderOrder = 50000;
  threeCompositeObject.add(line);
};
