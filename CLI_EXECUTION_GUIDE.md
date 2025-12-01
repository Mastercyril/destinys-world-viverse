# VIVERSE CLI Execution Guide

## 🎯 Mission
Publish "Destiny's World - Lost Society in Time" Three.js game as a Standalone VIVERSE application using the VIVERSE CLI.

## 📋 Prerequisites Checklist
- [x] VIVERSE CLI installed globally (`npm install -g @viverse/cli`)
- [x] Authenticated with VIVERSE (`viverse-cli auth login` completed)
- [x] GitHub repository cloned locally at `~/destinys-world-viverse`
- [x] Repository contains: index.html, src/app.js, style.css, assets/

## 🚀 Step-by-Step Execution

### Step 1: Verify Authentication Status
```bash
viverse-cli auth status
```
**Expected Output:** "Logged in as [your-email]@..."

If not logged in:
```bash
viverse-cli auth login
```

### Step 2: List Existing VIVERSE Apps
```bash
viverse-cli app list
```

**This will display:**
- ID: Application identifier (you'll need this)
- STATE: Application state (draft, published, etc.)
- TITLE: Application name
- URL: Application preview URL

**Decision Point:**
- If you see an existing app you want to use → Note the APP_ID and skip to Step 4
- If starting fresh → Proceed to Step 3

### Step 3: Create New VIVERSE App (Optional)
```bash
viverse-cli app create --name "Destinys World - Zone 1"
```

**Expected Output:**
```
✅ Application created successfully!
App ID: [YOUR_NEW_APP_ID]
Title: Destinys World - Zone 1
State: draft
```

**IMPORTANT:** Copy the APP_ID from the output - you'll need it for publishing!

### Step 4: Navigate to Repository
```bash
cd ~/destinys-world-viverse
```

Verify you're in the correct directory:
```bash
ls -la
```

**You should see:**
- index.html
- src/ (folder with app.js)
- style.css
- assets/ (folder)
- README.md
- Other config files

### Step 5: Publish to VIVERSE
```bash
viverse-cli app publish --app-id <YOUR_APP_ID>
```

**Replace `<YOUR_APP_ID>` with:**
- The APP_ID from Step 2 (existing app), OR
- The APP_ID from Step 3 (newly created app)

**Example:**
```bash
viverse-cli app publish --app-id abc123xyz789
```

**What Happens:**
1. CLI scans entire repository folder
2. Uploads ALL files (index.html, src/app.js, style.css, assets/)
3. Processes the WebGL content
4. Creates a draft version in VIVERSE Studio

**Expected Output:**
```
📦 Packaging content...
⬆️  Uploading to VIVERSE...
✅ Upload complete!
🔍 Review your content at: https://studio.viverse.com
```

### Step 6: Complete Publishing in VIVERSE Studio
1. Open browser and navigate to: https://studio.viverse.com
2. Sign in with your VIVERSE account
3. Navigate to "Content Management" → "Apps"
4. Find "Destinys World - Zone 1" (or your app name)
5. Click "Review" button
6. Verify the uploaded content looks correct
7. Click "Publish" to make it live
8. Copy the final VIVERSE URL

## 🎮 Testing Your Published Game

### Test in Browser
```bash
# URL format:
https://worlds.viverse.com/[YOUR_WORLD_ID]
```

Test on:
- Desktop browser (Chrome, Firefox, Safari)
- Mobile browser (iOS Safari, Android Chrome)
- VR headset (Meta Quest, VIVE, etc.)

### Verify Game Features
- [ ] HUD displays correctly (sanity bar, fragments counter)
- [ ] Character movement (WASD or arrow keys)
- [ ] Emotional particle systems render
- [ ] Zone 1 environment loads
- [ ] No console errors

## 🔄 Updating Your Published Game

### When you make changes to the code:

1. Edit files locally (app.js, style.css, etc.)
2. Test changes locally: `open index.html` in browser
3. Commit to GitHub (optional but recommended):
   ```bash
   git add .
   git commit -m "Update: [description]"
   git push
   ```
4. Re-publish to VIVERSE using SAME APP_ID:
   ```bash
   cd ~/destinys-world-viverse
   viverse-cli app publish --app-id <SAME_APP_ID>
   ```
5. Go to VIVERSE Studio → Review → Publish new version

## 🎨 Next Steps: NPC Integration

### Export NPC Models from VIVERSE
1. Go to VIVERSE Avatar Creator
2. Find "Sarah" and "Dr. Aris" avatars
3. Export as .glb files
4. Download to `~/destinys-world-viverse/assets/npcs/`

### Add GLTFLoader to app.js
```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// Load Sarah NPC
loader.load('assets/npcs/sarah.glb', (gltf) => {
    const sarah = gltf.scene;
    sarah.position.set(5, 0, 5);
    scene.add(sarah);
});

// Load Dr. Aris NPC
loader.load('assets/npcs/dr-aris.glb', (gltf) => {
    const drAris = gltf.scene;
    drAris.position.set(-5, 0, 5);
    scene.add(drAris);
});
```

### Re-publish with NPCs
```bash
viverse-cli app publish --app-id <YOUR_APP_ID>
```

## 📊 Project Structure

```
destinys-world-viverse/
├── index.html          # Entry point (REQUIRED)
├── style.css           # UI styles
├── src/
│   └── app.js         # Three.js game logic
├── assets/
│   ├── npcs/          # NPC .glb models (to be added)
│   ├── textures/      # Environment textures
│   └── sounds/        # Audio files
├── README.md
└── CLI_EXECUTION_GUIDE.md  # This file
```

## ⚠️ Critical Notes

1. **Upload Entire Folder:** VIVERSE CLI uploads the ENTIRE repository, not just specific files
2. **No Build Required:** This is a direct WebGL application - no Unity/Unreal build needed
3. **Edit Mode vs Standalone:**
   - ❌ DON'T use VIVERSE Edit Mode (drag-and-drop .glb files)
   - ✅ DO use Standalone Publishing (CLI upload)
4. **Game Logic:** Your Three.js code controls everything (movement, UI, rendering)
5. **VIVERSE Worlds:** Can be used as backgrounds/environments later
6. **Multiplayer:** VIVERSE supports multiplayer - can integrate later

## 🐛 Troubleshooting

### "viverse-cli: command not found"
```bash
npm install -g @viverse/cli
```

### "Not authenticated"
```bash
viverse-cli auth login
```

### "Invalid app-id"
Run `viverse-cli app list` and copy the correct APP_ID

### "Upload failed"
- Check internet connection
- Verify folder contains index.html
- Ensure total size < 1GB

### Game shows black screen after publishing
- Check browser console for errors (F12)
- Verify Three.js imports are correct
- Test locally first: `open index.html`

## 📞 Resources

- VIVERSE CLI Docs: https://docs.viverse.com/standalone-publishing/publishing-to-viverse-with-the-cli
- VIVERSE Studio: https://studio.viverse.com
- npm Package: https://www.npmjs.com/package/@viverse/cli
- Linear Issue: 13T-17 (integration strategy)
- GitHub Repo: https://github.com/Mastercyril/destinys-world-viverse

## ✅ Status

**Current Phase:** Ready to Execute
**User Authentication:** ✅ Logged in
**GitHub Code Status:** ✅ Fixed and committed
**CLI Commands:** ✅ Documented
**Next Action:** Run `viverse-cli app list` to begin

---

**Last Updated:** December 1, 2025
**Linear Issue:** 13T-17
**Status:** READY FOR EXECUTION
