<script setup>
import { ref, onMounted, computed } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { currentFeast } from '../liturgicalSeason';

// --- State Management ---
const dayData = ref(null);
const aiResponse = ref({
  virtue: '',
  reflection: '',
  scripture: '',
  verse_ref: '',
  prayer: '',
  action: '',
});
const loading = ref(true);

// --- Configuration ---
// These are loaded from .env file for local dev, and from Netlify environment variables in production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Computed Properties ---
const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(
    new Date()
  );
});

const currentSeason = computed(() => {
  if (!dayData.value) return { icon: '⛪', label: 'Liturgical Year' };
  const icons = {
    Lent: '💜',
    Easter: '🌅',
    Advent: '🕯️',
    Christmas: '🌟',
    'Ordinary Time': '🌿',
  };
  return {
    icon: icons[dayData.value.season] || '⛪',
    label: dayData.value.season,
  };
});

// --- Methods ---

/**
 * Helper to map the JSON data to our reactive state
 */
const applyData = (data) => {
  dayData.value = { title: data.feast, season: data.season };
  currentFeast.value = data.feast;
  aiResponse.value = {
    virtue: data.virtue,
    reflection: data.reflection,
    scripture: data.scripture,
    verse_ref: data.verse_ref,
    prayer: data.prayer,
    action: data.action,
  };

};

/**
 * Calculates the date of Easter for a given year using the Meeus/Jones/Butcher algorithm.
 * @param {number} year The year to calculate Easter for.
 * @returns {Date} The date of Easter.
 */
const getEaster = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // month is 1-based
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Determine the liturgical season and color client-side for fallback purposes.
 * This provides a graceful fallback if the API fails, ensuring the UI still
 * reflects the correct season.
 * @param {Date} date The current date.
 * @returns {{name: string}} The season name.
 */
const getFallbackSeason = (date) => {
  const today = new Date(date);
  today.setUTCHours(0, 0, 0, 0);
  const year = today.getUTCFullYear();

  // --- Key Liturgical Dates ---
  const easter = getEaster(year);

  const goodFriday = new Date(easter);
  goodFriday.setUTCDate(easter.getUTCDate() - 2);

  const palmSunday = new Date(easter);
  palmSunday.setUTCDate(easter.getUTCDate() - 7);

  const ashWednesday = new Date(easter);
  ashWednesday.setUTCDate(easter.getUTCDate() - 46);

  // Laetare Sunday is the 4th Sunday of Lent.
  const firstSundayOfLent = new Date(ashWednesday);
  firstSundayOfLent.setUTCDate(
    ashWednesday.getUTCDate() + ((7 - ashWednesday.getUTCDay()) % 7)
  );
  const laetareSunday = new Date(firstSundayOfLent);
  laetareSunday.setUTCDate(firstSundayOfLent.getUTCDate() + 21);

  const pentecost = new Date(easter);
  pentecost.setUTCDate(easter.getUTCDate() + 49);

  const christmas = new Date(Date.UTC(year, 11, 25));

  // First Sunday of Advent is the Sunday between Nov 27 and Dec 3.
  const nov27 = new Date(Date.UTC(year, 10, 27));
  const firstSundayOfAdvent = new Date(nov27);
  firstSundayOfAdvent.setUTCDate(
    nov27.getUTCDate() + ((7 - nov27.getUTCDay()) % 7)
  );

  // Gaudete Sunday is the 3rd Sunday of Advent.
  const gaudeteSunday = new Date(firstSundayOfAdvent);
  gaudeteSunday.setUTCDate(firstSundayOfAdvent.getUTCDate() + 14);

  // Baptism of the Lord is the Sunday after Epiphany (Jan 6).
  const epiphanyCurrentYear = new Date(Date.UTC(year, 0, 6));
  const baptismOfTheLord = new Date(epiphanyCurrentYear);
  baptismOfTheLord.setUTCDate(
    epiphanyCurrentYear.getUTCDate() +
      ((7 - epiphanyCurrentYear.getUTCDay()) % 7)
  );

  // --- Season Determination ---
  if (today >= firstSundayOfAdvent && today < christmas) {
    if (today.getTime() === gaudeteSunday.getTime())
      return { name: 'Gaudete Sunday' };
    return { name: 'Advent' };
  }
  if (
    (today.getUTCMonth() === 11 && today.getUTCDate() >= 25) ||
    (today.getUTCMonth() === 0 && today <= baptismOfTheLord)
  ) {
    return { name: 'Christmas' };
  }
  if (today >= ashWednesday && today < easter) {
    if (today.getTime() === laetareSunday.getTime())
      return { name: 'Laetare Sunday' };
    if (today.getTime() === palmSunday.getTime())
      return { name: 'Palm Sunday' };
    if (today >= goodFriday && today < easter)
      return { name: 'Triduum' };
    return { name: 'Lent' };
  }
  if (today >= easter && today <= pentecost) {
    if (today.getTime() === pentecost.getTime())
      return { name: 'Pentecost' };
    return { name: 'Easter' };
  }

  return { name: 'Ordinary Time' };
};

