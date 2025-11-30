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
    scene.fog = new THREE.FogExp2(0x333333, 0.015);
        scene.background = new THREE.Color(0x333333); // Visible dark grey background
    
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
    const ambientLight = new THREE.AmbientLight(0x222222); // Dim dark grey
    scene.add(ambientLight);

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
    
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== ZONE 1: MODERN DISTRICT =====
function createZone1() {
    console.log('Creating Zone 1: Modern District');
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
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
            color: 0x444444,
            roughness: 0.7,
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

            // Initialize particle system
    particleSystem = new ParticleSystem(scene);
    console.log('Particle system initialized');
        { x: -20, y: 1, z: 20 }
    ]);
}

// ===== ZONE 3: DARK CORRUPTED AREA =====
function createZone3() {
    console.log('Creating Zone 3: Dark Corrupted Area');
    scene.fog.density = 0.04;
    scene.fog.color = new THREE.Color(0x100510);
    
    // Corrupted ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 60, 60);
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        positions.setY(i, Math.sin(i * 0.5) * 3);
    }
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x110011,
        roughness: 1.0,
        emissive: 0x330033,
        emissiveIntensity: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Twisted structures
    for (let i = 0; i < 12; i++) {
        const height = Math.random() * 25 + 10;
        const geometry = new THREE.CylinderGeometry(
            Math.random() * 3 + 1,
            Math.random() * 3 + 1,
            height,
            6
        );
        const material = new THREE.MeshStandardMaterial({
            color: 0x220022,
            roughness: 0.9,
            emissive: 0x440044,
            emissiveIntensity: 0.3
        });
        const structure = new THREE.Mesh(geometry, material);
        structure.position.set(
            (Math.random() - 0.5) * 70,
            height / 2,
            (Math.random() - 0.5) * 70
        );
        structure.rotation.z = Math.random() * 0.5 - 0.25;
        structure.castShadow = true;
        scene.add(structure);
    }
    
    // Purple corrupted lights
    for (let i = 0; i < 15; i++) {
        const light = new THREE.PointLight(0x8800ff, 0.8, 12);
        light.position.set(
            (Math.random() - 0.5) * 80,
            Math.random() * 10 + 2,
            (Math.random() - 0.5) * 80
        );
        scene.add(light);
    }
    
    // Hiding spots
    createHidingSpots([
        { x: -15, y: 0, z: -18, type: 'void' },
        { x: 25, y: 0, z: -30, type: 'shadow' },
        { x: -30, y: 0, z: 25, type: 'portal' }
    ]);
    
    // Fragments
    createFragments([
        { x: 15, y: 1, z: 15 },
        { x: -25, y: 1, z: 25 }
    ]);
}

// ===== ZONE 4: FINAL CORRUPTION ZONE =====
function createZone4() {
    console.log('Creating Zone 4: Final Corruption Zone');
    scene.fog.density = 0.06;
    scene.fog.color = new THREE.Color(0x050005);
    
    // Void ground
    const groundGeometry = new THREE.PlaneGeometry(120, 120, 80, 80);
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        positions.setY(i, Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5);
    }
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000,
        roughness: 1.0,
        emissive: 0x550000,
        emissiveIntensity: 0.4
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Nightmare structures
    for (let i = 0; i < 8; i++) {
        const geometry = new THREE.IcosahedronGeometry(Math.random() * 8 + 4, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x440000,
            roughness: 0.3,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            wireframe: Math.random() > 0.5
        });
        const structure = new THREE.Mesh(geometry, material);
        structure.position.set(
            (Math.random() - 0.5) * 90,
            Math.random() * 15 + 5,
            (Math.random() - 0.5) * 90
        );
        structure.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        scene.add(structure);
    }
    
    // Red danger lights
    for (let i = 0; i < 20; i++) {
        const light = new THREE.PointLight(0xff0000, 1.5, 15);
        light.position.set(
            (Math.random() - 0.5) * 100,
            Math.random() * 20 + 5,
            (Math.random() - 0.5) * 100
        );
        scene.add(light);
    }
    
    // Hiding spots - fewer and more dangerous
    createHidingSpots([
        { x: -20, y: 0, z: -25, type: 'nightmare' },
        { x: 30, y: 0, z: -35, type: 'abyss' }
    ]);
    
    // Final fragments
    createFragments([
        { x: 20, y: 1, z: 20 },
        { x: -30, y: 1, z: 30 }
    ]);
}

// ===== ALIEN SERIAL KILLER AI (ADAPTIVE LEARNING) =====
class AlienKillerAI {
    constructor() {
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.state = 'patrol';
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.lastSeenPlayer = null;
        this.hearingMemory = [];
        this.searchTime = 0;
        this.behaviorMemory = {
            playerHidingSpots: [],
            playerPaths: [],
            playerTactics: []
        };
        this.adaptiveSpeed = CONFIG.ALIEN_BASE_SPEED;
        this.suspicionLevel = 0;
        this.mesh = this.createMesh();
    }
    
