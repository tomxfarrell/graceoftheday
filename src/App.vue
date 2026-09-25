<script setup>
import AppLogo from './components/AppLogo.vue';

const currentYear = new Date().getFullYear();
const formattedDate = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'full',
}).format(new Date());
</script>

<template>
  <div id="app-wrapper">
    <div class="ambient-glow glow-gold" aria-hidden="true"></div>
    <div class="ambient-glow glow-purple" aria-hidden="true"></div>

    <header class="app-header">
      <div class="header-container">
        <router-link to="/" class="brand-link">
          <AppLogo class="logo" />
          <div class="title-group">
            <h1 class="app-title">Grace of the Day</h1>
            <span class="app-tagline">Daily Catholic Reflection</span>
          </div>
        </router-link>
        <div class="header-details">
          <div class="date-time-badge">Today is {{ formattedDate }}</div>
        </div>
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
      <p class="motto">Ad Maiorem Dei Gloriam</p>
      <p class="copyright">&copy; {{ currentYear }} Grace of the Day</p>
    </footer>
  </div>
</template>

<style lang="scss">
@use './scss/variables' as *;
@use './scss/mixins' as *;

#app-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1.5rem 2rem;

  .app-header {
    height: $header-height;
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
    border: 0;
    border-radius: 22px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.045),
      rgba(255, 255, 255, 0.02)
    );
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;

    .header-container {
      width: 100%;
      // max-width: $container-max-width;
      margin: 0 auto;
      display: flex;
      align-items: center;
      min-width: 0;
      gap: 1rem;
    }

    .date-time-badge,
    .feast-badge,
    .season-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.55rem 0.95rem;
      border: 0;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.035);
      box-shadow: none;
      color: $color-text-secondary;
      font-size: 0.8rem;
    }

    .date-time-badge {
      gap: 0.45rem;
      color: $color-text-primary;
      font-family: $font-family-serif;
      font-size: 0.95rem;
    }

    .date-prefix {
      color: $color-text-secondary;
      font-family: $font-family-sans;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .header-details {
      min-width: 0;
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .time {
      display: none;
    }

    .feast-badge {
      display: inline-flex;
      align-items: baseline;
      min-width: 0;
      gap: 0.5rem;
      padding: 0.5rem 0.8rem;
      border: 0;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.035);
      color: $color-text-secondary;
    }

    .feast-label {
      flex-shrink: 0;
      color: $color-accent-gold;
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .feast-name {
      min-width: 0;
      color: $color-text-primary;
      font-family: $font-family-serif;
      font-size: 0.9rem;
      line-height: 1.1;
    }

    .season-badge {
      font-size: 0.85rem;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      text-decoration: none;

      .logo {
        width: 40px;
        height: 40px;
      }

      .title-group {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
      }

      .app-title {
        font-family: $font-family-serif;
        font-size: 1.5rem;
        line-height: 1.1;
        color: $color-accent-gold-light;
        letter-spacing: 1px;
        margin: 0;
      }

      .app-tagline {
        color: $color-accent-gold-light;
        font-family: $font-family-sans;
        font-size: 0.6rem;
        font-weight: 500;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        opacity: 0.6;
        margin-left: 0.1rem;
      }
    }
  }

  .content-area {
    flex: 1;
    min-height: 0;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
  }

  .app-footer {
    height: $footer-height;
    flex-shrink: 0;
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    padding: 0.8rem 1rem 0;

    .motto {
      font-family: $font-family-serif;
      font-style: italic;
      color: $color-accent-gold;
      margin: 0;
    }

    .copyright {
      margin: 0;
    }
  }
}

@media (max-width: 820px) {
  #app-wrapper {
    padding: 1rem;

    .app-header {
      padding: 0 1rem;

      .app-title {
        font-size: 1.2rem;
      }

      .app-tagline {
        font-size: 0.56rem;
        letter-spacing: 0.08em;
      }

      .date-time-badge {
        display: none;
      }

      .feast-badge {
        max-width: none;
      }

      .feast-name {
        font-size: 0.8rem;
      }

      .season-badge {
        font-size: 0.75rem;
        padding: 0.4rem 0.7rem;
      }
    }
  }
}
</style>
