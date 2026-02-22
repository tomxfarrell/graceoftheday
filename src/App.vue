<script setup>
import { onMounted, ref } from 'vue';
import * as THREE from 'three';
import AppLogo from './components/AppLogo.vue';

const bgCanvas = ref(null);

onMounted(() => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({
    canvas: bgCanvas.value,
    antialias: true,
    alpha: true,
    // Highp is good, but we add a fallback for older mobile chips
    precision: 'highp' 
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  // Cap pixel ratio at 2 to prevent performance lag on high-res iPhones
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.fog = new THREE.Fog(0xffffff, 10, 60);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  // --- Fixed Sky Shader ---
  const skyGeometry = new THREE.PlaneGeometry(2, 2);
  const skyMaterial = new THREE.ShaderMaterial({
    // Adding precision prefix for mobile stability
    vertexShader: `
      precision highp float;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0); // Simplified for full-screen background
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      void main() {
        gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
      }
    `,
    uniforms: {
      topColor: { value: new THREE.Color(0x87CEEB) },
      bottomColor: { value: new THREE.Color(0xffffff) }
    },
    side: THREE.DoubleSide,
    depthWrite: false, // Prevents Z-fighting confetti
    depthTest: false
  });
  
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  // We don't need to scale or move this sky if we use the simplified vertex shader above
  scene.add(sky);

  camera.position.z = 1;

  // --- Cloud Generation ---
  const canvas = document.createElement('canvas');
  canvas.width = 256; // Increased slightly for better mobile clarity
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);

  for (let i = 0; i < 8; i++) {
    const x = 128 + (Math.random() - 0.5) * 120;
    const y = 128 + (Math.random() - 0.5) * 80;
    const radius = 40 + Math.random() * 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
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
  const clouds = [];
  const cloudMaterial = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false, // Essential to prevent the "confetti" rectangles
    depthTest: true,
    blending: THREE.NormalBlending,
    alphaTest: 0.01
  });

  const cloudGeometry = new THREE.PlaneGeometry(10, 6);

  for (let i = 0; i < 35; i++) {
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloud.position.x = (Math.random() - 0.5) * 40;
    cloud.position.y = Math.random() * 8 - 2;
    cloud.position.z = -Math.random() * 15 - 2;
    cloud.rotation.z = Math.random() * Math.PI;
    const scale = Math.random() * 1.5 + 0.5;
    cloud.scale.set(scale, scale, 1);
    scene.add(cloud);
    clouds.push(cloud);
  }

  const tick = () => {
    clouds.forEach(cloud => {
      const depth = -cloud.position.z;
      const speed = 0.03 / depth; 
      cloud.position.x += speed;
      if (cloud.position.x > 25) cloud.position.x = -25;
    });
    
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };

  tick();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
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
@use "sass:color";

$parchment: #f4f1ea;
$charcoal: #2c3e50;

body {
  margin: 0;
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
  z-index: 0;
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
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);

    .header-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      
      .logo {
        width: 48px;
        height: 48px;
        color: #f1c40f;
      }
      
      .app-title { 
        font-size: 1.6rem; 
        color: $charcoal;
        margin: 0; 
      }
    }

    .nav-link {
      text-decoration: none;
      color: $charcoal;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 8px;

      &.router-link-exact-active {
        background-color: rgba(0, 0, 0, 0.07);
      }
    }
  }

  .content-area {
    flex: 1;
    padding: 2rem;
    position: relative;
    z-index: 1;
  }

  .app-footer {
    padding: 1rem 2rem;
    text-align: center;
    font-size: 0.8rem;
    position: relative;
    z-index: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>