    createMesh() {
        const geometry = new THREE.ConeGeometry(1, 3, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0x880000,
            emissiveIntensity: 0.5
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        scene.add(mesh);
        return mesh;
    }
    
    update(playerPos, delta) {
        // Learn player behavior
        this.learnPlayerBehavior(playerPos);
        
        switch(this.state) {
            case 'patrol':
                this.patrol(delta);
                break;
            case 'investigate':
                this.investigate(playerPos, delta);
                break;
            case 'chase':
                this.chase(playerPos, delta);
                break;
            case 'search':
                this.search(playerPos, delta);
                break;
        }
        
        // Check if player detected
        const distanceToPlayer = this.position.distanceTo(playerPos);
        const canSeePlayer = !gameState.isHiding && distanceToPlayer < CONFIG.DETECTION_RANGE;
        
        if (canSeePlayer && this.hasLineOfSight(playerPos)) {
            this.state = 'chase';
            this.lastSeenPlayer = playerPos.clone();
        }
        
        // Update mesh
        this.mesh.position.copy(this.position);
    }
    
    learnPlayerBehavior(playerPos) {
        // Track player hiding spot preferences
        if (gameState.isHiding) {
            const nearbySpot = this.findNearestHidingSpot(playerPos);
            if (nearbySpot) {
                const existing = this.behaviorMemory.playerHidingSpots.find(
                    spot => spot.position.distanceTo(nearbySpot.position) < 2
                );
                if (existing) {
                    existing.usageCount++;
                } else {
                    this.behaviorMemory.playerHidingSpots.push({
                        position: nearbySpot.position.clone(),
                        usageCount: 1
                    });
                }
            }
        }
        
        // Track movement patterns
        this.behaviorMemory.playerPaths.push(playerPos.clone());
        if (this.behaviorMemory.playerPaths.length > 50) {
            this.behaviorMemory.playerPaths.shift();
        }
        
        // Adapt speed based on player success
        if (gameState.fragmentsCollected > 4) {
            this.adaptiveSpeed = Math.min(CONFIG.ALIEN_CHASE_SPEED, this.adaptiveSpeed * 1.05);
        }
    }
    
    patrol(delta) {
        if (this.patrolPoints.length === 0) {
            this.generatePatrolPoints();
        }
        
        const target = this.patrolPoints[this.currentPatrolIndex];
        const direction = new THREE.Vector3()
            .subVectors(target, this.position)
            .normalize();
        
        this.velocity.copy(direction).multiplyScalar(this.adaptiveSpeed);
        this.position.add(this.velocity);
        
        if (this.position.distanceTo(target) < 2) {
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        }
    }
    
    investigate(playerPos, delta) {
        if (this.lastSeenPlayer) {
            const direction = new THREE.Vector3()
                .subVectors(this.lastSeenPlayer, this.position)
                .normalize();
            
            this.velocity.copy(direction).multiplyScalar(this.adaptiveSpeed * 1.5);
            this.position.add(this.velocity);
            
            if (this.position.distanceTo(this.lastSeenPlayer) < 2) {
                this.state = 'search';
                this.searchTime = 10;
            }
        }
    }
    
    chase(playerPos, delta) {
        const direction = new THREE.Vector3()
            .subVectors(playerPos, this.position)
            .normalize();
        
        this.velocity.copy(direction).multiplyScalar(CONFIG.ALIEN_CHASE_SPEED);
        this.position.add(this.velocity);
        
        // Check if lost player
        if (this.position.distanceTo(playerPos) > CONFIG.DETECTION_RANGE * 1.5) {
            this.state = 'investigate';
        }
        
        // Check if caught player
        if (this.position.distanceTo(playerPos) < 2) {
            this.catchPlayer();
        }
    }
    
    search(playerPos, delta) {
        this.searchTime -= delta;
        
        // Intelligently check previously used hiding spots
        const sortedSpots = this.behaviorMemory.playerHidingSpots
            .sort((a, b) => b.usageCount - a.usageCount);
        
        if (sortedSpots.length > 0 && Math.random() < 0.7) {
            const targetSpot = sortedSpots[0].position;
            const direction = new THREE.Vector3()
                .subVectors(targetSpot, this.position)
                .normalize();
            
            this.velocity.copy(direction).multiplyScalar(this.adaptiveSpeed);
            this.position.add(this.velocity);
        }
        
        if (this.searchTime <= 0) {
            this.state = 'patrol';
        }
    }
    
    hasLineOfSight(playerPos) {
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3().subVectors(playerPos, this.position).normalize();
        raycaster.set(this.position, direction);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        return intersects.length === 0 || intersects[0].distance > this.position.distanceTo(playerPos);
    }
    
    findNearestHidingSpot(pos) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const spot of gameState.hidingSpots) {
            const dist = spot.position.distanceTo(pos);
            if (dist < minDist) {
                minDist = dist;
                nearest = spot;
            }
        }
        
        return nearest;
    }
    
    generatePatrolPoints() {
        const numPoints = 6 + gameState.currentZone * 2;
        for (let i = 0; i < numPoints; i++) {
            this.patrolPoints.push(new THREE.Vector3(
                (Math.random() - 0.5) * 60,
                0,
                (Math.random() - 0.5) * 60
            ));
        }
    }
    
    catchPlayer() {
        gameState.playerHealth -= 25;
        gameState.playerFear += 30;
        updateHUD();
        
        if (gameState.playerHealth <= 0) {
            gameOver();
        } else {
            // Knockback
            const pushDir = new THREE.Vector3()
                .subVectors(gameState.playerPosition, this.position)
                .normalize()
                .multiplyScalar(5);
            gameState.playerPosition.add(pushDir);
        }
    }
}

// ===== NPC DIALOGUE SYSTEM WITH PERPLEXITY API =====
class NPC {
    constructor(name, position, personality) {
        this.name = name;
        this.position = position;
        this.personality = personality;
        this.conversationHistory = [];
        this.mesh = this.createMesh();
    }
    
    createMesh() {
        const geometry = new THREE.CapsuleGeometry(0.4, 1.4, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x0088ff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        mesh.castShadow = true;
        scene.add(mesh);
        return mesh;
    }
    
    async speak(playerMessage) {
        const context = `You are ${this.name}, an NPC in a horror game called Destiny's World. 
Personality: ${this.personality}
Current zone: ${gameState.currentZone}
Fragments collected: ${gameState.fragmentsCollected}

Respond in character. Keep responses under 50 words.`;
        
        try {
            const response = await fetch(CONFIG.PERPLEXITY_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-sonar-small-128k-online',
                    messages: [
                        { role: 'system', content: context },
                        ...this.conversationHistory,
                        { role: 'user', content: playerMessage }
                    ],
                    max_tokens: 100
                })
            });
            
