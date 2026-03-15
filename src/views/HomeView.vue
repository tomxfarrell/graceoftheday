<script setup>
import { ref, onMounted, computed } from 'vue';
import { createClient } from '@supabase/supabase-js';
import ContentCard from '../components/ContentCard.vue';

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
const litColor = ref('#808080');

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
  aiResponse.value = {
    virtue: data.virtue,
    reflection: data.reflection,
    scripture: data.scripture,
    verse_ref: data.verse_ref,
    prayer: data.prayer,
    action: data.action,
  };

  const colorMap = {
    purple: '#8e44ad',
    violet: '#8e44ad',
    white: '#f1c40f',
    red: '#c0392b',
    green: '#27ae60',
    rose: '#f9a9c4',
  };
  litColor.value = colorMap[data.color?.toLowerCase()] || '#808080';
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
 * @returns {{name: string, color: string}} The season name and color.
 */
const getFallbackSeason = (date) => {
  const today = new Date(date);
  today.setUTCHours(0, 0, 0, 0);
  const year = today.getUTCFullYear();

  const colorMap = {
    purple: '#8e44ad',
    white: '#f1c40f',
    red: '#c0392b',
    green: '#27ae60',
    rose: '#f9a9c4',
  };

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
      return { name: 'Gaudete Sunday', color: colorMap.rose };
    return { name: 'Advent', color: colorMap.purple };
  }
  if (
    (today.getUTCMonth() === 11 && today.getUTCDate() >= 25) ||
    (today.getUTCMonth() === 0 && today <= baptismOfTheLord)
  ) {
    return { name: 'Christmas', color: colorMap.white };
  }
  if (today >= ashWednesday && today < easter) {
    if (today.getTime() === laetareSunday.getTime())
      return { name: 'Laetare Sunday', color: colorMap.rose };
    if (today.getTime() === palmSunday.getTime())
      return { name: 'Palm Sunday', color: colorMap.red };
    if (today >= goodFriday && today < easter)
      return { name: 'Triduum', color: colorMap.red };
    return { name: 'Lent', color: colorMap.purple };
  }
  if (today >= easter && today <= pentecost) {
    if (today.getTime() === pentecost.getTime())
      return { name: 'Pentecost', color: colorMap.red };
    return { name: 'Easter', color: colorMap.white };
  }

  return { name: 'Ordinary Time', color: colorMap.green };
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
      litColor.value = fallback.color;
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

    <ContentCard v-else :border-color="litColor">
      <div class="spiritual-content">
        <header class="daily-header">
          <div class="meta-row">
            <span class="date">{{ formattedDate }}</span>
            <span class="separator">•</span>
            <span class="season" :style="{ color: litColor }">{{
              currentSeason.label
            }}</span>
          </div>
          <h1 class="feast-title">{{ dayData?.title }}</h1>
        </header>

        <div class="content-block scripture-box">
          <p class="scripture-text">"{{ aiResponse.scripture }}"</p>
          <cite>— {{ aiResponse.verse_ref }}</cite>
        </div>

        <hr class="divider" />

        <div class="content-block reflection-box">
          <h2>Spiritual Reflection</h2>
          <p class="reflection-text">{{ aiResponse.reflection }}</p>
        </div>

        <div v-if="aiResponse.prayer" class="content-block prayer-box">
          <h2>Daily Prayer</h2>
          <p class="prayer-text">{{ aiResponse.prayer }}</p>
        </div>

        <div v-if="aiResponse.action" class="content-block action-box">
          <h2>Faith in Action</h2>
          <p class="action-text">{{ aiResponse.action }}</p>
        </div>

        <div class="daily-virtue">
          <h2>Today's Virtue</h2>
          <span class="virtue-content" :style="{ color: litColor }">{{
            aiResponse.virtue
          }}</span>
        </div>
      </div>
    </ContentCard>
  </div>
</template>

<style lang="scss" scoped>
@use '../scss/variables' as *;

h2 {
  font-size: 0.75rem;
  color: $light-gray;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  font-weight: 600;
}

:deep(.card) {
  padding-top: 2.2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  margin-top: 5rem;
  text-align: center;
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.05);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border-left-color: $charcoal;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-bottom: 1rem;
  }
  p {
    font-style: italic;
    color: $light-gray;
  }
}

.daily-header {
  text-align: center;
  margin-bottom: 1rem;

  .meta-row {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #999;
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .feast-title {
    font-family: 'New York', 'Georgia', serif;
    font-size: 1.5rem;
    font-weight: 400;
    color: #444;
    margin: 0;
    line-height: 1.3;
  }
}

.divider {
  border: 0;
  border-top: 1px solid #f2f2f2;
  margin: 2rem 0;
}

.spiritual-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
  &:last-child {
    margin-bottom: 0;
  }
}

.content-block {
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;

  &.scripture-box {
    animation-delay: 0.4s;
    text-align: center;

    h2 {
      margin-bottom: 2.5rem;
    }

    .scripture-text {
      font-family: 'New York', 'Georgia', serif;
      font-style: italic;
      font-size: 2.2rem;
      line-height: 1.4;
      margin-bottom: 1rem;
    }
    cite {
      display: block;
      font-weight: 500;
      font-size: 1rem;
      color: $light-gray;
      margin-top: 0.5rem;
    }
  }

  &.reflection-box {
    animation-delay: 0.5s;
  }

  .reflection-text {
    line-height: 1.8;

    font-size: 1.2rem;
  }

  &.prayer-box {
    animation-delay: 0.6s;
    .prayer-text {
      font-style: italic;
      font-size: 1.15rem;
      color: $light-gray;
    }
  }

  &.action-box {
    animation-delay: 0.7s;
    .action-text {
      font-weight: 500;
      font-size: 1.1rem;
    }
  }
}

.daily-virtue {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  opacity: 0;
  animation: fadeIn 0.8s ease forwards 0.7s;

  .virtue-content {
    display: block;
    font-family: 'New York', 'Georgia', serif;
    font-size: 2rem;
    margin-top: 0.5rem;
  }
}

@media (min-width: 768px) {
  .feast-title {
    font-size: 1.8rem;
  }
  .content-block.scripture-box .scripture-text {
    font-size: 3rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
