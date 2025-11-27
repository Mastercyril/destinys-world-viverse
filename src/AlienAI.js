// src/AlienAI.js
export class AlienAI {
  constructor(scene, playerCamera) {
    this.scene = scene;
    this.player = playerCamera;
    this.mesh = null;
    
    // AI Settings
    this.speed = 5.0; // Units per second
    this.detectionRange = 30.0;
    this.killDistance = 2.0;
    this.state = 'IDLE'; // IDLE, CHASING
    
    this.initMesh();
  }
  
  initMesh() {
    // Placeholder Red Box until you load a GLB model
    const geometry = new THREE.BoxGeometry(2, 4, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(20, 2, -20); // Start position
    this.scene.add(this.mesh);
  }
  
  update(delta) {
    if (!this.mesh) return;
    
    const distance = this.mesh.position.distanceTo(this.player.position);
    
    // State Machine
    if (distance < this.detectionRange) {
      this.state = 'CHASING';
    } else {
      this.state = 'IDLE';
    }
    
    // Behavior
    if (this.state === 'CHASING') {
      // Look at player
      this.mesh.lookAt(this.player.position.x, 2, this.player.position.z);
      
      // Move towards player
      const direction = new THREE.Vector3()
        .subVectors(this.player.position, this.mesh.position)
        .normalize();
      
      // Stop moving if too close (Collision)
      if (distance > this.killDistance) {
        this.mesh.position.add(direction.multiplyScalar(this.speed * delta));
      } else {
        console.log('JUMPSCARE TRIGGERED!');
        // Trigger Game Over logic here
      }
    }
  }
}
