<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import * as THREE from 'three';
import AppLogo from './components/AppLogo.vue';

const bgCanvas = ref(null);
const isMenuOpen = ref(false);
const route = useRoute();

onMounted(() => {
  // --- Three.js Scene Setup ---

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({
    canvas: bgCanvas.value,
    antialias: true,
    alpha: true,
    // Highp is good, but we add a fallback for older mobile chips
    precision: 'highp',
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
      topColor: { value: new THREE.Color(0x87ceeb) },
      bottomColor: { value: new THREE.Color(0xffffff) },
    },
    side: THREE.DoubleSide,
    depthWrite: false, // Prevents Z-fighting confetti
    depthTest: false,
  });

  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  // We don't need to scale or move this sky if we use the simplified vertex shader above
  scene.add(sky);

  camera.position.z = 1;

  // --- Cloud Generation ---
  const canvas = document.createElement('canvas');
  canvas.width = 256; // Increased slightly for better mobile clarity
  canvas.height = 256;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
  cloudTexture.needsUpdate = true;
  const clouds = [];
  const cloudMaterial = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false, // Essential to prevent the "confetti" rectangles
    depthTest: true,
    blending: THREE.NormalBlending,
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
    clouds.forEach((cloud) => {
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

// --- Mobile Menu Logic ---
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Close menu on route change to handle browser back/forward and link clicks
watch(route, () => {
  isMenuOpen.value = false;
});

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

const currentYear = new Date().getFullYear();
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
        <nav class="main-links" :class="{ 'is-open': isMenuOpen }">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/about" class="nav-link">Our Mission</router-link>
          <router-link to="/prayers" class="nav-link">Prayers</router-link>
        </nav>
        <button
          class="hamburger-btn"
          @click="toggleMenu"
          :class="{ 'is-active': isMenuOpen }"
          aria-label="Toggle menu"
        >
          <span class="line"></span>
          <span class="line"></span>
          <span class="line"></span>
        </button>
      </div>
    </header>

    <main class="content-area">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" @before-enter="scrollToTop">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <p class="motto">Ad Maiorem Dei Gloriam</p>
      <p class="copyright">&copy; {{ currentYear }} Grace of the Day</p>
    </footer>
  </div>
</template>

<style lang="scss">
@use './scss/variables' as *;

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
    padding: 0 4rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);

    .header-container {
      max-width: $container-max-width;
      margin: 0 auto;
      padding: 1rem 0;
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
        color: $yellow;
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

  .app-footer {
    padding: 0 2rem 1rem;
    text-align: center;

    position: relative;
    z-index: 1;

    .motto {
      font-family: 'New York', 'Georgia', serif;
      font-style: italic;
      margin-bottom: 0.5rem;
    }

    .copyright {
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.4);
      margin: 0;
    }
  }
}

.hamburger-btn {
  display: none;
  z-index: 20;
  &:focus {
    outline: none;
  }
}

@media (max-width: 820px) {
  #app-wrapper .app-header {
    padding: 0 1.5rem;

    .main-links {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100dvh; // Use dynamic viewport height for mobile
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2rem;

      // Hide by default
      opacity: 0;
      pointer-events: none;
      transform: translateY(-10px);
      transition:
        opacity 0.3s ease,
        transform 0.3s ease;

      &.is-open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }

      .nav-link {
        font-size: 1.8rem;
        font-weight: 700;
      }
    }

    .hamburger-btn {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      width: 2rem;
      height: 2rem;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;

      .line {
        width: 2rem;
        height: 2px;
        background: $charcoal;
        border-radius: 10px;
        transition: all 0.3s ease-in-out;
        transform-origin: center;
      }

      &.is-active .line:nth-child(1) {
        transform: translateY(9px) rotate(45deg);
      }
      &.is-active .line:nth-child(2) {
        opacity: 0;
      }
      &.is-active .line:nth-child(3) {
        transform: translateY(-9px) rotate(-45deg);
      }
    }
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
