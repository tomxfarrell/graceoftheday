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
  };
  litColor.value = colorMap[data.color?.toLowerCase()] || '#808080';
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
    if (!dayData.value)
      dayData.value = { title: 'Daily Reflection', season: 'Ordinary Time' };
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

const handleShare = async () => {
  const text = `${dayData.value.title}\n\n"${aiResponse.value.scripture}"\n— ${aiResponse.value.verse_ref}\n\nReflection: ${aiResponse.value.reflection}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Grace of the Day',
        text: text,
        url: window.location.href,
      });
    } catch (err) {
      // User cancelled share
    }
  } else {
    await navigator.clipboard.writeText(text);
    alert('Reflection copied to clipboard!');
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner"></div>
    <p>Loading today's grace...</p>
  </div>

  <ContentCard v-else :border-color="litColor">
    <button
      @click="handleShare"
      class="share-btn-corner"
      :style="{ color: litColor, borderColor: litColor + '40' }"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
      </svg>
      <span>Share</span>
    </button>

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
        <span class="virtue-content">{{ aiResponse.virtue }}</span>
      </div>
    </div>
  </ContentCard>
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

  h3 {
    text-align: center;
    font-size: 1.6rem;
    color: #2c3e50;
    margin-bottom: 0.75rem;
  }

  &.scripture-box {
    padding: 1rem;
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
  margin-top: 2.5rem;
  opacity: 0;
  animation: fadeIn 0.8s ease forwards 0.7s;

  .virtue-content {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1.3rem;
  }
}

.share-btn-corner {
  position: relative;
  margin: 0 auto 20px;
  background: transparent;
  border: 1px solid;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 600;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
}

@media (min-width: 768px) {
  .share-btn-corner {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    margin: 0;
  }
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