            const data = await response.json();
            const npcResponse = data.choices[0].message.content;
            
            this.conversationHistory.push(
                { role: 'user', content: playerMessage },
                { role: 'assistant', content: npcResponse }
            );
            
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }
            
            return npcResponse;
        } catch (error) {
            console.error('NPC dialogue error:', error);
            return `I... I can't speak right now. Something's wrong.`;
        }
    }
}

// ===== HIDING MECHANICS & HELPERS =====
function createHidingSpots(spotData) {
    spotData.forEach(data => {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.5
        });
        const spot = new THREE.Mesh(geometry, material);
        spot.position.set(data.x, data.y + 1, data.z);
        scene.add(spot);
        
        gameState.hidingSpots.push({
            position: new THREE.Vector3(data.x, data.y, data.z),
            type: data.type,
            mesh: spot
        });
    });
}

function createFragments(fragmentData) {
    fragmentData.forEach(data => {
        const geometry = new THREE.OctahedronGeometry(0.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x0088ff,
            emissiveIntensity: 0.8
        });
        const fragment = new THREE.Mesh(geometry, material);
        fragment.position.set(data.x, data.y, data.z);
        scene.add(fragment);
        
        gameState.fragments.push({
            position: new THREE.Vector3(data.x, data.y, data.z),
            mesh: fragment,
            collected: false
        });
    });
}

function checkNearbyHidingSpot() {
    for (const spot of gameState.hidingSpots) {
        const dist = spot.position.distanceTo(gameState.playerPosition);
        if (dist < 2) {
            return spot;
        }
    }
    return null;
}

function hidePlayer() {
    const spot = checkNearbyHidingSpot();
    if (spot && !gameState.isHiding) {
        gameState.isHiding = true;
        document.getElementById('interaction-prompt').style.display = 'block';
        document.getElementById('interaction-prompt').textContent = 'Press E to leave hiding spot';
        
        // Chance to be discovered based on alien proximity
        if (alienKiller) {
            const alienDist = alienKiller.position.distanceTo(gameState.playerPosition);
            if (alienDist < 5 && Math.random() < CONFIG.HIDING_DETECTION_CHANCE) {
                setTimeout(() => {
                    if (gameState.isHiding) {
                        gameState.isHiding = false;
                        alienKiller.state = 'chase';
                    }
                }, 2000);
            }
        }
    } else if (gameState.isHiding) {
        gameState.isHiding = false;
        document.getElementById('interaction-prompt').style.display = 'none';
    }
}

function collectFragment() {
    for (const fragment of gameState.fragments) {
        if (!fragment.collected) {
            const dist = fragment.position.distanceTo(gameState.playerPosition);
            if (dist < 2) {
                fragment.collected = true;
                scene.remove(fragment.mesh);
                gameState.fragmentsCollected++;
                
                // Journal entry
                                
                // Emit collection particle effect
                if (particleSystem) {
                    particleSystem.emit('FRAGMENT_GLOW', fragment.position.clone());
                }
                gameState.journal.push({
                    zone: gameState.currentZone,
                    text: `Fragment ${gameState.fragmentsCollected} collected. Reality feels more unstable...`
                });
                
                updateHUD();
                
                // Check if all fragments collected
                if (gameState.fragmentsCollected >= CONFIG.MAX_FRAGMENTS) {
                    winGame();
                }
                
                // Check for zone transition
                if (gameState.fragmentsCollected === 2 && gameState.currentZone < 4) {
                    transitionToNextZone();
                }
                
                break;
            }
        }
    }
}

function transitionToNextZone() {
    gameState.currentZone++;
    
    // Clear scene
    while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    // Recreate scene elements
    initThreeJS();
    
    // Load new zone
    switch(gameState.currentZone) {
        case 2:
            createZone2();
            break;
        case 3:
            createZone3();
            break;
        case 4:
            createZone4();
            break;
    }
    
    // Reinitialize alien killer with upgraded behavior
    if (alienKiller) {
        scene.remove(alienKiller.mesh);
    }
    alienKiller = new AlienKillerAI();
    alienKiller.position.set(
        (Math.random() - 0.5) * 40,
        0,
        (Math.random() - 0.5) * 40
    );
    
    updateHUD();
}

function updateHUD() {
    document.getElementById('health-fill').style.width = `${gameState.playerHealth}%`;
    document.getElementById('fragment-count').textContent = gameState.fragmentsCollected;
    document.getElementById('zone-name').textContent = `Zone ${gameState.currentZone}: ${getZoneName()}`;
}

function getZoneName() {
    const names = [
        'Modern District',
        'Transition Zone',
        'Dark Corrupted Area',
        'Final Corruption Zone'
    ];
    return names[gameState.currentZone - 1] || 'Unknown';
}


function togglePause() {
    const pauseMenu = document.getElementById('pause-menu');
    pauseMenu.style.display = pauseMenu.style.display === 'none' ? 'block' : 'none';
}

function resumeGame() {
    document.getElementById('pause-menu').style.display = 'none';
}

