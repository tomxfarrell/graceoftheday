<script setup>
import { ref } from 'vue';
import AppLogo from './components/AppLogo.vue';
import { todaysVerse } from './liturgicalSeason';

const currentYear = new Date().getFullYear();
const copied = ref(false);

const shareVerse = async () => {
  const { text, reference } = todaysVerse.value;
  const message = text
    ? `“${text}” ${reference}`
    : 'Grace of the Day: daily Catholic reflection';
  const url = window.location.origin;

  try {
    if (navigator.share) {
      await navigator.share({ title: 'Grace of the Day', text: message, url });
      return;
    }
    await navigator.clipboard.writeText(`${message}\n${url}`);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2400);
  } catch (error) {
    if (error.name !== 'AbortError') console.error('Share failed:', error);
  }
};
</script>

<template>
  <div id="app-wrapper">
    <header class="app-header">
      <div class="header-inner">
        <router-link to="/" class="brand-link">
          <AppLogo class="logo" />
          <span class="title-group">
            <span class="app-title">Grace of the Day</span>
            <span class="app-tagline">Daily Catholic Reflection</span>
          </span>
        </router-link>
        <router-link to="/past" class="header-link">Past readings</router-link>
      </div>
    </header>

    <main class="content-area">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <!-- Keyed by address, so moving between days loads each day afresh -->
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer" data-chapter="footer">
      <div class="footer-grid">
        <p class="motto" v-reveal>Ad Maiorem Dei Gloriam</p>
        <div class="footer-main">
          <p class="footer-promise">A new scripture, reflection and prayer every morning.</p>
          <!-- The third column: what a reader can do next -->
          <nav class="footer-links" aria-label="More" v-reveal="1">
            <button type="button" class="footer-link" @click="shareVerse">
              {{ copied ? 'Copied' : "Share today's verse" }}
            </button>
            <router-link to="/past" class="footer-link">Past readings</router-link>
          </nav>
          <span class="visually-hidden" role="status">{{ copied ? 'Verse copied to share' : '' }}</span>
        </div>
        <!-- The footer's base line, on the page's left edge beneath everything -->
        <p class="copyright">&copy; {{ currentYear }} Grace of the Day</p>
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
@use './scss/variables' as *;
@use './scss/mixins' as *;

#app-wrapper {
  position: relative;
  min-height: 100svh;

  .app-header {
    position: relative;
    z-index: 2;
    padding: 0.875rem $page-margin;

    @include wide {
      padding-block: 1.5rem;
    }
  }

  // The logo sits on the grid's left edge, above the verse
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    max-width: $content-max;
    margin-inline: auto;
  }

  // One quiet link on the right: the way back through earlier mornings
  .header-link {
    font-size: $step-body;
    font-weight: 500;
    color: var(--ink);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover,
    &.router-link-active {
      color: var(--highlight);
    }

    &:hover {
      text-decoration: underline;
      text-decoration-thickness: 0.08em;
      text-underline-offset: 0.25em;
    }
  }

  .brand-link {
    display: flex;
    width: fit-content;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    text-decoration: none;

    .logo {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
    }

    .title-group {
      display: flex;
      flex-direction: column;
    }

    .app-title {
      font-family: $font-family-serif;
      font-size: $step-lead;
      font-weight: 600;
      line-height: 1.1;
      color: var(--ink);
      letter-spacing: 0.01em;
    }

    .app-tagline {
      color: var(--ink-soft);
      font-family: $font-family-sans;
      font-size: $step-small;
      font-weight: 400;
      line-height: 1.3;
    }
  }

  .content-area {
    position: relative;
    z-index: 1;
  }

  // The footer closes the page in the navy it opened with
  .app-footer {
    --ink: #{$color-ivory};
    --ink-soft: #{$color-navy-ink-soft};
    --highlight: #{$color-accent-gold};
    padding: clamp(4.5rem, 8vw, 6.5rem) $page-margin 2.5rem;
    background: $color-navy;
    color: var(--ink);
  }

  // The footer is the grid's last row: the motto in the narrow column, the promise in the wide
  .footer-grid {
    @include page-grid;
    align-items: baseline;
  }

  // The closing promise: what to expect, every morning
  .footer-promise {
    max-width: 20ch;
    font-family: $font-family-sans;
    font-size: $step-label;
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: -0.02em;
    text-wrap: balance;
    transform-origin: left bottom;

    @supports (animation-timeline: view()) {
      @include motion-ok {
        animation: settle linear both;
        animation-timeline: view();
        animation-range: entry 0% cover 40%;
      }
    }
  }

  // The wide column splits in two: the promise, and the links beside it
  .footer-main {
    display: grid;
    gap: 2rem;

    @include wide {
      grid-template-columns: minmax(0, 1fr) auto;
      column-gap: clamp(3rem, 6vw, 6rem);
    }
  }

  .footer-links {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .footer-link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--ink);
    font: 500 #{$step-body}/1.4 $font-family-sans;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--highlight);
      text-decoration: underline;
      text-decoration-thickness: 0.08em;
      text-underline-offset: 0.25em;
    }
  }

  .motto {
    font-family: $font-family-serif;
    font-size: $step-label;
    font-style: italic;
    font-weight: 500;
    color: var(--ink-soft);
  }

  .copyright {
    grid-column: 1 / -1;
    margin-top: clamp(3rem, 6vw, 5rem);
    font-size: $step-small;
    color: var(--ink-soft);
  }
}

@keyframes settle {
  from {
    opacity: 0.4;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
