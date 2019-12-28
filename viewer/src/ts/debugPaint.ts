import * as THREE from "three";

export const lines = (
  threeCompositeObject: THREE.Object3D,
) => {
  var material = new THREE.LineBasicMaterial({
    color: "green",
    linewidth: 5,
  });
  var geometry = new THREE.Geometry();

  //nose tips
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -1.26207, -1.14108),
  );
  // left nostril
  geometry.vertices.push(
    new THREE.Vector3(-0.85877, -1.05017, -1.53035),
  );
  //nose tips
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -1.26207, -1.14108),
  );
  // right nostril
  geometry.vertices.push(
    new THREE.Vector3(0.85877, -1.05017, -1.53035),
  );
  //nose tips
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );

  //righteyerightcorner
  geometry.vertices.push(
    new THREE.Vector3(4.49893, 3.21601, -4.22082),
  );
  //righteyeleftcorner
  geometry.vertices.push(
    new THREE.Vector3(1.9326, 3.14086, -3.78216),
  );
  //nose tips
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );

  //lefteyeleftcorner
  geometry.vertices.push(
    new THREE.Vector3(-4.49893, 3.21601, -4.22082),
  );
  //lefteyerightcorner
  geometry.vertices.push(
    new THREE.Vector3(-1.9326, 3.14086, -3.78216),
  );

  //nose tips
  geometry.vertices.push(
    new THREE.Vector3(0.0, 0.003874, 0.290468),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -1.26207, -1.14108),
  );
  // left mouth corner
  geometry.vertices.push(
    new THREE.Vector3(-2.17298, -3.62696, -3.15651),
  );
  //rightmouthcorner
  geometry.vertices.push(
    new THREE.Vector3(2.17298, -3.62696, -3.15651),
  );
  // bottom nose
  geometry.vertices.push(
    new THREE.Vector3(0.0, -1.26207, -1.14108),
  );
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  line.renderOrder = 50000;
  threeCompositeObject.add(line);
};
