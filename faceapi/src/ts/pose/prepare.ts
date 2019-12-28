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
    // The neural network was trained with x and y inverted.
    // Faceapijs alerady inverts y, so we only need to invert x here.
    [
      1 - noseTip.x,
      noseTip.y,
      1 - bottomNose.x,
      bottomNose.y,

      1 - leftnostril.x,
      leftnostril.y,

      1 - rightnostril.x,
      rightnostril.y,

      1 - lefteyeleftcorner.x,
      lefteyeleftcorner.y,
      1 - lefteyerightcorner.x,
      lefteyerightcorner.y,

      1 - righteyerightcorner.x,
      righteyerightcorner.y,
      1 - righteyeleftcorner.x,
      righteyeleftcorner.y,

      1 - leftmouth.x,
      leftmouth.y,
      1 - rightmouth.x,
      rightmouth.y,
    ];

  return {
    imagePoints,
  };
};
