// Vite Configuration for VIVERSE WebXR Deployment
// Destiny's World - Lost Society in Time
// Optimized for VR/AR and WebXR platforms

import { defineConfig } from 'vite';

export default defineConfig({
  // Base: './' is CRITICAL for VIVERSE/WebXR deployments.
  // It ensures assets are loaded relative to the index.html,
  // preventing 404s when hosted in subdirectories or iframes.
  base: './',
  
  server: {
    port: 3000,
    open: true, // Opens browser automatically on start
    cors: true, // Allows cross-origin loading if needed for external assets
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Helpful for debugging in production
    minify: 'terser', // Standard minification
    
    // Ensure chunks are broken up efficiently for faster loading in VR
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries to cache them separately
          three: ['three'],
        },
      },
    },
  },
  
  // Platform configuration
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  
  // Asset handling for VR environments
  assetsInclude: [
    '**/*.glb',   // 3D models
    '**/*.gltf',  // 3D models
    '**/*.png',   // Textures
    '**/*.jpg',   // Textures
    '**/*.jpeg',  // Textures
    '**/*.mp3',   // Audio files
    '**/*.ogg',   // Audio files
    '**/*.wav',   // Audio files
  ],
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['three'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  
  // Preview server for testing builds
  preview: {
    port: 4173,
    cors: true,
  },
});
