// Destiny's World - Lost Society in Time
// Complete Game Implementation with AI, NPCs, and 4 Zones
import { WORLD_CONFIG } from './world-config.js';
// Author: Joseph Cyril Dougherty IV
import { LevelBuilder } from './LevelBuilder.js';

// ===== GAME CONFIGURATION =====
const CONFIG = {

    PERPLEXITY_API_KEY: 'YOUR_PERPLEXITY_API_KEY',
    PERPLEXITY_API_URL: 'https://api.perplexity.ai/chat/completions',
    MAX_FRAGMENTS: 8,
    PLAYER_SPEED: 0.05,
    PLAYER_SPRINT_SPEED: 0.1,
    PLAYER_CROUCH_SPEED: 0.025,
    ALIEN_BASE_SPEED: 0.03,
    ALIEN_CHASE_SPEED: 0.08,
    DETECTION_RANGE: 15,
    HEARING_RANGE: 10,
    HIDING_DETECTION_CHANCE: 0.1
};

// ===== GAME STATE =====
let gameState = {
    currentZone: 1,
    fragmentsCollected: 0,
    playerHealth: 100,
    playerFear: 0,
    playerPosition: { x: 0, y: 0, z: 0 },
    playerVelocity: { x: 0, y: 0, z: 0 },
    isHiding: false,
    isCrouching: false,
    isSprinting: false,
    alienKillerState: 'patrol',
    npcs: [],
    fragments: [],
    hidingSpots: [],
    journal: [],

    // ===== NEW EXPANSION SYSTEMS =====
    // Fear Dynamics System
    sanity: 100,  // 0-100, decreases with fear/horror events
    fearLevel: 0,  // 0-100, central fear calculation
    fearModifiers: {
        proximity: 0,
        lighting: 0,
        audio: 0,
        sanity: 0
    },

    // Audio System
    audioState: {
        masterVolume: 1.0,
        musicVolume: 0.6,
        sfxVolume: 0.8,
        ambienceVolume: 0.7,
        currentMusic: null,
        currentAmbience: null
    },

    // Save System
    saveData: {
        checkpoints: [],
        lastSaveTime: null,
        currentCheckpoint: 0
    },

    // Environment Corruption
    corruptionLevel: 0,  // 0-100, increases with fear
    visualDistortion: 0,
    audioDistortion: 0
};

// ===== KEYBOARD INPUT =====
const keys = { w: false, a: false, s: false, d: false };

// ===== THREE.JS SCENE SETUP =====
let scene, camera, renderer, player, alienKiller, particleSystem
let clock = new THREE.Clock();

function initThreeJS() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.015);
        scene.background = new THREE.Color(0x87CEEB); // Visible dark grey background
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.7, 5);
        camera.lookAt(0, 1.7, 0); // Explicitly point camera at origin
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); // Bright sunny day    scene.add(ambientLight);
107
        /*// --- DEBUG CUBE START ---
        const debugGeo = new THREE.BoxGeometry(1, 1, 1);
        const debugMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const debugCube = new THREE.Mesh(debugGeo, debugMat);
        debugCube.position.set(0, 1.7, -3);
        scene.add(debugCube);
        // --- DEBUG CUBE END --- */

        // Flashlight (SpotLight) attached to camera
    const flashlight = new THREE.SpotLight(0xffffff, 2.0, 40, Math.PI/4, 0.5, 1);
    flashlight.position.set(0, 0, 0);
    flashlight.target.position.set(0, 0, -1); // Points where camera looks
    camera.add(flashlight);
    camera.add(flashlight.target);
    
    // CRITICAL: Add camera to scene (required for child lights to work)
    scene.add(camera);
    
    // Player
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.6, 4, 8);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 1, 0);
    player.castShadow = true;
    scene.add(player);
    
    window.addEventListener('resize', onWindowResize)
        createZone1(); // Initialize the game world
            animate(); // Start the animation loop;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// ===== ZONE 1: MODERN DISTRICT =====
function createZone1() {
    console.log('Creating Zone 1: Modern District');
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Buildings
    for (let i = 0; i < 15; i++) {
        const height = Math.random() * 20 + 10;
        const buildingGeometry = new THREE.BoxGeometry(8, height, 8);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,            roughness: 0.7,
            metalness: 0.3
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(
            (Math.random() - 0.5) * 80,
            height / 2,
            (Math.random() - 0.5) * 80
        );
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
    }
    
    // Streetlights
    for (let i = 0; i < 20; i++) {
        const light = new THREE.PointLight(0xffaa00, 1, 10);
        light.position.set(
            (Math.random() - 0.5) * 90,
            5,
            (Math.random() - 0.5) * 90
        );
        light.castShadow = true;
        scene.add(light);
    }
    
    // Hiding spots
    createHidingSpots([
        { x: -10, y: 0, z: -10, type: 'locker' },
        { x: 15, y: 0, z: -20, type: 'dumpster' },
        { x: -25, y: 0, z: 30, type: 'alley' }
    ]);
    
    // Fragments
    createFragments([
        { x: 5, y: 1, z: 5 },
        { x: -15, y: 1, z: -15 }
    ]);
}

// ===== ZONE 2: TRANSITION ZONE =====
function createZone2() {
    console.log('Creating Zone 2: Transition Zone');
    scene.fog.density = 0.025;
    
    // Distorted ground with cracks
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        positions.setY(i, Math.random() * 2 - 1);
    }
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        roughness: 1.0,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Decaying buildings
    for (let i = 0; i < 10; i++) {
        const height = Math.random() * 15 + 5;
        const buildingGeometry = new THREE.BoxGeometry(7, height, 7);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x332222,
            roughness: 0.9
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(
            (Math.random() - 0.5) * 70,
            height / 2,
            (Math.random() - 0.5) * 70
        );
        building.rotation.y = Math.random() * 0.3;
        building.castShadow = true;
        scene.add(building);
    }
    
    // Flickering lights
    for (let i = 0; i < 8; i++) {
        const light = new THREE.PointLight(0xff4400, 0.5, 8);
        light.position.set(
            (Math.random() - 0.5) * 60,
            4,
            (Math.random() - 0.5) * 60
        );
        scene.add(light);
    }
    
    // Hiding spots
    createHidingSpots([
        { x: -8, y: 0, z: -12, type: 'rubble' },
        { x: 20, y: 0, z: -25, type: 'broken_wall' }
    ]);
    
    // Fragments
    createFragments([
        { x: 10, y: 1, z: 10 },
            { x: -20, y: 1, z: 20 }
        ]);

    // Initialize particle system
    particleSystem = new ParticleSystem(scene);
    console.log('Particle system initialized');
