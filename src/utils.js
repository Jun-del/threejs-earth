import * as THREE from "three";

// function to create a plane
function makePlane(planeMesh, trailTexture, envMap, scene) {
	let plane = planeMesh.clone();
	plane.scale.set(0.001, 0.001, 0.001);
	plane.position.set(0, 0, 0);
	plane.rotation.set(0, 0, 0);
	plane.updateMatrixWorld();

	plane.traverse((object) => {
		if (object instanceof THREE.Mesh) {
			object.material.envMap = envMap;
			object.castShadow = true;
			object.receiveShadow = true;
		}
	});

	let group = new THREE.Group();
	group.add(plane);
	scene.add(group);

	return {
		group,
		rot: Math.random() * Math.PI * 2,
		rad: Math.random() * Math.PI * 0.45 + 0.2,
		yOff: 10.5 + Math.random() * 10,
		randomAxis: new THREE.Vector3(random1(), random1(), random1()).normalize(),
		randomAxisRot: Math.random() * Math.PI * 2,
	};
}

// returns a random number between -1 and 1
function random1() {
	return Math.random() * 2 - 1;
}

export { makePlane };
