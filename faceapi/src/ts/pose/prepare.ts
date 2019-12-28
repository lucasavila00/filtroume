import * as faceapi from "face-api.js";

export const generateImageAndObjectPoints = (
  positions: faceapi.Point[],
): {
  imagePoints: number[];
} => {
  const noseTip = positions[30];
  const bottomNose = positions[33];

  const lefteyeleftcorner = positions[36];
  const righteyerightcorner = positions[45];

  const lefteyerightcorner = positions[39];
  const righteyeleftcorner = positions[42];

  const leftmouth = positions[48];
  const rightmouth = positions[54];

  const leftnostril = positions[31];
  const rightnostril = positions[35];

  const imagePoints =
    // Faceapijs inverts y, so we invert it back to carthesian coordinates.
    [
      noseTip.x,
      1 - noseTip.y,
      bottomNose.x,
      1 - bottomNose.y,

      leftnostril.x,
      1 - leftnostril.y,

      rightnostril.x,
      1 - rightnostril.y,

      lefteyeleftcorner.x,
      1 - lefteyeleftcorner.y,
      lefteyerightcorner.x,
      1 - lefteyerightcorner.y,

      righteyerightcorner.x,
      1 - righteyerightcorner.y,
      righteyeleftcorner.x,
      1 - righteyeleftcorner.y,

      leftmouth.x,
      1 - leftmouth.y,
      rightmouth.x,
      1 - rightmouth.y,
    ];

  return {
    imagePoints,
  };
};
