INTEGRATION_GUIDE.md# Destiny's World: Repository Integration Guide

**Date:** November 26, 2025, 9 PM EST  
**Status:** Phase 1-3 COMPLETED | Phase 4-5 PENDING

---

## 🎯 PROJECT OVERVIEW

**Objective:** Merge two GitHub repositories for "Destiny's World: The Ancient One" - a horror survival game featuring alien AI, NPC systems, and player mechanics.

**Repositories Being Merged:**
1. **AI-Alien-Horror-Game** - Unity C# design documentation (25 scripts)
2. **destinys-world-viverse** - THREE.js production game code (JavaScript)

**Strategy:** Subtree merge with organized structure (confirmed by Perplexity AI and Gemini)

---

## ✅ COMPLETED WORK (Phases 1-3)

### Phase 1: Folder Structure Creation ✓
- **src/** folder created for all JavaScript modules
- Repository now supports ES6 module architecture

### Phase 2: New JavaScript Files Created ✓

#### 1. **src/InputManager.js**
**Purpose:** First-person camera controls and player movement  
**Features:**
- PointerLock controls for mouse look
- WASD movement system
- Jump mechanics with gravity simulation
- Floor collision detection
- Translated from Unity C# PlayerMovement.cs

**Usage:**
```javascript
import { InputManager } from './InputManager.js';
const inputManager = new InputManager(camera, document.body);
inputManager.update(delta); // Call in animation loop
```

#### 2. **src/AlienAI.js**
**Purpose:** AI behavior system for Xyloth (the alien)
**Features:**
- Vector-based pathfinding (NO NavMesh dependency)
- State machine: IDLE → CHASING
- Distance-based detection (30 unit range)
- Collision detection for jumpscare trigger
- Placeholder red box mesh (ready for GLB model)
- Translated from Unity C# AlienMovement.cs

**Usage:**
```javascript
import { AlienAI } from './AlienAI.js';
const alien = new AlienAI(scene, playerCamera);
alien.update(delta); // Call in animation loop
```

### Phase 3: Core Files Updated ✓

#### **index.html** - Modernized with ES6 Modules
**Changes:**
- ✅ Added importmap for THREE.js 0.160.0
- ✅ Replaced old CDN script tag
- ✅ Changed app.js to load from ./src/app.js
- ✅ Added type="module" for ES6 support

**Importmap Structure:**
```html
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
</script>
```

---

## ⏳ PENDING WORK (Phases 4-5)

### Phase 4: File Organization & Migration

#### A. Move Existing JavaScript Files to src/
**Files to Move:**
- ❌ app.js → src/app.js
- ❌ LevelBuilder.js → src/LevelBuilder.js
- ❌ WeatherSystem.js → src/WeatherSystem.js
- ❌ DialogueData.js → src/DialogueData.js

**How to Move (GitHub Web):**
1. Open each file
2. Click Edit
3. Change filename to include src/ prefix
4. Commit changes

#### B. Update app.js with New Imports
**Required Changes:**
```javascript
// Add these imports at the top
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { InputManager } from './InputManager.js';
import { AlienAI } from './AlienAI.js';
import { LevelBuilder } from './LevelBuilder.js';

// Initialize in setup
const inputManager = new InputManager(camera, document.body);
const alien = new AlienAI(scene, camera);

// Update in animation loop
inputManager.update(delta);
alien.update(delta);
```

#### C. Create design_docs/ Folder Structure
**Purpose:** Store 25 C# scripts as reference documentation

**Folder Structure:**
```
design_docs/
├── markdown/           (Game design documents)
└── c_sharp_reference/  (Unity C# scripts - NOT for execution)
    ├── AI/            (2 files: AlienMovement.cs, XylothAdvancedAI.cs)
    ├── NPC/           (7 files: NPC controllers and managers)
    ├── Player/        (4 files: PlayerMovement.cs, InteractionSystem.cs, etc.)
    ├── Systems/       (6 files: GameSaveSystem.cs, MemorySystem.cs, etc.)
    └── World/         (6 files: DoorController.cs, LightFlicker.cs, etc.)
```

**Important:** These C# files are REFERENCE ONLY - they document the game logic but are not executed in the browser.

#### D. Create assets/ Folder
**Purpose:** Centralized location for game assets
```
assets/
├── models/     (GLB/GLTF 3D models)
├── textures/   (PNG/JPG images)
└── audio/      (MP3/WAV sounds)
```

### Phase 5: Deployment Setup

#### A. Create .github/workflows/deploy.yml
**Purpose:** Automated deployment pipeline

**Workflow File:**
```yaml
name: Deploy to VIVERSE

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create deployment ZIP
        run: |
          mkdir -p deploy
          cp index.html deploy/
          cp style.css deploy/
          cp -r src deploy/
          cp -r assets deploy/
          cd deploy
          zip -r ../destinys-world-viverse.zip .
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: viverse-deployment
          path: destinys-world-viverse.zip
```

#### B. Files to EXCLUDE from Deployment ZIP
- ❌ design_docs/ (C# reference documentation)
- ❌ .git/ and .gitignore
- ❌ node_modules/
- ❌ package.json / package-lock.json
- ❌ Orchestra/ folder (build automation)
- ❌ README.md (development docs)
- ❌ .DS_Store (Mac) / Thumbs.db (Windows)

#### C. Files to INCLUDE in Deployment ZIP
- ✅ index.html
- ✅ style.css
- ✅ src/ folder (all JavaScript modules)
- ✅ assets/ folder (models, textures, audio)

---

## 🚀 NEXT STEPS (Priority Order)

### Immediate Actions
1. **Move JavaScript files to src/ folder**
2. **Update app.js with InputManager and AlienAI imports**
3. **Test locally** with VS Code Live Server
4. **Create design_docs/ structure**
5. **Upload 25 C# files** from AI-Alien-Horror-Game repo

### Testing Checklist
- [ ] Game loads without console errors
- [ ] Click to start works (PointerLock engages)
- [ ] WASD movement functions
- [ ] Mouse look controls camera
- [ ] Red alien box spawns and chases player
- [ ] Jumpscare triggers when alien gets close

### Deployment Checklist
- [ ] All files moved to src/
- [ ] App.js updated and tested
- [ ] design_docs/ created and populated
- [ ] assets/ folder created
- [ ] GitHub Actions workflow created
- [ ] Deployment ZIP created (excluding design_docs)
- [ ] ZIP tested in VIVERSE

---

## 📊 CURRENT REPOSITORY STRUCTURE

```
destinys-world-viverse/
├── index.html           ✅ UPDATED (importmap added)
├── style.css            ✅ EXISTING
├── src/                 ✅ NEW FOLDER
│   ├── InputManager.js  ✅ CREATED
│   └── AlienAI.js       ✅ CREATED
├── app.js               ⏳ NEEDS TO MOVE → src/app.js
├── LevelBuilder.js      ⏳ NEEDS TO MOVE → src/
├── WeatherSystem.js     ⏳ NEEDS TO MOVE → src/
├── DialogueData.js      ⏳ NEEDS TO MOVE → src/
├── Orchestra/           ❌ EXCLUDE (build automation)
└── [Other files]        ✅ KEEP AS-IS
```

---

## 🔗 KEY REFERENCES

**Gemini Execution Plan:**  
https://gemini.google.com/app/f915f146d75d18d4

**Perplexity Best Practices:**  
https://www.perplexity.ai/search/...

**GitHub Repository:**  
https://github.com/Mastercyril/destinys-world-viverse

---

## ⚠️ CRITICAL REMINDERS

1. **DO NOT include Dimensional Travelers** - separate unfinished project
2. **DO NOT include Orchestra folder** - build automation only
3. **INCLUDE ALL parts** from both AI-Alien-Horror-Game and destinys-world-viverse
4. **EXCLUDE design_docs/** from final VIVERSE deployment ZIP
5. **Test locally** before creating deployment ZIP
6. **Three.js MUST load via importmap** (not old CDN method)

---

## 📞 SUPPORT

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify importmap is present in index.html
3. Confirm all src/ files are using ES6 export/import
4. Test with VS Code Live Server extension
5. Refer to Gemini execution plan for complete code

---

**Last Updated:** November 26, 2025 by Comet (Perplexity Browser Assistant)  
**Next Review:** After Phase 4 completion