// ===== PLAYER MOVEMENT =====
function updatePlayerMovement(delta) {
    let speed = CONFIG.PLAYER_SPEED;
    
    if (gameState.isHiding) {
        return; // Can't move while hiding
    }
    
    if (gameState.isCrouching) {
        speed = CONFIG.PLAYER_CROUCH_SPEED;
    } else if (gameState.isSprinting) {
        speed = CONFIG.PLAYER_SPRINT_SPEED;
    }
    
    const moveVector = new THREE.Vector3();
    
    if (keys['w']) moveVector.z -= 1;
    if (keys['s']) moveVector.z += 1;
    if (keys['a']) moveVector.x -= 1;
    if (keys['d']) moveVector.x += 1;
    
    if (moveVector.length() > 0) {
        moveVector.normalize().multiplyScalar(speed);
        gameState.playerPosition.add(moveVector);
        player.position.copy(gameState.playerPosition);
        camera.position.set(
            gameState.playerPosition.x,
            gameState.playerPosition.y + 1.6,
            gameState.playerPosition.z
        );
    }
}


// ===== NEW EXPANSION SYSTEM FUNCTIONS =====

// Update Fear Dynamics System
function updateFearSystem(delta) {
    // Calculate proximity fear (alien distance)
    if (alienKiller) {
        const dist = gameState.playerPosition.distanceTo(alienKiller.mesh.position);
        gameState.fearModifiers.proximity = Math.max(0, (CONFIG.DETECTION_RANGE - dist) / CONFIG.DETECTION_RANGE * 50);
    }
    
    // Calculate lighting fear (darker = more fear)
    const avgLightLevel = 0.3; // Simplified, would calc from actual lights
    gameState.fearModifiers.lighting = (1 - avgLightLevel) * 20;
    
    // Sanity affects fear
    gameState.fearModifiers.sanity = (100 - gameState.sanity) * 0.3;
    
    // Calculate total fear level (0-100)
    gameState.fearLevel = Math.min(100, 
        gameState.fearModifiers.proximity +
        gameState.fearModifiers.lighting +
        gameState.fearModifiers.audio +
        gameState.fearModifiers.sanity
    );
    
    // Fear affects sanity over time
    if (gameState.fearLevel > 50) {
        gameState.sanity = Math.max(0, gameState.sanity - delta * 2);
    } else if (gameState.fearLevel < 20 && gameState.sanity < 100) {
        gameState.sanity = Math.min(100, gameState.sanity + delta * 0.5);
    }
    
    // Update corruption based on fear
    gameState.corruptionLevel = gameState.fearLevel * 0.8;
}

// Update Environment Corruption
function updateEnvironmentCorruption(delta) {
    gameState.visualDistortion = gameState.corruptionLevel / 100;
    gameState.audioDistortion = gameState.corruptionLevel / 100;
    
    // Apply visual effects to camera/scene
    if (scene && scene.fog) {
        scene.fog.density = 0.015 + (gameState.visualDistortion * 0.01);
    }
}

// Update Audio System
function updateAudioSystem(delta) {
    // Adjust music volume based on fear level
    const targetMusicVolume = 0.3 + (gameState.fearLevel / 100) * 0.4;
    gameState.audioState.musicVolume = targetMusicVolume;
    
    // Add audio distortion at high corruption
    if (gameState.audioDistortion > 0.7) {
        gameState.audioState.sfxVolume = 0.8 * (1 - gameState.audioDistortion * 0.3);
    }
}

// Update HUD Display
function updateHUDDisplay() {
    // Update Fear Meter
    const fearFill = document.getElementById('fear-fill');
    if (fearFill) {
        const fearPercent = Math.min(100, Math.max(0, gameState.fearLevel));
        fearFill.style.width = fearPercent + '%';
    }
    
    // Update Sanity Meter
    const sanityFill = document.getElementById('sanity-fill');
    if (sanityFill) {
        const sanityPercent = Math.min(100, Math.max(0, gameState.sanity));
        sanityFill.style.width = sanityPercent + '%';
    }
    
    // Update Fragment Count
    const fragmentCount = document.getElementById('fragment-count');
    if (fragmentCount) {
        fragmentCount.textContent = gameState.fragmentsCollected + '/' + CONFIG.MAX_FRAGMENTS;
    }
    
    // Update Zone Name
    const zoneName = document.getElementById('zone-name');
    if (zoneName) {
        const zoneNames = ['Zone 1: Entry', 'Zone 2: Corruption Spreads', 'Zone 3: Deep Corruption', 'Zone 4: The Heart'];
        zoneName.textContent = zoneNames[gameState.currentZone - 1] || 'Unknown Zone';
    }
}
// ===== GAME LOOP =====
function animate() {
    requestAnimationFrame(animate);
        console.log("Rendering..."); // DEBUG: Check if animate loop is running
    
    const delta = clock.getDelta();
    
    // Update player
    updatePlayerMovement(delta);
    
    // Update alien killer AI
    if (alienKiller) {
        alienKiller.update(gameState.playerPosition, delta);
    }

    // ===== UPDATE NEW EXPANSION SYSTEMS =====
    // Update Fear Dynamics System
    updateFearSystem(delta);
    
    // Update Environment Corruption
    updateEnvironmentCorruption(delta);

        // Update Particle Effects
    if (particleSystem) {
        particleSystem.update(delta);
    }
    
    // Update Audio System
    updateAudioSystem(delta);
    
    // Check for fragment collection
    collectFragment();
    
    // Animate fragments
    gameState.fragments.forEach((frag, i) => {
        if (!frag.collected) {
            frag.mesh.rotation.y += delta * 2;
            frag.mesh.position.y = 1 + Math.sin(Date.now() * 0.002 + i) * 0.3;
        }
    });
    
    // Fear system - increase fear over time, decrease when safe
    if (alienKiller && alienKiller.position.distanceTo(gameState.playerPosition) < 20) {
        gameState.playerFear = Math.min(100, gameState.playerFear + delta * 5);
    } else if (gameState.isHiding) {
        gameState.playerFear = Math.max(0, gameState.playerFear - delta * 10);
    } else {
        gameState.playerFear = Math.max(0, gameState.playerFear - delta * 2);
    }
    
    // Visual fear effects
    if (gameState.playerFear > 50) {
        scene.fog.density = 0.015 + (gameState.playerFear / 100) * 0.03;
    }

    // Update HUD Display
    updateHUDDisplay();
    
    renderer.render(scene, camera);
}

