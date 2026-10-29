<script setup>
import { ref } from 'vue';
import AppLogo from './AppLogo.vue';

defineProps({
  show: { type: Boolean, default: true },
  text: { type: String, required: true },
});

// It takes over from the loader in index.html mid-breath: both keep time with the page's
// clock, so the logo carries on rather than starting its breath again
const BREATH_MS = 2400;
const breathDelay = `${-(performance.now() % BREATH_MS)}ms`;

// The text waits for its typeface rather than flashing a fallback
const LOADER_FONT = 'italic 500 1em "Cormorant Garamond"';
const fontsReady = ref(!document.fonts || document.fonts.check(LOADER_FONT));
if (!fontsReady.value) {
  document.fonts.load(LOADER_FONT).then(() => {
    fontsReady.value = true;
  });
}
</script>

<template>
  <!-- Until the page's words and fonts have arrived, it stays covered. Moved to the body so
       it sits above the header and footer as well. -->
  <Teleport to="body">
    <Transition name="loader">
      <div v-if="show" class="page-loader" role="status">
        <AppLogo class="loader-mark" :style="{ animationDelay: breathDelay }" />
        <p class="loader-text" :class="{ 'is-ready': fontsReady }">{{ text }}</p>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '../scss/variables' as *;
@use '../scss/mixins' as *;

// The navy the page opens on, the logo breathing
.page-loader {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 1.5rem;
  background: $color-navy;
}

.loader-mark {
  width: 3.5rem;
  height: 3.5rem;

  @include motion-ok {
    animation: breathe 2.4s ease-in-out infinite;
  }
}

.loader-text {
  font-family: $font-family-serif;
  font-size: $step-lead;
  font-style: italic;
  font-weight: 500;
  color: $color-navy-ink-soft;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.is-ready {
    opacity: 1;
  }
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(0.92);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.loader-leave-active {
  transition: opacity 0.6s ease;
}

.loader-leave-to {
  opacity: 0;
}
</style>
