// src/InputManager.js
export class InputManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // State
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    
    // Physics
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    // Setup Pointer Lock (Mouse Look)
    this.controls = new THREE.PointerLockControls(camera, document.body);
    this.initListeners();
  }
  
  initListeners() {
    // Click to capture mouse
    document.addEventListener('click', () => {
      this.controls.lock();
    });
    
    // Key Down
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;
          break;
        case 'Space':
          if (this.canJump) this.velocity.y += 150;
          this.canJump = false;
          break;
      }
    };
    
    // Key Up
    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;
          break;
      }
    };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }
  
  update(delta) {
    if (this.controls.isLocked === true) {
      // Friction/Deceleration
      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.y -= 9.8 * 100.0 * delta; // Gravity
      
      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();
      
      if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
      if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;
      
      this.controls.moveRight(-this.velocity.x * delta);
      this.controls.moveForward(-this.velocity.z * delta);
      this.camera.position.y += (this.velocity.y * delta); // Apply jump/gravity
      
      // Floor collision (Simple y > 10 check)
      if (this.camera.position.y < 10) {
        this.velocity.y = 0;
        this.camera.position.y = 10;
        this.canJump = true;
      }
    }
  }
}
