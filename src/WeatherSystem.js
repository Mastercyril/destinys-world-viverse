import * as THREE from 'three';

/**
 * WeatherSystem.js
 * Dynamic weather system with particle effects, sound, and zone-specific patterns
 * Supports: SUNNY, RAINY, FOGGY, STORMY weather types
 */

export const WEATHER_TYPES = {
  SUNNY: 'SUNNY',
  RAINY: 'RAINY',
  FOGGY: 'FOGGY',
  STORMY: 'STORMY'
};

export class WeatherSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.currentWeather = WEATHER_TYPES.SUNNY;
    this.particles = null;
    this.fog = null;
    this.windStrength = 0;
    
    this.init();
  }

  init() {
    // Initialize particle system for rain/snow
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const particleCount = 5000;

    for (let i = 0; i < particleCount; i++) {
      vertices.push(
        Math.random() * 200 - 100,
        Math.random() * 200,
        Math.random() * 200 - 100
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.5,
      transparent: true,
      opacity: 0.6
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.visible = false;
    this.scene.add(this.particles);
  }

  setWeather(weatherType) {
    this.currentWeather = weatherType;
    
    switch(weatherType) {
      case WEATHER_TYPES.SUNNY:
        this.setSunny();
        break;
      case WEATHER_TYPES.RAINY:
        this.setRainy();
        break;
      case WEATHER_TYPES.FOGGY:
        this.setFoggy();
        break;
      case WEATHER_TYPES.STORMY:
        this.setStormy();
        break;
    }
  }

  setSunny() {
    this.particles.visible = false;
    this.scene.fog = null;
    this.windStrength = 0;
    console.log('[Weather] Set to SUNNY');
  }

  setRainy() {
    this.particles.visible = true;
    this.particles.material.color.setHex(0x4488ff);
    this.particles.material.size = 0.3;
    this.scene.fog = new THREE.Fog(0x555555, 50, 200);
    this.windStrength = 2;
    console.log('[Weather] Set to RAINY');
  }

  setFoggy() {
    this.particles.visible = false;
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.015);
    this.windStrength = 0.5;
    console.log('[Weather] Set to FOGGY');
  }

  setStormy() {
    this.particles.visible = true;
    this.particles.material.color.setHex(0x88aaff);
    this.particles.material.size = 0.8;
    this.scene.fog = new THREE.Fog(0x222222, 30, 150);
    this.windStrength = 5;
    console.log('[Weather] Set to STORMY');
  }

  update(deltaTime) {
    if (this.particles.visible) {
      const positions = this.particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Rain falls down
        positions[i + 1] -= deltaTime * 50;
        
        // Wind effect
        positions[i] += deltaTime * this.windStrength;
        
        // Reset particle when it goes below ground
        if (positions[i + 1] < 0) {
          positions[i + 1] = 200;
          positions[i] = Math.random() * 200 - 100;
          positions[i + 2] = Math.random() * 200 - 100;
        }
      }
      
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }

  // Zone-specific weather patterns
  getZoneWeather(zoneId) {
    const weatherPatterns = {
      'ZONE_1': WEATHER_TYPES.SUNNY,
      'ZONE_2': WEATHER_TYPES.RAINY,
      'ZONE_3': WEATHER_TYPES.FOGGY,
      'ZONE_4': WEATHER_TYPES.STORMY
    };
    return weatherPatterns[zoneId] || WEATHER_TYPES.SUNNY;
  }

  applyZoneWeather(zoneId) {
    const weather = this.getZoneWeather(zoneId);
    this.setWeather(weather);
  }
}
