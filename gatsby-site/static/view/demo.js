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
    });
    const CLOUDMESH = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    CLOUDMESH.position.setY(1.5);
    CLOUDMESH.frustumCulled = false;
    CLOUDMESH.renderOrder = 10000;

    const mat2 = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(images.bottom),
    });
    const CLOUDMESH2 = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat2);
    CLOUDMESH2.position.setY(-1.5);
    CLOUDMESH2.frustumCulled = false;
    CLOUDMESH2.renderOrder = 10000;

    const CLOUDOBJ3D = new THREE.Object3D();
    CLOUDOBJ3D.add(CLOUDMESH);
    CLOUDOBJ3D.add(CLOUDMESH2);

    threeStuffs.faceObject.add(CLOUDOBJ3D);

    // CREATE THE CAMERA
    THREECAMERA = THREE.JeelizHelper.create_camera();
} // end init_threeScene()

//launched by body.onload() :
function main() {
    if (window.parent) {
        console.log({ lut: window.parent._lut, img: window.parent._img });
    }
    // TODO: construir a info com a url
    const info = {
        lut: {
            url: "https://threejsfundamentals.org/threejs/resources/images/lut/saturated-s8.png",
            size: 8,
        },
        images: {
            top: "./models/a.jpg",
            bottom: "./models/a.jpg",
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