// ===== GAME INITIALIZATION =====
async function initGame() {
    document.getElementById('loading-screen').style.display = 'flex';
    
    // Initialize Three.js
    initThreeJS();
    
    // Create Zone 1
    createZone1();
    
    // Initialize Alien Killer
    alienKiller = new AlienKillerAI();
    alienKiller.position.set(30, 0, 30);
    
    // Create NPCs
    gameState.npcs.push(
        new NPC(
            'Dr. Sarah Chen',
            new THREE.Vector3(10, 0, 10),
            'Frightened scientist who knows about the temporal anomalies'
        ),
        new NPC(
            'Marcus',
            new THREE.Vector3(-15, 0, -15),
            'Paranoid survivor who has seen the alien killer before'
        )
    );
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        updateHUD();
        animate();
    }, 2000);

        // Set up keyboard controls for player movement

        document.addEventListener('keydown', (e) => {
                    if (e.key === 'w' || e.key === 'W') keys.w = true;
                    if (e.key === 's' || e.key === 'S') keys.s = true;
                    if (e.key === 'a' || e.key === 'A') keys.a = true;
                    if (e.key === 'd' || e.key === 'D') keys.d = true;
                });

        document.addEventListener('keyup', (e) => {
                    if (e.key === 'w' || e.key === 'W') keys.w = false;
                    if (e.key === 's' || e.key === 'S') keys.s = false;
                    if (e.key === 'a' || e.key === 'A') keys.a = false;
                    if (e.key === 'd' || e.key === 'D') keys.d = false;
                });
}

function gameOver() {
    alert('GAME OVER - The alien killer has consumed your essence.');
    location.reload();
}

function winGame() {
    alert('VICTORY! You collected all fragments and escaped the corrupted reality!');
    location.reload();
}