/**
 * Main logic: Check DB -> AI -> Save to DB
 */
const fetchData = async () => {
  // Use YYYY-MM-DD for a reliable database key
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  try {
    // 1. Check if the community has already generated today's data
    const { data: existing, error: fetchError } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('date_key', todayKey)
      .limit(1)
      .maybeSingle();

    // Explicitly check for a fetch error. This is often due to RLS policies.
    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      throw new Error(
        `Failed to read from cache: ${fetchError.message}. Check your table's Row Level Security policies.`
      );
    }

    if (existing) {
      console.log('Serving cached wisdom from Supabase.');
      applyData(existing.content);
      loading.value = false;
      return;
    }

    // 2. If no data exists, this user is the "Providential Visitor"
    console.log('First visitor of the day! Generating new reflection...');

    // Call our secure serverless function
    const response = await fetch('/.netlify/functions/generate-reflection', {
      method: 'POST',
      body: JSON.stringify({ date: new Date().toDateString() }),
    });

    if (!response.ok) {
      throw new Error(
        `Netlify function failed with status: ${response.status}`
      );
    }
    const parsed = await response.json();

    if (parsed) {
      // 3. Save it to Supabase so the next person gets it instantly
      const { error: insertError } = await supabase
        .from('daily_reflections')
        .insert([{ date_key: todayKey, content: parsed }]);

      if (insertError)
        console.error('Could not save to Supabase:', insertError);

      applyData(parsed);
    }
  } catch (error) {
    console.error('System Error:', error);
    // Fallback in case both Supabase and Gemini are struggling
    if (!dayData.value) {
      const fallback = getFallbackSeason(new Date());
      dayData.value = { title: 'Daily Reflection', season: fallback.name };
      currentFeast.value = '';
    }
    aiResponse.value = {
      virtue: 'Patience',
      reflection:
        'We are momentarily unable to retrieve the daily reading. Please check back in a moment.',
      scripture: 'Be still, and know that I am God.',
      verse_ref: 'Psalm 46:10',
      prayer: 'Lord, grant us peace.',
      action: 'Take a moment of silence.',
    };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="home-view">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading today's grace...</p>
    </div>

    <main v-else class="dashboard">
      <section class="panel primary-focus featured-panel">
        <div class="scripture-card">
          <h4 class="label">Featured Daily Scripture</h4>
          <blockquote>"{{ aiResponse.scripture }}"</blockquote>
          <cite>— {{ aiResponse.verse_ref }}</cite>
        </div>

        <div class="reflection-container">
          <h3>Spiritual Reflection</h3>
          <p class="reflection-text">{{ aiResponse.reflection }}</p>
        </div>
      </section>

      <section class="panel side-panel context-panel">
        <div class="context-topline">
          <div v-if="currentFeast" class="feast-content panel-section">
            <h4>Saint / Feast</h4>
            <p>{{ currentFeast }}</p>
          </div>
        </div>

        <div class="panel-section virtue-section">
          <h4>Today's Virtue</h4>
          <div class="lit-color-row">
            <p class="virtue-content">
              {{ aiResponse.virtue }}
            </p>
          </div>
        </div>

        <div class="panel-section">
          <h4>Daily Prayer</h4>
          <p class="prayer-text">{{ aiResponse.prayer }}</p>
        </div>

        <div class="panel-section">
          <h4>Faith in Action</h4>
          <p class="action-text">{{ aiResponse.action }}</p>
        </div>

      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '../scss/variables' as *;
@use '../scss/mixins' as *;

.home-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dashboard {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(260px, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  gap: 1.25rem;
  min-height: 0;

  .view-switcher {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    gap: 0.5rem;

    button {
      padding: 0.65rem 1.1rem;
      border: 1px solid transparent;
      border-radius: 999px;
      background: transparent;
      color: $color-text-secondary;
      font: 600 0.85rem $font-family-sans;
      cursor: pointer;
      transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;

      &:hover,
      &.active {
        border-color: rgba($color-accent-gold, 0.35);
        background: rgba($color-accent-gold, 0.1);
        color: $color-accent-gold-light;
      }
    }
  }

  .panel {
    @include frosted-glass;
    border-radius: $border-radius-card;
      padding: 1.5rem;
      display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;

    &.primary-focus {
      position: relative;
      width: 100%;
      margin: 0 auto;
      padding: 2.25rem 2rem;
      border-color: rgba($color-accent-gold, 0.24);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28), 0 0 36px rgba($color-accent-gold, 0.06);

      .scripture-card {
        position: relative;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        text-align: center;
        display: flex;
        flex-direction: column;
        padding: 2.5rem 2rem;
        border: 1px solid rgba($color-accent-gold, 0.2);
        border-radius: 24px;
        background: radial-gradient(
          circle at 50% 0%,
          rgba($color-accent-gold, 0.1),
          rgba(255, 255, 255, 0.025) 65%
        );
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 6px 20px rgba($color-accent-gold, 0.05);

        &::before {
          content: '“';
          display: block;
          height: 1.5rem;
          margin-top: 0.25rem;
          color: $color-accent-gold;
          font-family: $font-family-serif;
          font-size: 5rem;
          line-height: 1;
          opacity: 0.45;
        }

        .scripture-meta {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem 0.9rem;
          margin-bottom: 1rem;
          color: rgba($color-text-secondary, 0.65);
          font-size: 0.65rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;

          span + span::before {
            content: '·';
            margin-right: 0.9rem;
            color: rgba($color-accent-gold, 0.55);
          }
        }

        .label {
          margin-top: 0.25rem;
          margin-bottom: 1.25rem;
        }

        blockquote {
          max-width: 30ch;
          margin: 0 auto 1.25rem;
          font-family: $font-family-serif;
          font-size: clamp(1.75rem, 4vw, 3.5rem);
          font-weight: 500;
          line-height: 1.35;
          color: $color-text-primary;
          font-style: italic;
          text-wrap: balance;
        }

        cite {
          display: block;
          font-size: 0.9rem;
          color: $color-accent-gold;
          font-weight: 600;
          letter-spacing: 0.75px;
          text-transform: uppercase;
        }
      }

      .reflection-container {
        flex: 0 0 auto;
        margin-top: 1.25rem;
        padding-right: 0.5rem;

        h3 {
          font-family: $font-family-serif;
          font-size: 1.2rem;
          color: $color-accent-gold;
          margin-bottom: 0.75rem;
        }

        .reflection-text {
          font-size: 0.98rem;
          line-height: 1.65;
          color: $color-text-secondary;
        }
      }
    }

    &.side-panel {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018));
      border-color: rgba(255, 255, 255, 0.075);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
      overflow-y: auto;
      @include custom-scrollbar;

      &.reflection-panel {
        grid-column: 1;
        width: 100%;
        margin: 0 auto;
      }

      &.context-panel {
        grid-column: 2;
        width: 100%;

        .context-topline {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .context-date {
          color: $color-text-secondary;
          font-size: 0.72rem;
        }

        .feast-content {
          margin-bottom: 0;

          h4 {
            color: $color-accent-gold;
          }

          p {
            margin: 0;
            color: $color-text-secondary;
            font-family: $font-family-sans;
            font-size: 0.92rem;
            font-style: normal;
            line-height: 1.5;
          }
        }

        .feast-content + .virtue-section {
          margin-top: 0;
        }

        .feast-label {
          color: $color-accent-gold;
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .feast-name {
          color: $color-text-primary;
          font-family: $font-family-serif;
          font-size: 0.9rem;
          line-height: 1.1;
        }

        .panel-date {
          margin-bottom: 1.25rem;
          padding-bottom: 1.1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .date-value {
          color: $color-text-secondary;
          font-family: $font-family-sans;
          font-size: 0.82rem;
          letter-spacing: 0.01em;
        }
      }

      &.reflection-panel .reflection-container {
        flex: 1;
        overflow-y: auto;
        padding-right: 0.5rem;
        @include custom-scrollbar;

        h3 {
          font-family: $font-family-serif;
          font-size: 1.5rem;
          color: $color-accent-gold-light;
          margin-bottom: 1rem;
        }

        .reflection-text {
          font-size: 1.05rem;
          line-height: 1.75;
          color: $color-text-secondary;
        }
      }

      .panel-section {
        margin-bottom: 1.5rem;

        h4 {
          color: rgba($color-accent-gold, 0.75);
          font-size: 0.68rem;
        }

        &:last-of-type {
          margin-bottom: 0;
        }
      }
    }
  }
}

h4 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: $color-accent-gold;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.side-panel {
  p {
    font-size: 0.92rem;
    color: $color-text-secondary;
    line-height: 1.5;
    margin-bottom: 0.35rem;
  }

  .context-season {
    font-size: 1.05rem;
    margin-bottom: 0.75rem;

    .season-icon {
      margin-right: 0.4rem;
    }
  }

  .context-feast,
  .feast-line {
    font-size: 1rem;
  }

  .virtue-section {
    padding: 1rem 0 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);

    h4 {
      margin-bottom: 0.6rem;
      color: rgba($color-text-secondary, 0.75);
      font-size: 0.68rem;
    }
  }

  .lit-color-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    .lit-color-swatch {
      flex-shrink: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 0 8px 0 rgba(255, 255, 255, 0.1);
    }

  .virtue-content {
    color: $color-accent-gold-light;
    font-family: $font-family-serif;
      font-size: 1.65rem;
      line-height: 1.15;
      margin: 0;
    }
  }

  .prayer-text {
    font-style: italic;
  }

  .action-text {
    font-weight: 500;
  }
}

