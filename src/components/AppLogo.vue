<template>
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="sunGradient" cx="32" cy="32" r="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FFF9C4" />
        <stop offset="45%" stop-color="#FFC107" />
        <stop offset="100%" stop-color="#FF8F00" />
      </radialGradient>
    </defs>
    
    <!-- Rays -->
    <g stroke="url(#sunGradient)" stroke-width="2" stroke-linecap="round">
      <path d="M32 2V10" />
      <path d="M32 54V62" />
      <path d="M2 32H10" />
      <path d="M54 32H62" />
      <path d="M11 11L17 17" />
      <path d="M47 47L53 53" />
      <path d="M11 53L17 47" />
      <path d="M47 17L53 11" />
    </g>
    
    <!-- Sun Body -->
    <circle cx="32" cy="32" r="18" fill="url(#sunGradient)" />

    <!-- The Cross (White) -->
    <path d="M32 18V46" stroke="white" stroke-width="4" stroke-linecap="round" />
    <path d="M23 28H41" stroke="white" stroke-width="4" stroke-linecap="round" />
  </svg>
</template>