// ===== PARTICLE EFFECTS SYSTEM =====
// Manages visual effects using efficient point cloud systems
// Features: Procedural textures, object pooling, multiple effect types

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.emitters = [];
        
        // Generate procedural glow texture
        this.particleTexture = this.createProceduralTexture();
        
        // Configuration for different effects
        this.configs = {
            FRAGMENT_GLOW: {
                color: 0x00ffff,
                size: 0.5,
                count: 20,
                life: 2.0,
                speed: 0.5,
                spread: 0.5,
                type: 'orbit'
            },
            CORRUPTION: {
                color: 0x8800ff,
                size: 0.8,
                count: 40,
                life: 3.0,
                speed: 0.3,
                spread: 1.5,
                type: 'rise'
            },
            DUST: {
                color: 0xaaaaaa,
                size: 0.3,
                count: 15,
                life: 1.5,
                speed: 0.2,
                spread: 0.8,
                type: 'drift'
            },
            TELEPORT: {
                color: 0x00ff00,
                size: 1.0,
                count: 50,
                life: 1.0,
                speed: 2.0,
                spread: 2.0,
                type: 'burst'
            }
        };
    }
    
    createProceduralTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    emit(type, position) {
        const config = this.configs[type];
        if (!config) return;
        
        const emitter = {
            center: position.clone(),
            config: config,
            age: 0,
            particles: [],
            mesh: null
        };
        
        // Create geometry for point cloud
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(config.count * 3);
        const velocities = new Float32Array(config.count * 3);
        const lifetimes = new Float32Array(config.count);
        
        for (let i = 0; i < config.count; i++) {
            const idx = i * 3;
            positions[idx] = position.x + (Math.random() - 0.5) * 0.1;
            positions[idx + 1] = position.y + (Math.random() - 0.5) * 0.1;
            positions[idx + 2] = position.z + (Math.random() - 0.5) * 0.1;
            
            velocities[idx] = (Math.random() - 0.5) * config.speed;
            velocities[idx + 1] = Math.random() * config.speed;
            velocities[idx + 2] = (Math.random() - 0.5) * config.speed;
            
            lifetimes[i] = Math.random() * config.life;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        emitter.velocities = velocities;
        emitter.lifetimes = lifetimes;
        
        // Create material with additive blending
        const material = new THREE.PointsMaterial({
            color: config.color,
            size: config.size,
            map: this.particleTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        emitter.mesh = new THREE.Points(geometry, material);
        this.scene.add(emitter.mesh);
        this.emitters.push(emitter);
    }
    
    update(dt) {
        for (let i = this.emitters.length - 1; i >= 0; i--) {
            const emitter = this.emitters[i];
            emitter.age += dt;
            
            const positions = emitter.mesh.geometry.attributes.position.array;
            let aliveCount = 0;
            
            for (let j = 0; j < emitter.config.count; j++) {
                const idx = j * 3;
                emitter.lifetimes[j] -= dt;
                
                if (emitter.lifetimes[j] > 0) {
                    aliveCount++;
                    
                    // Update particle behavior based on type
                    if (emitter.config.type === 'orbit') {
                        const time = emitter.age + j * 0.1;
                        const radius = emitter.config.spread;
                        const offset = j * 0.5;
                        positions[idx] = emitter.center.x + Math.cos(time + offset) * radius;
                        positions[idx + 1] = emitter.center.y + Math.sin(time * 2) * 0.5;
                        positions[idx + 2] = emitter.center.z + Math.sin(time + offset) * radius;
                    } else {
                        // Standard physics integration
                        positions[idx] += emitter.velocities[idx] * dt;
                        positions[idx + 1] += emitter.velocities[idx + 1] * dt;
                        positions[idx + 2] += emitter.velocities[idx + 2] * dt;
                    }
                }
            }
            
            // Fade out effect
            emitter.mesh.material.opacity = Math.max(0, emitter.mesh.material.opacity - dt / 1.5);
            
            // Mark geometry for update
            emitter.mesh.geometry.attributes.position.needsUpdate = true;
            
            // Cleanup if all particles are dead
            if (aliveCount === 0 || emitter.mesh.material.opacity <= 0.01) {
                this.scene.remove(emitter.mesh);
                emitter.mesh.geometry.dispose();
                emitter.mesh.material.dispose();
                this.emitters.splice(i, 1);
            }
        }
    }
}

// ===== LIGHTING VOLUME SYSTEM =====
// Dynamic lighting that responds to corruption levels and time of day
// Features: Day/night cycle, corruption-based color shifts, flickering lights

class LightingVolumeSystem {
    constructor(scene) {
        this.scene = scene;
        this.time = 0;
        this.cycleSpeed = 0.01; // How fast day/night cycles
        this.corruptionLevel = 0;
        
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0xffd1a3, 0.8);
        scene.add(this.ambientLight);
        
        // Directional sun light
        this.sunLight = new THREE.DirectionalLight(0xffeebb, 1.2);
        this.sunLight.position.set(5, 10, 5);
        this.sunLight.castShadow = true;
        scene.add(this.sunLight);
        
        // Flickering point lights for corruption
        this.flickeringLights = [];
        
        // Day/night cycle configuration
        this.dayCycle = {
            DAWN: { sky: 0xffd1a3, ground: 0x8ba699, sun: 0xffeebb, intensity: 0.8 },
            NOON: { sky: 0x87ceeb, ground: 0x6b8c42, sun: 0xffffff, intensity: 1.2 },
            DUSK: { sky: 0xfd5e53, ground: 0x4a3c31, sun: 0xffa07a, intensity: 0.6 },
            NIGHT: { sky: 0x050510, ground: 0x020205, sun: 0x4b5d8a, intensity: 0.2 }
        };
    }
    
    addFlickeringLight(position, color = 0xff00ff, baseIntensity = 2) {
        const light = new THREE.PointLight(color, baseIntensity, 10);
        light.position.copy(position);
        light.baseIntensity = baseIntensity;
        light.speed = Math.random() * 2 + 1;
        light.offset = Math.random() * Math.PI * 2;
        this.scene.add(light);
        this.flickeringLights.push(light);
        return light;
    }
    
    setCorruption(level) {
        this.corruptionLevel = Math.max(0, Math.min(1, level));
    }
    
    update(dt) {
        // Update day/night cycle
        this.time += dt * this.cycleSpeed;
        
        // Determine time of day (0-1 = full cycle)
        const cyclePos = (this.time % 1);
        let currentPhase;
        
        if (cyclePos < 0.25) {
            currentPhase = this.interpolatePhase(this.dayCycle.NIGHT, this.dayCycle.DAWN, cyclePos * 4);
        } else if (cyclePos < 0.5) {
            currentPhase = this.interpolatePhase(this.dayCycle.DAWN, this.dayCycle.NOON, (cyclePos - 0.25) * 4);
        } else if (cyclePos < 0.75) {
            currentPhase = this.interpolatePhase(this.dayCycle.NOON, this.dayCycle.DUSK, (cyclePos - 0.5) * 4);
        } else {
            currentPhase = this.interpolatePhase(this.dayCycle.DUSK, this.dayCycle.NIGHT, (cyclePos - 0.75) * 4);
        }
        
        // Apply corruption tint (shift toward purple)
        const corruptionTint = this.corruptionLevel;
        const skyColor = this.lerpColor(currentPhase.sky, 0x4400aa, corruptionTint * 0.5);
        const sunColor = this.lerpColor(currentPhase.sun, 0x8800ff, corruptionTint * 0.3);
        
        // Update lights
        this.scene.fog.color.setHex(skyColor);
        this.ambientLight.color.setHex(skyColor);
        this.ambientLight.intensity = currentPhase.intensity * (1 - corruptionTint * 0.3);
        
        this.sunLight.color.setHex(sunColor);
        this.sunLight.intensity = currentPhase.intensity;
        
        // Update flickering lights
        this.flickeringLights.forEach(item => {
            const noise = Math.sin(this.time * item.speed + item.offset)
                        * Math.sin(this.time * item.speed * 2 + item.offset);
            const chaosFactor = 1 + (this.corruptionLevel * 5);
            const newIntensity = item.baseIntensity + (noise * 0.5 * chaosFactor);
            
            // Strobe effect if highly corrupted
            if (this.corruptionLevel > 0.5 && Math.random() > 0.95) {
                item.intensity = 0;
            } else {
                item.intensity = Math.max(0, newIntensity);
            }
        });
    }
    
    interpolatePhase(phase1, phase2, t) {
        return {
            sky: this.lerpColor(phase1.sky, phase2.sky, t),
            ground: this.lerpColor(phase1.ground, phase2.ground, t),
            sun: this.lerpColor(phase1.sun, phase2.sun, t),
            intensity: phase1.intensity + (phase2.intensity - phase1.intensity) * t
        };
    }
    
    lerpColor(color1, color2, t) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, t).getHex();
    }
}

