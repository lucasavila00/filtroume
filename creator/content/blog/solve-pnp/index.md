---
title: Train a Neural Network to solve PnP and avoid 1.3mb of wasm+js
date: "2019-12-30T12:18:16.975Z"
description: "What if I told that you could cheat and use ML instead of using OpenCV or reimplementing it's algorithms?"
---

# Whoa, 1.3MB

## Take all of this with a grain of salt.

- The AI model+weights are only 7kb but we need Tensorflow to use it;

- Tensorflow-Core + Tensorflow-Layers are a ~600kb download.

# BUT

At Filtrou.me we **HAD** to use Tensorflow to get facial keypoins anyway. So, in **THIS** app, I was able to save 1.3mb of wasm and js.

I have no idea about code size necessary to implement SolvePnP on pure JS.

Some implementations are just ~400 lines of C++ but they used the Eigen library. And God knows what library Eigen uses and how many LOCs Eigen has...

And it's just better to sit and watch a model train than to implement linear algebra operations from scratch in javascript.

![watching a model train](./model-train.jpg)

<center>
<small>Watching a model train.</small>
</center>

# How to train the AI

I won't go into much detail here because I trained it all using Jupyter Notebook and described how it works there.
You can run the entire program (data generation and then the model training) on a Google Colab in less than 15 minutes (with GPU enabled).

## Take a look

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/lucasavila00/filtroume/blob/master/tf/all.ipynb)

# Results

Given the way Filtrou.me works, [as I explaiend in my last blog post](/build-one-yourself), I was able to train the neural network on a very small domain. That is, face-api.js configured as I use it (lowest resolution and with the faster/more innacurate network) won't recognize faces more than 1 meter away.

So I could train the network with data generated within this radius.

And as the user will be looking at the camera I also generated _images_ where the face is mostly looking at the camera.

I used a **LOT** of noise on top of the training data and this made it work on real life, pretty well.

And, of course, to avoid overfitting (it would work on generated data but not in real life) the best I could do is have a very simple network and normalize/scale the features.

I tried to use dropout, SELU as activation, have a deeper network or add more neuron per layer but it would all eventually decrease performance on the real world.

# Take away

If you're doing something for the web and downloading an external dependency to run some calculations is expensive, try to train a simple neural network to solve it.

# See it in action

[A published filter on Filtrou.me](https://filtrou.me/hpbb)

# Doubts?

[Take a look at Filtrou.me source code](https://github.com/lucasavila00/filtroume)

[Talk to me on Twitter](https://twitter.com/lucasavila00)
