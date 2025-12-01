import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. SETUP THE SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0); // Grey background
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

// 2. SETUP THE CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// 3. SETUP THE RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 4. ADD LIGHTING (Crucial so you can see the models)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// 5. ORCHESTRA ASSET LOADER (The part that fixes your issue)
const loader = new GLTFLoader();

// REPLACE 'your_model_name.glb' with the actual name of your file in the folder
const modelPath = './environment.glb'; 

console.log("Orchestra: Attempting to load 3D World from " + modelPath);

loader.load( modelPath, function ( gltf ) {
    const model = gltf.scene;
    scene.add( model );
    console.log("Orchestra: 3D World Generated Successfully!");

}, undefined, function ( error ) {
    console.error("Orchestra Error: Could not generate 3D environment.", error);
    // Fallback: Create a cube if the model fails so you know the code works
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
});

// 6. CONTROLS (So you can look around)
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// 7. GAME LOOP
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
