---
title: Train a Neural Network to solve PnP and avoid 1.3mb of wasm+js
date: "2019-12-29T18:18:16.975Z"
description: "What if I told that you could cheat and use ML instead of using OpenCV or reimplementing it's algorithms?"
---

# Whoa, 1.3MB

## Take all of this with a grain of salt.

- The AI model is only 7kb but we need Tensorflow to use it.

- Tensorflow-Core + Tensorflow-Layers are a ~750kb download.

- OpenCV is faster to execute.

# BUT

At Filtrou.me we **HAD** to use Tensorflow to get facial keypoins anyway. So, in **THIS** app, I was able to save 1.3mb of wasm and js.

I have no idea about code size necessary to implement SolvePnP on pure JS.

Some implementations are just ~400 lines of C++ but they used the Eigen library. And God knows what library Eigen uses and how many LOCs Eigen has...

And it's just better to sit and watch a model train than to implement linear algebra operations from scratch in javascript.

![watching a model train](./model-train.jpg)

<center>
<small>Watching a model train.</small>
</center>
