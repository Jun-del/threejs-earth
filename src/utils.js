import * as THREE from "three";

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
		yOff: 10.5 + Math.random() * 10,
	};
}

export { makePlane };