.right-panel {
  .action-bar {
    margin-top: auto;
    padding-top: 1.25rem;
    display: flex;
    gap: 0.75rem;

    .action-btn {
      flex: 1;
      padding: 0.6rem 1rem;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.08);
      color: $color-text-primary;
      font-family: $font-family-sans;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.14);
        border-color: $color-accent-gold;
        color: $color-accent-gold-light;
      }

      &.saved {
        background: rgba($color-accent-gold, 0.2);
        border-color: rgba($color-accent-gold, 0.6);
        color: $color-accent-gold-light;
      }
    }
  }
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1rem;

  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.1);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border-left-color: $color-accent-gold;
    animation: spin 1s linear infinite;
    display: inline-block;
  }

  p {
    font-style: italic;
    color: $color-text-secondary;
  }
}

@media (max-width: 1100px) {
  .dashboard {
    grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
    gap: 1rem;

    .panel {
      padding: 1.25rem;
    }

    &.primary-focus {
      padding: 1.5rem;

      .scripture-card {
        padding: 2rem 1.5rem;
      }

      blockquote {
        font-size: clamp(1.6rem, 4vw, 2.75rem);
      }
    }
  }
}

@media (max-width: 760px) {
  .home-view,
  .dashboard {
    min-height: auto;
  }

  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: visible;

    .panel,
    &.primary-focus {
      width: 100%;
      padding: 1.25rem;
    }

    .scripture-card {
      padding: 1.75rem 1rem;
    }

    blockquote {
      font-size: clamp(1.55rem, 8vw, 2.4rem);
    }

    .context-panel,
    .reflection-panel {
      width: 100%;
    }

    .panel.primary-focus .reflection-container {
      overflow: visible;
    }
  }
}

@media (max-width: 480px) {
  .dashboard {
    .panel,
    &.primary-focus {
      padding: 1rem;
    }

    .scripture-card {
      padding: 1.5rem 0.75rem;
    }

    blockquote {
      max-width: 100%;
      font-size: 1.65rem;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>