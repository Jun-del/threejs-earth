import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { makePlane } from "./src/utils";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 15, 50);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
// controls.dampingFactor = 0.05;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
	alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Lights
 */
const sunLight = new THREE.DirectionalLight(new THREE.Color("#FFFFFF").convertSRGBToLinear(), 3.5);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.right = 10;
scene.add(sunLight);

/**
 * Scene 2
 */
const ringsScene = new THREE.Scene();

const ringsCamera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
ringsCamera.position.set(0, 0, 50);

// Mouse position
let mousePos = new THREE.Vector2(0, 0);

window.addEventListener("mousemove", (e) => {
	let x = e.clientX - sizes.width * 0.5;
	let y = e.clientY - sizes.height * 0.5;

	mousePos.x = x * 0.0003;
	mousePos.y = y * 0.0003;
});

/**
 * IIFE Async functions
 */
(async function () {
	let pmrem = new THREE.PMREMGenerator(renderer);
	// https://polyhaven.com/a/industrial_sunset_02_puresky
	let envMap = await new RGBELoader()
		.setDataType(THREE.FloatType)
		.loadAsync("/textures/envmap.hdr");
	let envMapTexture = pmrem.fromEquirectangular(envMap).texture;

	let textureLoader = new THREE.TextureLoader();
	let textures = {
		bump: await textureLoader.loadAsync("/textures/earth_bump.jpg"),
		specular: await textureLoader.loadAsync("/textures/earth_specular.jpg"),
		map: await textureLoader.loadAsync("/textures/earth_map.jpg"),
		planeTrailMask: await textureLoader.loadAsync("/textures/mask.png"),
	};

	// "Cartoon Plane" (https://skfb.ly/UOLT) by antonmoek is licensed under Creative Commons Attribution
	let plane = (await new GLTFLoader().loadAsync("/models/plane.glb")).scene.children[0];
	let planesData = [
		makePlane(plane, textures.planeTrailMask, envMap, scene),
		// makePlane(plane, textures.planeTrailMask, envMap, scene),
	];

	let sphere = new THREE.Mesh(
		new THREE.SphereGeometry(10, 70, 70),
		new THREE.MeshPhysicalMaterial({
			bumpMap: textures.bump,
			roughnessMap: textures.specular,
			map: textures.map,
			bumpScale: 0.1,

			envMap: envMapTexture,
			envMapIntensity: 0.4,

			sheen: 1,
			sheenRoughness: 0.5,
			sheenColor: new THREE.Color("#ff8a00").convertSRGBToLinear(),
			clearcoat: 0.5,
		}),
	);
	sphere.rotation.y += Math.PI;
	sphere.receiveShadow = true;
	scene.add(sphere);

	/**
	 * Scene 2
	 */
	const ring1 = new THREE.Mesh(
		new THREE.RingGeometry(15, 13.5, 80, 1, 0),
		new THREE.MeshPhysicalMaterial({
			color: new THREE.Color("#FFCB8E").convertSRGBToLinear().multiplyScalar(200),
			roughness: 0.25,
			envMap,
			envMapIntensity: 1.8,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.35,
		}),
	);
	ringsScene.add(ring1);

	const ring2 = new THREE.Mesh(
		new THREE.RingGeometry(16.5, 15.75, 80, 1, 0),
		new THREE.MeshBasicMaterial({
			color: new THREE.Color("#FFCB8E").convertSRGBToLinear(),
			transparent: true,
			opacity: 0.5,
			side: THREE.DoubleSide,
		}),
	);
	ringsScene.add(ring2);

	const ring3 = new THREE.Mesh(
		new THREE.RingGeometry(18, 17.75, 80),
		new THREE.MeshBasicMaterial({
			color: new THREE.Color("#FFCB8E").convertSRGBToLinear().multiplyScalar(50),
			transparent: true,
			opacity: 0.5,
			side: THREE.DoubleSide,
		}),
	);
	ringsScene.add(ring3);

	let clock = new THREE.Clock();

	renderer.setAnimationLoop(() => {
		let delta = clock.getDelta(); // how much time has passed since last frame

		planesData.forEach((planeData) => {
			let plane = planeData.group;

			plane.position.set(0, 0, 0);
			plane.rotation.set(0, 0, 0);
			plane.updateMatrixWorld();

			/**
			 * https://github.com/Domenicobrz/Threejs-in-practice/blob/main/three-in-practice-3/src/index.js
			 * idea: first rotate like that:
			 *
			 *          y-axis
			 *  airplane  ^
			 *      \     |     /
			 *       \    |    /
			 *        \   |   /
			 *         \  |  /
			 *     angle ^
			 *
			 * then at the end apply a rotation on a random axis
			 */

			planeData.rot += delta * 0.25;
			plane.rotateOnAxis(planeData.randomAxis, planeData.randomAxisRot); // random axis
			plane.rotateOnAxis(new THREE.Vector3(0, 1, 0), planeData.rot); // y-axis rotation
			plane.rotateOnAxis(new THREE.Vector3(0, 0, 1), planeData.rad); // this decides the radius
			plane.translateY(planeData.yOff);
			plane.rotateOnAxis(new THREE.Vector3(1, 0, 0), +Math.PI * 0.5);
		});

		controls.update();
		renderer.render(scene, camera);

		// Rotate rings
		ring1.rotation.x = ring1.rotation.x * 0.95 + mousePos.y * 0.05 * 1.2;
		ring1.rotation.y = ring1.rotation.y * 0.95 + mousePos.x * 0.05 * 1.2;

		ring2.rotation.x = ring2.rotation.x * 0.95 + mousePos.y * 0.05 * 0.375;
		ring2.rotation.y = ring2.rotation.y * 0.95 + mousePos.x * 0.05 * 0.375;

		ring3.rotation.x = ring3.rotation.x * 0.95 - mousePos.y * 0.05 * 0.275;
		ring3.rotation.y = ring3.rotation.y * 0.95 - mousePos.x * 0.05 * 0.275;

		renderer.autoClear = false;
		renderer.render(ringsScene, ringsCamera);
		renderer.autoClear = true;
	});
})();
