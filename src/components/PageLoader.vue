<script setup>
import AppLogo from './AppLogo.vue';

defineProps({
  show: { type: Boolean, default: true },
  text: { type: String, required: true },
});
</script>

<template>
  <!-- Until the page's words and fonts have arrived, it stays covered. Moved to the body so
       it sits above the header and footer as well. -->
  <Teleport to="body">
    <Transition name="loader">
      <div v-if="show" class="page-loader" role="status">
        <AppLogo class="loader-mark" />
        <p class="loader-text">{{ text }}</p>
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
