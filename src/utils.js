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

	let trail = new THREE.Mesh(
		new THREE.PlaneGeometry(1, 2),
		new THREE.MeshPhysicalMaterial({
			envMap,
			envMapIntensity: 3,

			color: new THREE.Color(getRandomColor()).convertSRGBToLinear(),
			roughness: 0.4,
			metalness: 0,
			transmission: 1,

			transparent: true,
			opacity: 1,
			alphaMap: trailTexture,
		}),
	);
	trail.rotateX(Math.PI);
	trail.translateY(1.1);

	let group = new THREE.Group();
	group.add(plane, trail);
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

// returns a random hex color
function getRandomColor() {
	let letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

export { makePlane };
