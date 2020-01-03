---
title: Filtrou.me now uses Blazeface from Tensorflow
date: "2020-01-03T21:44:56.869Z"
description: "At low end mobile phones it now runs at more than 24 fps"
---

# What is Blazeface?

Blazeface is a new face recognition and tracking model made and trained by the Tensorflow team.
It was released a couple of days ago and is available at Tensorflow Hub, Github and NPM.

It is **BLAZING** fast to recognize the face position and 6 keypoints on the face.

Check the project's [Github page](https://github.com/tensorflow/tfjs-models/tree/master/blazeface) to find more about it.

# The changes on Filtrou.me

We had to use 6 keypoints to track face pose instead of 10 and no visual quality of the tracking was lost.
So it means the PnP solver we use had to be retrained.
Blazeface's output is a little jitter but using a Kalman filter will make it almost disapear (not a change because we were already using it, but it's worth mentioning).
Other than that our code is the same and we got almost a 3x performance boost (measured on a single phone).

# Use the PnP solver yourself

The trained model can be found [here](https://github.com/lucasavila00/filtroume/tree/master/tf_blaze).
Using it is a pice of cake!

```typescript
const imageWidth = 720;
const imageHeight = 1280;

// Helper functions
const normalizeLandmarks = (lmks: number[][]) => {
  return lmks
    .map((point) => {
      const x = point[0] / imageWidth;
      // invert Y because the pose model treats Y positive
      // going up while Blazeface treats it as going down.
      const y = 1 - point[1] / imageHeight;

      return [x, y];
    })
    .reduce(
      // flatten the array
      (p, c) => [...p, ...c],
      [],
    );
};
// These are the constants we got while training
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

async function main() {
  // Load Blazeface.
  const blazemodel = await blazeface.load();

  // loadLayersModel is from @tensorflow/tfjs-layers
  const posemodel = await loadLayersModel("https://pathto.com/model.json");

  const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
  const predictions = await blazemodel.estimateFaces(
    document.querySelector("img"),
    returnTensors,
  );

  const poses = predictions.map((prediction) => {
    const normalized = normalizeLandmarks(prediction.landmarks);

    const modelResponse = await model
      .predict([tf.tensor(normalized, [1, 6, 2])], { batchSize: 1 })
      .data();

    const denormalized = denormalizeOutput(modelResponse);

    const rotation = new Quaternion(
      denormalized[0], // x
      denormalized[1], // y
      denormalized[2], // z
      denormalized[3], // w
    );

    const translation = new Vector3(
      denormalized[4], // x
      denormalized[5], // y
      denormalized[6], // z
    );

    return { rotation, translation };
  });

  // do what you want with the poses
  console.log(poses);
}
```

# See it in action

[A published filter on Filtrou.me](https://filtrou.me/hpbb)

# Doubts?

[Take a look at Filtrou.me source code](https://github.com/lucasavila00/filtroume)

[Talk to me on Twitter](https://twitter.com/lucasavila00)
