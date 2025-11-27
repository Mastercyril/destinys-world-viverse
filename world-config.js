import * as THREE from 'three';

/**
 * WorldData
 * Contains the spatial layout, NPC spawns, and Item locations for all 4 Zones.
 * Coordinate System: Y is Up. Player starts at 0,0,0 in Zone 1.
 */

export const WORLD_CONFIG = {
    // ==========================================
    // ZONE 1: MODERN DISTRICT (The Calm Before)
    // Layout: City Block, Central Park, Cafe, Alleyway
    // ==========================================
    ZONE_1: {
        spawnPoint: { x: 0, y: 1, z: 0 },
        environment: {
            skyColor: 0x87CEEB,
            groundColor: 0x333333, // Asphalt
        },
        buildings: [
            // The City Streets
            { type: 'SKYSCRAPER', pos: { x: -20, y: 10, z: -20 }, scale: { x: 10, y: 20, z: 10 } },
            { type: 'SKYSCRAPER', pos: { x: 20, y: 15, z: -20 }, scale: { x: 10, y: 30, z: 10 } },
            { type: 'CAFE', pos: { x: -15, y: 2.5, z: 10 }, scale: { x: 8, y: 5, z: 8 }, color: 0xA0522D },
            { type: 'WALL', pos: { x: 0, y: 2, z: -35 }, scale: { x: 60, y: 4, z: 1 } } // City boundary
        ],
        npcs: [
            { id: 'npc_citizen_1', type: 'FRIENDLY', pos: { x: -12, y: 0, z: 12 }, dialogueId: 'cafe_gossip' },
            { id: 'npc_officer', type: 'NEUTRAL', pos: { x: 5, y: 0, z: -10 }, dialogueId: 'police_warning' },
            { id: 'shadow_scout', type: 'HOSTILE', pos: { x: 25, y: 0, z: 25 }, behavior: 'PATROL' } // First encounter
            { id: 'npc_vendor_max', type: 'FRIENDLY', pos: { x: -8, y: 0, z: -5 }, behavior: 'IDLE', dialogueId: 'vendor_shop' },
        ],
        items: [
            { id: 'frag_1', type: 'FRAGMENT', pos: { x: -15, y: 1, z: 10 } }, // Inside Cafe
            { id: 'key_1', type: 'KEY_CARD', pos: { x: 25, y: 1, z: -25 } } // Hidden in alley
        ]
    },

    // ==========================================
    // ZONE 2: NEON CYBERPUNK (The Glitch)
    // Layout: Vertical walkways, Hologram Plaza, Data Center
    // ==========================================
    ZONE_2: {
        spawnPoint: { x: 100, y: 1, z: 0 }, // Offset far from Zone 1
        environment: {
            skyColor: 0x020024,
            groundColor: 0x110011, // Dark metallic
        },
        buildings: [
            // Verticality is key here
            { type: 'TOWER_TECH', pos: { x: 100, y: 20, z: -30 }, scale: { x: 15, y: 40, z: 15 } },
            { type: 'PLATFORM', pos: { x: 100, y: 5, z: 0 }, scale: { x: 20, y: 1, z: 20 } }, // Central Plaza
            { type: 'RAMP', pos: { x: 120, y: 2.5, z: 0 }, scale: { x: 10, y: 1, z: 4 }, rot: { z: 0.5 } }
        ],
        npcs: [
            { id: 'hacker_ally', type: 'FRIENDLY', pos: { x: 105, y: 5, z: -5 }, dialogueId: 'hacker_intro' },
            { id: 'glitch_bot', type: 'HOSTILE', pos: { x: 90, y: 5, z: 5 }, behavior: 'CHASE' },
            { id: 'glitch_bot_2', type: 'HOSTILE', pos: { x: 110, y: 0, z: 20 }, behavior: 'PATROL' },
      { id: 'corp_sec_drone', type: 'HOSTILE', pos: { x: 115, y: 5, z: -10 }, behavior: 'PATROL' }
        ],
        items: [
            { id: 'frag_2', type: 'FRAGMENT', pos: { x: 100, y: 41, z: -30 } }, // Top of tower (Parkour challenge)
            { id: 'data_drive', type: 'QUEST_ITEM', pos: { x: 90, y: 5, z: 0 } }
        ]
    },

    // ==========================================
    // ZONE 3: ANCIENT CORRUPTION (The Ritual)
    // Layout: Maze, Stone Ruins, Underground
    // ==========================================
    ZONE_3: {
        spawnPoint: { x: 200, y: 1, z: 0 },
        environment: {
            skyColor: 0x3e2723,
            groundColor: 0x1a1a1a,
        },
        buildings: [
            { type: 'PILLAR', pos: { x: 190, y: 5, z: 10 }, scale: { x: 2, y: 10, z: 2 } },
            { type: 'PILLAR', pos: { x: 210, y: 5, z: 10 }, scale: { x: 2, y: 10, z: 2 } },
            { type: 'ALTAR', pos: { x: 200, y: 1, z: 20 }, scale: { x: 4, y: 1, z: 3 }, color: 0x550000 },
            { type: 'MAZE_WALL', pos: { x: 200, y: 2, z: -10 }, scale: { x: 30, y: 4, z: 1 } }
        ],
        npcs: [
            { id: 'cultist_leader', type: 'HOSTILE', pos: { x: 200, y: 0, z: 18 }, behavior: 'STATIONARY_ATTACK' },
            { id: 'lost_explorer', type: 'NEUTRAL', pos: { x: 185, y: 0, z: -5 }, dialogueId: 'explorer_warning' },
      { id: 'corrupted_scholar', type: 'NEUTRAL', pos: { x: 195, y: 0, z: 5 }, behavior: 'WANDER', dialogueId: 'scholar_riddles' },
      { id: 'stone_sentinel', type: 'HOSTILE', pos: { x: 210, y: 0, z: -15 }, behavior: 'GUARD' }
        ],
        items: [
            { id: 'frag_3', type: 'FRAGMENT', pos: { x: 200, y: 2, z: 20 } } // On the altar (Trap!)
        ]
    },

    // ==========================================
    // ZONE 4: ETHEREAL VOID (The Reality End)
    // Layout: Floating Islands, Physics defying
    // ==========================================
    ZONE_4: {
        spawnPoint: { x: 300, y: 10, z: 0 },
        environment: {
            skyColor: 0xffffff,
            groundColor: 0xeeeeee,
        },
        buildings: [
            // Floating Islands
            { type: 'ISLAND', pos: { x: 300, y: 10, z: 0 }, scale: { x: 10, y: 0.5, z: 10 } }, // Start
            { type: 'ISLAND', pos: { x: 300, y: 15, z: 20 }, scale: { x: 8, y: 0.5, z: 8 } }, // Step 2
            { type: 'CORE', pos: { x: 300, y: 20, z: 40 }, scale: { x: 5, y: 5, z: 5 }, color: 0xFFD700 } // Final Goal
        ],
        npcs: [
            { id: 'boss_entity', type: 'BOSS', pos: { x: 300, y: 20, z: 35 }, behavior: 'BOSS_PATTERN' },
      { id: 'void_echo_1', type: 'HOSTILE', pos: { x: 295, y: 12, z: 10 }, behavior: 'CHASE' },
      { id: 'timeless_observer', type: 'NEUTRAL', pos: { x: 305, y: 18, z: -5 }, behavior: 'FLOAT', dialogueId: 'observer_prophecy' }
        ],
        items: [
            { id: 'final_frag', type: 'FRAGMENT', pos: { x: 300, y: 20, z: 40 } }
        ]
    }
};
