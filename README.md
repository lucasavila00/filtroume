# How to build

- '\$ sh build.sh' on the root folder to build both sites (creator and player),
  put the built versions on the correct folder structure to be used with firebase hosting
  and deploy it.

- 'npm run deploy' inside /functions/ to deploy firebase funtions.

- Also, you may need to set up security rules and cors rules for firebase hosting, storage and firestore.

# Testing just the head tracker

- go to /viewer/ and \$ npm start
- inside /viewer/src/ts/main.ts uncomment line ~270 to pass any images you want for the plane and the LUT.
- inside /viewr/src/ts/three/main.ts uncomment line ~238 to show the facial points being tracked in 3d.

# Project structure

- /viewer/ is the visualizer, where all the 3D and AI code lives. It's a typescript project built with Parcel.
- /creator/ is the creator of the filters. It uses /faceapi/ inside an iframe. It's a typescript project built with Gatsby.
- /functions/ are firebase functions. They're only used because I don't want to donwload firebase sdk and would rather make a simple HTTP request in the clients.
- /tf/ contains the notebook used to generate fake data, train the model and then convert it to tf.js. It also has the trained model as a Keras export and tf.js export (quantized to 1 byte)

# Acknowledgments and good links (these really helped me)

- https://github.com/justadudewhohacks/face-api.js/
- https://github.com/jeeliz/jeelizFaceFilter
- https://www.learnopencv.com/head-pose-estimation-using-opencv-and-dlib/
- http://ksimek.github.io/2012/08/13/introduction/
- https://threejsfundamentals.org/threejs/lessons/threejs-post-processing-3dlut.html
- https://github.com/tensorflow/graphics
