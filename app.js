// Destiny's World - Lost Society in Time
// Complete Game Implementation with AI, NPCs, and 4 Zones
// Author: Joseph Cyril Dougherty IV

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

// ===== THREE.JS SCENE SETUP =====
let scene, camera, renderer, player, alienKiller;
let clock = new THREE.Clock();

function initThreeJS() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.6, 0);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
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

// ===== INPUT HANDLING =====
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Hide/unhide
    if (e.key.toLowerCase() === 'e') {
        hidePlayer();
    }
    
    // Sprint
    if (e.key === 'Shift') {
        gameState.isSprinting = true;
        gameState.playerFear += 0.1;
    }
    
    // Crouch
    if (e.key.toLowerCase() === 'c') {
        gameState.isCrouching = !gameState.isCrouching;
    }
    
    // Pause
    if (e.key === 'Escape') {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    
    if (e.key === 'Shift') {
        gameState.isSprinting = false;
    }
});

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
// ===== GAME LOOP =====
function animate() {
    requestAnimationFrame(animate);
    
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
}

function gameOver() {
    alert('GAME OVER - The alien killer has consumed your essence.');
    location.reload();
}

function winGame() {
    alert('VICTORY! You collected all fragments and escaped the corrupted reality!');
    location.reload();
}

// ===== START GAME =====
window.addEventListener('load', () => {
    initGame();
});