// ===== ADVANCED ALIEN AI SYSTEM =====
class AdvancedAlienAI {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.state = 'patrol'; // patrol, investigate, chase, hunt
        this.position = { x: 0, y: 1, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.health = 100;
        this.detectionRadius = CONFIG.DETECTION_RANGE;
        this.hearingRadius = CONFIG.HEARING_RANGE;
        this.memory = [];
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.lastSeenPlayerPos = null;
        this.suspicionLevel = 0;
        this.learningData = {
            playerHidingSpots: [],
            playerRoutes: [],
            playerBehaviorPatterns: []
        };
        this.createAI();
    }

    createAI() {
        const alienGeometry = new THREE.BoxGeometry(1, 2, 1);
        const alienMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            emissive: 0x00aa00,
            emissiveIntensity: 0.5
        });
        this.mesh = new THREE.Mesh(alienGeometry, alienMaterial);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        switch(this.state) {
            case 'patrol':
                this.patrol(deltaTime);
                break;
            case 'investigate':
                this.investigate(deltaTime);
                break;
            case 'chase':
                this.chase(deltaTime);
                break;
            case 'hunt':
                this.hunt(deltaTime);
                break;
        }
        this.checkPlayerDetection();
        this.learnFromPlayer();
        this.updatePosition(deltaTime);
    }

    patrol(deltaTime) {
        if (this.patrolPoints.length === 0) return;
        const target = this.patrolPoints[this.currentPatrolIndex];
        this.moveTowards(target, CONFIG.ALIEN_BASE_SPEED, deltaTime);
        
        const distance = Math.sqrt(
            Math.pow(this.position.x - target.x, 2) +
            Math.pow(this.position.z - target.z, 2)
        );
        
        if (distance < 0.5) {
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        }
    }

    investigate(deltaTime) {
        if (this.lastSeenPlayerPos) {
            this.moveTowards(this.lastSeenPlayerPos, CONFIG.ALIEN_BASE_SPEED * 1.5, deltaTime);
            const distance = Math.sqrt(
                Math.pow(this.position.x - this.lastSeenPlayerPos.x, 2) +
                Math.pow(this.position.z - this.lastSeenPlayerPos.z, 2)
            );
            
            if (distance < 1) {
                this.suspicionLevel -= 0.1 * deltaTime;
                if (this.suspicionLevel <= 0) {
                    this.state = 'patrol';
                    this.lastSeenPlayerPos = null;
                }
            }
        }
    }

    chase(deltaTime) {
        const playerPos = this.player.position;
        this.lastSeenPlayerPos = { x: playerPos.x, y: playerPos.y, z: playerPos.z };
        this.moveTowards(playerPos, CONFIG.ALIEN_CHASE_SPEED, deltaTime);
        
        // Learn player's escape routes
        this.learningData.playerRoutes.push({ ...playerPos, timestamp: Date.now() });
    }

    hunt(deltaTime) {
        // Predict player location based on learned patterns
        const predictedPos = this.predictPlayerLocation();
        if (predictedPos) {
            this.moveTowards(predictedPos, CONFIG.ALIEN_CHASE_SPEED * 1.2, deltaTime);
        }
    }

    checkPlayerDetection() {
        const playerPos = this.player.position;
        const distance = Math.sqrt(
            Math.pow(this.position.x - playerPos.x, 2) +
            Math.pow(this.position.z - playerPos.z, 2)
        );

        // Visual detection
        if (distance < this.detectionRadius && !gameState.isHiding) {
            if (Math.random() > CONFIG.HIDING_DETECTION_CHANCE) {
                this.state = 'chase';
                this.suspicionLevel = 100;
                gameState.playerFear = Math.min(100, gameState.playerFear + 10);
            }
        }

        // Audio detection
        if (distance < this.hearingRadius && gameState.isSprinting) {
            this.state = 'investigate';
            this.lastSeenPlayerPos = { ...playerPos };
            this.suspicionLevel = Math.min(100, this.suspicionLevel + 30);
        }
    }

    learnFromPlayer() {
        // Track player hiding spots
        if (gameState.isHiding) {
            const playerPos = this.player.position;
            this.learningData.playerHidingSpots.push({ 
                ...playerPos, 
                timestamp: Date.now() 
            });
        }

        // Analyze behavior patterns
        if (this.learningData.playerRoutes.length > 50) {
            // Advanced ML-like pattern recognition would go here
            this.state = 'hunt';
        }
    }

    predictPlayerLocation() {
        if (this.learningData.playerRoutes.length < 5) return null;
        
        // Simple prediction based on last known positions
        const recent = this.learningData.playerRoutes.slice(-5);
        const avgX = recent.reduce((sum, p) => sum + p.x, 0) / recent.length;
        const avgZ = recent.reduce((sum, p) => sum + p.z, 0) / recent.length;
        
        return { x: avgX, y: 1, z: avgZ };
    }

    moveTowards(target, speed, deltaTime) {
        const dx = target.x - this.position.x;
        const dz = target.z - this.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 0.1) {
            this.velocity.x = (dx / distance) * speed;
            this.velocity.z = (dz / distance) * speed;
        }
    }

    updatePosition(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        }
        
        // Damping
        this.velocity.x *= 0.9;
        this.velocity.z *= 0.9;
    }

    setPatrolPoints(points) {
        this.patrolPoints = points;
    }
}

let alienAI = null;


// ===== NPC DIALOGUE SYSTEM =====
class NPCDialogueSystem {
    constructor() {
        this.dialogues = new Map();
        this.currentDialogue = null;
        this.dialogueUI = null;
        this.createUI();
    }

