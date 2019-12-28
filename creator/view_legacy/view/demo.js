"use strict";

// some globalz :
let THREECAMERA;

// callback : launched if a face is detected or lost. TODO : add a cool particle effect WoW !
function detect_callback(isDetected) {
  if (isDetected) {
    console.log("INFO in detect_callback() : DETECTED");
  } else {
    console.log("INFO in detect_callback() : LOST");
  }
}

// build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec, images) {
  const threeStuffs = THREE.JeelizHelper.init(spec, detect_callback);
  const mat = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(images.top),
    transparent: true,
  });
  const CLOUDMESH = new THREE.Mesh(new THREE.PlaneGeometry(3.75, 3.75), mat);
  CLOUDMESH.position.setY(0.325);
  CLOUDMESH.frustumCulled = false;
  CLOUDMESH.renderOrder = 10000;

  const CLOUDOBJ3D = new THREE.Object3D();
  CLOUDOBJ3D.add(CLOUDMESH);

  threeStuffs.faceObject.add(CLOUDOBJ3D);

  // CREATE THE CAMERA
  THREECAMERA = THREE.JeelizHelper.create_camera();
} // end init_threeScene()
const defaultLut = "/luts/lut0.png"; // TODO: substituir pelo png no tamanho certo
const defaultImage = "/luts/lut0.png"; // TODO: substituir por algo transparente

function parseURL(url) {
  var parser = document.createElement("a"),
    searchObject = {},
    queries,
    split,
    i;
  // Let the browser do the work
  parser.href = url;
  // Convert query string to object
  queries = parser.search.replace(/^\?/, "").split("&");
  for (i = 0; i < queries.length; i++) {
    split = queries[i].split("=");
    searchObject[split[0]] = split[1];
  }
  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    searchObject: searchObject,
    hash: parser.hash,
  };
}

const getInfo = (cb) => {
  if (window.parent && window.parent._lut && window.parent._img) {
    return cb({
      lut: {
        url: window.parent._lut,
        size: 16,
      },
      images: {
        top: window.parent._img,
      },
    });
  }

  const parsed = parseURL(window.location.href);
  const pathname = parsed.pathname.split("/").join("");
  const url =
    "https://us-central1-filterme.cloudfunctions.net/filterUrls?id=" + pathname;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data) {
        cb(null);
      } else if (data.error) {
        cb(null);
      } else {
        cb({
          pathname,
          lut: {
            url: data.lut,
            size: 16,
          },
          images: {
            top: data.image,
          },
        });
      }
    })
    .catch(() => cb(null));
};

function hideLoading() {
  const ref = document.getElementsByClassName("loader")[0];

  ref.style.display = "none";
}

function showError(type) {
  console.error("GOT ERROR: " + type);
  hideLoading();
  // TODO: show error...
  if (type === "webcam") {
    showNoWebcamError();
  } else if (type === "notfound") {
    showErrorNotFound();
  } else {
    showUnknownError();
  }
}

function showNoWebcamError() {
  // TODO: show error

  const ref = document.getElementsByClassName("webCamError")[0];

  ref.style.display = "inline";
}

function showErrorNotFound() {
  // TODO: show error
  const ref = document.getElementsByClassName("notFoundError")[0];

  ref.style.display = "inline";
}

function showUnknownError() {
  // TODO: show error
  const ref = document.getElementsByClassName("unknownError")[0];

  ref.style.display = "inline";
}

function showInfoPathname(pathname) {
  console.log({ pathname });
  // TODO: mostrar o pathname
}

function showTutorial() {
  hideLoading();
  const ref = document.getElementsByClassName("tutorial")[0];
  ref.style.display = "inline";
  setTimeout(() => {
    ref.style.display = "none";
  }, 9000);
}

//launched by body.onload() :
function main() {
  getInfo((info) => {
    if (info) {
      JeelizResizer.size_canvas({
        isFullScreen: true,
        canvasId: "jeeFaceFilterCanvas",
        callback: function(isError, bestVideoSettings) {
          if (isError) {
            showError("jeeliz");
          } else {
            init_faceFilter(bestVideoSettings, info);
            showTutorial();
            if (info.pathname) {
              showInfoPathname(info.pathname);
            }
          }
        },
        onResize: function() {
          THREE.JeelizHelper.update_camera(THREECAMERA);
        },
      });
    } else {
      // mostra erro
      showError("notfound");
    }
  });
} //end main()

function init_faceFilter(videoSettings, info) {
  JEEFACEFILTERAPI.init({
    videoSettings: {
      //increase the default video resolution since we are in full screen
      idealWidth: 1280, //ideal video width in pixels
      idealHeight: 800, //ideal video height in pixels
      maxWidth: 1920, //max video width in pixels
      maxHeight: 1920, //max video height in pixels
    },
    followZRot: true,
    canvasId: "jeeFaceFilterCanvas",
    NNCpath: "/view/dist/", // root of NNC.json file
    callbackReady: function(errCode, spec) {
      if (errCode) {
        console.log("AN ERROR HAPPENS. SORRY BRO :( . ERR =", errCode);
        showError("webcam");
        return;
      }

      console.log("INFO : JEEFACEFILTERAPI IS READY");
      init_threeScene(spec, info.images);
      THREE.JeelizHelper.registerCamera(THREECAMERA, info.lut);
    }, // end callbackReady()

    // called at each render iteration (drawing loop)
    callbackTrack: function(detectState) {
      THREE.JeelizHelper.render(detectState, THREECAMERA);
    }, // end callbackTrack()
  }); // end JEEFACEFILTERAPI.init call
} // end main()
