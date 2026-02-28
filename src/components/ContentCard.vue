<script setup>
defineProps({
  borderColor: {
    type: String,
    default: 'transparent', // Use transparent as default so it doesn't show if not needed
  },
});
</script>

<template>
  <div class="content-container">
    <!-- The .card class is loaded globally from style.scss -->
    <div class="card" :style="{ borderTopColor: borderColor }">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-container {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem; /* Match padding from old container for consistency */
}
</style>