    createUI() {
        this.dialogueUI = document.createElement('div');
        this.dialogueUI.id = 'dialogue-ui';
        this.dialogueUI.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            width: 600px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 20px;
            color: #00ff00;
            font-family: monospace;
            display: none;
            z-index: 1000;
        `;
        document.body.appendChild(this.dialogueUI);
    }

    addDialogue(npcId, dialogueTree) {
        this.dialogues.set(npcId, dialogueTree);
    }

    showDialogue(npcId, nodeId = 'start') {
        const dialogueTree = this.dialogues.get(npcId);
        if (!dialogueTree) return;

        const node = dialogueTree[nodeId];
        if (!node) return;

        this.currentDialogue = { npcId, nodeId };
        this.dialogueUI.innerHTML = `
            <p style="margin-bottom: 15px; font-size: 14px;">${node.text}</p>
            ${node.choices.map((choice, index) => `
                <button onclick="npcDialogueSystem.selectChoice(${index})" style="
                    display: block;
                    width: 100%;
                    margin: 5px 0;
                    padding: 10px;
                    background: rgba(0, 255, 0, 0.1);
                    border: 1px solid #00ff00;
                    color: #00ff00;
                    cursor: pointer;
                    border-radius: 5px;
                    font-family: monospace;
                ">${choice.text}</button>
            `).join('')}
        `;
        this.dialogueUI.style.display = 'block';
    }

    selectChoice(choiceIndex) {
        if (!this.currentDialogue) return;

        const dialogueTree = this.dialogues.get(this.currentDialogue.npcId);
        const node = dialogueTree[this.currentDialogue.nodeId];
        const choice = node.choices[choiceIndex];

        if (choice.action) {
            choice.action();
        }

        if (choice.next) {
            this.showDialogue(this.currentDialogue.npcId, choice.next);
        } else {
            this.hideDialogue();
        }
    }

    hideDialogue() {
        this.dialogueUI.style.display = 'none';
        this.currentDialogue = null;
    }
}

let npcDialogueSystem = new NPCDialogueSystem();

// ===== HUD SYSTEM =====
class HUDSystem {
    constructor() {
        this.createHUD();
    }

    createHUD() {
        // Health Bar
        const healthBar = document.createElement('div');
        healthBar.id = 'health-bar';
        healthBar.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 200px;
            height: 20px;
            background: rgba(255, 0, 0, 0.3);
            border: 2px solid #ff0000;
            border-radius: 10px;
            overflow: hidden;
        `;
        healthBar.innerHTML = '<div id="health-fill" style="height: 100%; background: #ff0000; width: 100%; transition: width 0.3s;"></div>';
        document.body.appendChild(healthBar);

        // Fear Meter
        const fearMeter = document.createElement('div');
        fearMeter.id = 'fear-meter';
        fearMeter.style.cssText = `
            position: fixed;
            top: 50px;
            left: 20px;
            width: 200px;
            height: 20px;
            background: rgba(255, 255, 0, 0.3);
            border: 2px solid #ffff00;
            border-radius: 10px;
            overflow: hidden;
        `;
        fearMeter.innerHTML = '<div id="fear-fill" style="height: 100%; background: #ffff00; width: 0%; transition: width 0.3s;"></div>';
        document.body.appendChild(fearMeter);

        // Fragment Counter
        const fragmentCounter = document.createElement('div');
        fragmentCounter.id = 'fragment-counter';
        fragmentCounter.style.cssText = `
            position: fixed;
            top: 80px;
            left: 20px;
            color: #00ff00;
            font-family: monospace;
            font-size: 16px;
            text-shadow: 0 0 10px #00ff00;
        `;
        fragmentCounter.textContent = 'Fragments: 0/8';
        document.body.appendChild(fragmentCounter);

        // Zone Indicator
        const zoneIndicator = document.createElement('div');
        zoneIndicator.id = 'zone-indicator';
        zoneIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            color: #00ffff;
            font-family: monospace;
            font-size: 18px;
            text-shadow: 0 0 10px #00ffff;
        `;
        zoneIndicator.textContent = 'Zone 1: Modern District';
        document.body.appendChild(zoneIndicator);

        // Status Messages
        const statusMessages = document.createElement('div');
        statusMessages.id = 'status-messages';
        statusMessages.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: #ffffff;
            font-family: monospace;
            font-size: 14px;
            text-align: center;
            text-shadow: 0 0 5px #000000;
        `;
        document.body.appendChild(statusMessages);
    }

    update() {
        // Update health bar
        const healthFill = document.getElementById('health-fill');
        if (healthFill) {
            healthFill.style.width = `${gameState.playerHealth}%`;
        }

        // Update fear meter
        const fearFill = document.getElementById('fear-fill');
        if (fearFill) {
            fearFill.style.width = `${gameState.playerFear}%`;
        }

        // Update fragment counter
        const fragmentCounter = document.getElementById('fragment-counter');
        if (fragmentCounter) {
            fragmentCounter.textContent = `Fragments: ${gameState.fragmentsCollected}/${CONFIG.MAX_FRAGMENTS}`;
        }

        // Update zone indicator
        const zoneIndicator = document.getElementById('zone-indicator');
        if (zoneIndicator) {
            const zoneNames = {
                1: 'Zone 1: Modern District',
                2: 'Zone 2: Ancient Ruins',
                3: 'Zone 3: Corrupted Lab',
                4: 'Zone 4: Void Nexus'
            };
            zoneIndicator.textContent = zoneNames[gameState.currentZone] || 'Unknown Zone';
        }
    }

    showMessage(message, duration = 3000) {
        const statusMessages = document.getElementById('status-messages');
        if (statusMessages) {
            statusMessages.textContent = message;
            statusMessages.style.opacity = '1';
            setTimeout(() => {
                statusMessages.style.opacity = '0';
            }, duration);
        }
    }
}

let hudSystem = new HUDSystem();


// ===== START GAME =====
window.addEventListener('load', () => {
    initGame();
});
