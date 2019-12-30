# How to build/deploy

- '\$ sh deploy.sh' on the root folder to build both sites (creator and player),
  put the built versions in the correct folder structure to be used with firebase hosting
  and deploy it.

- 'npm run deploy' inside /functions/ to deploy firebase funtions.

- You also need to set up security rules and cors rules for firebase hosting, storage and firestore.

# Testing just the head tracker

- go to /viewer/ and \$ npm start

# The notebook used to generate data and train the AI to solve PnP

- /tf/all.ipynb (runs in ~15min on a Google Colab with GPU)
  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/lucasavila00/filtroume/blob/master/tf/all.ipynb)

- /tf/to_js.ipynb converts from Keras (.h5) to TF.JS

# Project structure

- /viewer/ is the visualizer, where all the 3D and AI code lives. It's a typescript project built with Parcel.
- /creator/ is the creator of the filters. It uses /viewer/ inside an iframe. It's a typescript project built with Gatsby.
- /functions/ are firebase functions. They're only used because I don't want to download the Firebase SDK and would rather make a simple HTTP request in the clients.
- /tf/ contains the notebook used to generate fake data, train the model and then convert it to tf.js. It also has the trained model as a Keras export and tf.js export (quantized to 1 byte)

# Acknowledgments and good links (these really helped me)

- https://github.com/justadudewhohacks/face-api.js/
- https://github.com/jeeliz/jeelizFaceFilter
- https://www.learnopencv.com/head-pose-estimation-using-opencv-and-dlib/
- http://ksimek.github.io/2012/08/13/introduction/
- https://threejsfundamentals.org/threejs/lessons/threejs-post-processing-3dlut.html
- https://github.com/tensorflow/graphics
