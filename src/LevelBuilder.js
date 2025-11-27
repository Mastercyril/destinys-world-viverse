import * as THREE from 'three';
import { WORLD_CONFIG } from './WorldData.js';
import { ShadowCreature } from './shadow_creature_ai.js'; 

export class LevelBuilder {
    constructor(scene, audioManager) {
        this.scene = scene;
        this.audioManager = audioManager;
        
        // Cache materials to improve performance (Instancing would be next step for optimization)
        this.materials = {
            'SKYSCRAPER': new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 0.1 }),
            'CAFE': new THREE.MeshStandardMaterial({ color: 0xA0522D }),
            'TOWER_TECH': new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x00ff00, emissiveIntensity: 0.2, wireframe: false }),
            'NEON': new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }),
            'PILLAR': new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9, map: null }), // Add texture map here later
            'ALTAR': new THREE.MeshStandardMaterial({ color: 0x8b0000 }),
            'CORE': new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 1.0, roughness: 0.1 }),
            'ISLAND': new THREE.MeshStandardMaterial({ color: 0xeeeeee }),
            'DEFAULT': new THREE.MeshStandardMaterial({ color: 0xcccccc })
        };

        this.geometryCache = {
            'BOX': new THREE.BoxGeometry(1, 1, 1),
            'NPC': new THREE.CapsuleGeometry(0.5, 1.8, 4, 8),
            'FRAGMENT': new THREE.OctahedronGeometry(0.5),
            'ITEM': new THREE.BoxGeometry(0.5, 0.5, 0.5)
        };
    }

    /**
     * The core function to build a specific zone.
     * @param {number} zoneNumber - 1, 2, 3, or 4
     * @returns {THREE.Group} The root group containing the entire zone
     */
    buildZone(zoneNumber) {
        const zoneKey = `ZONE_${zoneNumber}`;
        const config = WORLD_CONFIG[zoneKey];

        if (!config) {
            console.error(`❌ LevelBuilder: Zone ${zoneNumber} configuration not found!`);
            return new THREE.Group();
        }

        console.log(`🏗️ Building ${zoneKey}...`);
        const zoneGroup = new THREE.Group();
        zoneGroup.name = zoneKey;

        // 1. Build Buildings/Static Geometry
        if (config.buildings) {
            config.buildings.forEach(objData => {
                const mesh = this._createMesh(objData);
                zoneGroup.add(mesh);
            });
        }

        // 2. Spawn NPCs
        if (config.npcs) {
            config.npcs.forEach(npcData => {
                const npcGroup = this._createNPC(npcData);
                zoneGroup.add(npcGroup);
            });
        }

        // 3. Place Items
        if (config.items) {
            config.items.forEach(itemData => {
                const itemMesh = this._createItem(itemData);
                zoneGroup.add(itemMesh);
            });
        }

        // 4. Create Ground/Floor
        const floor = this._createFloor(config.environment.groundColor, config.spawnPoint);
        zoneGroup.add(floor);

        return zoneGroup;
    }

    /**
     * Applies the environment settings (Sky color, Fog) for a specific zone.
     * Call this when switching zones.
     * @param {number} zoneNumber 
     */
    applyEnvironment(zoneNumber) {
        const zoneKey = `ZONE_${zoneNumber}`;
        const config = WORLD_CONFIG[zoneKey];
        if (!config || !config.environment) return;

        // Set Background
        this.scene.background = new THREE.Color(config.environment.skyColor);

        // Set Fog (Density adjustments could be added here based on zone config)
        if (this.scene.fog) {
            this.scene.fog.color.setHex(config.environment.skyColor); // Blend fog with sky
            // Adjust density based on zone logic if needed
        }
    }

    // --- Internal Helper Methods ---

    _createMesh(config) {
        // Clone material to allow specific color overrides without affecting shared material
        let mat = this.materials[config.type] || this.materials['DEFAULT'];
        if (config.color) {
            mat = mat.clone();
            mat.color.setHex(config.color);
        }

        const mesh = new THREE.Mesh(this.geometryCache['BOX'], mat);
        
        // Apply Transform
        mesh.position.set(config.pos.x, config.pos.y, config.pos.z);
        mesh.scale.set(config.scale.x, config.scale.y, config.scale.z);
        
        if (config.rot) {
            mesh.rotation.set(
                config.rot.x || 0,
                config.rot.y || 0,
                config.rot.z || 0
            );
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    _createNPC(config) {
        // Visual Mesh
        const mesh = new THREE.Mesh(
            this.geometryCache['NPC'], 
            new THREE.MeshStandardMaterial({ 
                color: config.type === 'HOSTILE' ? 0xff0000 : (config.type === 'FRIENDLY' ? 0x00ff00 : 0xffff00) 
            })
        );
        
        mesh.position.set(config.pos.x, config.pos.y + 0.9, config.pos.z); // Offset for capsule center
        mesh.castShadow = true;
        
        // Metadata for the Game Loop to read
        mesh.userData = {
            id: config.id,
            isNPC: true,
            type: config.type,
            dialogueId: config.dialogueId,
            behavior: config.behavior
        };

        // If Hostile, you might want to attach the AI class here or return it to a manager
        if (config.type === 'HOSTILE' || config.type === 'BOSS') {
            mesh.userData.ai = new ShadowCreature(mesh, mesh.position.clone());
        }

        return mesh;
    }

    _createItem(config) {
        const geoType = config.type === 'FRAGMENT' ? 'FRAGMENT' : 'ITEM';
        const color = config.type === 'FRAGMENT' ? 0x00ffff : 0xffa500;
        
        const mesh = new THREE.Mesh(
            this.geometryCache[geoType],
            new THREE.MeshBasicMaterial({ color: color, wireframe: true })
        );

        mesh.position.set(config.pos.x, config.pos.y, config.pos.z);
        
        // Metadata for interaction
        mesh.userData = {
            id: config.id,
            isItem: true,
            type: config.type
        };

        // Attach Spatial Audio if manager exists and it's a fragment
        if (this.audioManager && config.type === 'FRAGMENT') {
            this.audioManager.attachSpatialSound(mesh, 'FRAGMENT_HUM', true);
        }

        return mesh;
    }

    _createFloor(color, spawnPoint) {
        // Create a large floor centered roughly around the spawn
        const geo = new THREE.PlaneGeometry(300, 300);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        
        // We offset Z slightly to prevent Z-fighting if zones overlap (though they shouldn't)
        mesh.position.set(spawnPoint.x, 0, spawnPoint.z);
        mesh.receiveShadow = true;
        return mesh;
    }
}
