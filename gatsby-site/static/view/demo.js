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
const getLutUrl = () => {
    if (window.parent && window.parent._lut) {
        return window.parent._lut;
    }

    return defaultLut;
};
const getImageUrl = () => {
    if (window.parent && window.parent._img) {
        return window.parent._img;
    }

    return defaultImage;
};
//launched by body.onload() :
function main() {
    const info = {
        lut: {
            url: getLutUrl(),
            size: 16,
        },
        images: {
            top: getImageUrl(),
        },
    };
    JeelizResizer.size_canvas({
        isFullScreen: true,
        canvasId: "jeeFaceFilterCanvas",
        callback: function(isError, bestVideoSettings) {
            init_faceFilter(bestVideoSettings, info);
        },
        onResize: function() {
            THREE.JeelizHelper.update_camera(THREECAMERA);
        },
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
        NNCpath: "./dist/", // root of NNC.json file
        callbackReady: function(errCode, spec) {
            if (errCode) {
                console.log("AN ERROR HAPPENS. SORRY BRO :( . ERR =", errCode);
                return;
            }

            console.log("INFO : JEEFACEFILTERAPI IS READY");
            init_threeScene(spec, info.images);
            THREE.JeelizHelper.registerCamera(THREECAMERA, info.lut);
        }, // end callbackReady()

        // called at each render iteration (drawing loop)
        callbackTrack: function(detectState) {
            TWEEN.update();
            THREE.JeelizHelper.render(detectState, THREECAMERA);
        }, // end callbackTrack()
    }); // end JEEFACEFILTERAPI.init call
} // end main()