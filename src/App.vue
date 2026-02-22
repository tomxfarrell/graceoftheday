<script setup>
import { onMounted, ref } from 'vue';
import * as THREE from 'three';
import AppLogo from './components/AppLogo.vue';

const bgCanvas = ref(null);

onMounted(() => {
  // --- Three.js Setup ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: bgCanvas.value,
    antialias: true,
    alpha: true,
    precision: 'highp'
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- Scene Environment ---
  // Add fog to blend distant clouds into the sky color for realism
  scene.fog = new THREE.Fog(0xffffff, 10, 60);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  // --- Heavenly Sky Background ---
  const skyGeometry = new THREE.PlaneGeometry(2, 2);
  const skyMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      void main() {
        gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
      }
    `,
    uniforms: {
      topColor: { value: new THREE.Color(0x87CEEB) }, // A lighter, more traditional sky blue
      bottomColor: { value: new THREE.Color(0xffffff) } // Pure White Horizon
    }
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  sky.position.z = -50; // Move sky far behind the clouds
  sky.scale.set(100, 100, 1); // Scale it up to cover the camera view
  scene.add(sky);

  camera.position.z = 1;

  // --- Floating Clouds ---
  // Generate a cloud texture programmatically so you don't need an image file
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);

  // Draw multiple puffs to create a more organic cloud structure
  for (let i = 0; i < 8; i++) {
    const x = 64 + (Math.random() - 0.5) * 60;
    const y = 64 + (Math.random() - 0.5) * 40;
    const radius = 20 + Math.random() * 20;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const cloudTexture = new THREE.CanvasTexture(canvas);
  // Disable mipmaps to prevent artifacts on mobile devices
  cloudTexture.generateMipmaps = false;
  cloudTexture.minFilter = THREE.LinearFilter;
  cloudTexture.magFilter = THREE.LinearFilter;
  cloudTexture.needsUpdate = true;

  const clouds = [];
  // Use Basic material to ensure clouds are bright white and ignore shading
  const cloudMaterial = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });

  const cloudGeometry = new THREE.PlaneGeometry(10, 6);

  for (let i = 0; i < 40; i++) {
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    
    cloud.position.x = (Math.random() - 0.5) * 40;
    cloud.position.y = Math.random() * 5 - 1;
    cloud.position.z = -Math.random() * 15 - 5; // Range: -5 to -20
    
    cloud.rotation.z = Math.random() * Math.PI;
    const scale = Math.random() * 1.5 + 0.5;
    cloud.scale.set(scale, scale, 1);

    scene.add(cloud);
    clouds.push(cloud);
  }

  // --- Animation Loop ---
  const tick = () => {
    // Animate clouds to drift
    clouds.forEach(cloud => {
      // Parallax effect: Deeper clouds (more negative Z) move slower.
      const depth = -cloud.position.z;
      const speed = 0.05 / depth; // Closer clouds (smaller depth) have higher speed.
      cloud.position.x += speed;
      cloud.rotation.z += 0.0002; // Subtle rotation
      if (cloud.position.x > 25) { // If off-screen right
        cloud.position.x = -25; // Reset to the left
      }
    });
    
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };

  tick();

  // Handle Resize
  window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
</script>

<template>
  <div id="app-wrapper">
    <canvas ref="bgCanvas" class="webgl-bg"></canvas>
    
    <header class="app-header">
      <div class="header-container">
        <router-link to="/" class="brand-link">
          <AppLogo class="logo" />
          <h1 class="app-title">Grace of the Day</h1>
        </router-link>
        <nav class="main-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/about" class="nav-link">Our Mission</router-link>
          <router-link to="/prayers" class="nav-link">Prayers</router-link>
        </nav>
      </div>
    </header>

    <main class="content-area">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <p>Ad Maiorem Dei Gloriam</p>
    </footer>
  </div>
</template>

<style lang="scss">
@use "sass:color"; // 1. Import the color module

$parchment: #f4f1ea; // This will be covered by the sky, but good for fallback
$charcoal: #2c3e50;

// Remove html background so it doesn't cover the canvas
// html { background-color: #E0F8FF; }

body {
  margin: 0;
  // This is crucial: the body must be transparent for the 
  // fixed-position canvas behind it to be visible.
  background-color: transparent;
  color: $charcoal;
  font-family: 'Georgia', serif;
}

.webgl-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Base layer */
  pointer-events: none;
}

#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .app-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);

    .header-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .main-links {
      display: flex;
      gap: 0.5rem;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: $charcoal;
      
      .logo {
        width: 48px;
        height: 48px;
        color: #f1c40f; /* Gold for Grace */
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      }
      
      .app-title { 
        font-family: "New York", "Georgia", "Times New Roman", serif;
        font-size: 1.6rem; 
        font-weight: 600; 
        color: $charcoal;
        margin: 0; 
        letter-spacing: -0.02em;
      }
      
      transition: transform 0.3s ease;
      &:hover { transform: scale(1.02); }
    }

    .nav-link {
      text-decoration: none;
      color: $charcoal;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0,0,0,0.05);
      }

      &.router-link-exact-active {
        background-color: rgba(0, 0, 0, 0.07);
        font-weight: 700;
      }
    }
  }

  .content-area {
    flex: 1;
    padding: 2rem;
    position: relative; /* Ensure content is above the background canvas */
    z-index: 1;
  }

  .app-footer {
    padding: 1rem 2rem;
    text-align: center;
    font-size: 0.8rem;
    opacity: 0.6;
    font-style: italic;
    position: relative;
    z-index: 1;
  }
}

// Page Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>