<script setup>
import { ref, onMounted, computed } from 'vue';
import { createClient } from '@supabase/supabase-js';

// --- State Management ---
const dayData = ref(null);
const aiResponse = ref({ virtue: '', reflection: '', scripture: '', verse_ref: '', prayer: '', action: '' });
const loading = ref(true);
const litColor = ref('#808080');

// --- Configuration ---
// These are loaded from .env file for local dev, and from Netlify environment variables in production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Computed Properties ---
const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date());
});

const currentSeason = computed(() => {
  if (!dayData.value) return { icon: "⛪", label: "Liturgical Year" };
  const icons = { 
    "Lent": "💜", 
    "Easter": "🌅", 
    "Advent": "🕯️", 
    "Christmas": "🌟", 
    "Ordinary Time": "🌿" 
  };
  return { icon: icons[dayData.value.season] || "⛪", label: dayData.value.season };
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
    action: data.action
  };

  const colorMap = { 
    'purple': '#8e44ad', 'violet': '#8e44ad', 
    'white': '#f1c40f', 'red': '#c0392b', 'green': '#27ae60' 
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
      console.error("Supabase fetch error:", fetchError);
      throw new Error(`Failed to read from cache: ${fetchError.message}. Check your table's Row Level Security policies.`);
    }

    if (existing) {
      console.log("Serving cached wisdom from Supabase.");
      applyData(existing.content);
      loading.value = false;
      return;
    }

    // 2. If no data exists, this user is the "Providential Visitor"
    console.log("First visitor of the day! Generating new reflection...");
    
    // Call our secure serverless function
    const response = await fetch('/.netlify/functions/generate-reflection', {
      method: 'POST',
      body: JSON.stringify({ date: new Date().toDateString() })
    });

    if (!response.ok) {
      throw new Error(`Netlify function failed with status: ${response.status}`);
    }
    const parsed = await response.json();

    if (parsed) {
      // 3. Save it to Supabase so the next person gets it instantly
      const { error: insertError } = await supabase
        .from('daily_reflections')
        .insert([{ date_key: todayKey, content: parsed }]);
      
      if (insertError) console.error("Could not save to Supabase:", insertError);

      applyData(parsed);
    }

  } catch (error) {
    console.error("System Error:", error);
    // Fallback in case both Supabase and Gemini are struggling
    if (!dayData.value) dayData.value = { title: "Daily Reflection", season: "Ordinary Time" };
    aiResponse.value = {
      virtue: "Patience",
      reflection: "We are momentarily unable to retrieve the daily reading. Please check back in a moment.",
      scripture: "Be still, and know that I am God.",
      verse_ref: "Psalm 46:10",
      prayer: "Lord, grant us peace.",
      action: "Take a moment of silence."
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
        title: 'Lumen Daily Reflection',
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
  <div class="liturgical-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Seeking today's grace...</p>
    </div>

    <div v-else class="liturgical-card" :style="{ borderTopColor: litColor }">
      <button 
        @click="handleShare" 
        class="share-btn-corner"
        :style="{ color: litColor, borderColor: litColor + '40' }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
        <span>Share</span>
      </button>
      <header class="card-header">
        <div class="badges-row">
          <div class="season-badge" :style="{ backgroundColor: litColor + '22' }">
            <span class="season-icon">{{ currentSeason.icon }}</span>
            <span class="season-label" :style="{ color: litColor }">{{ currentSeason.label }}</span>
          </div>
        </div>
        <h1 class="feast-title">{{ dayData?.title }}</h1>
        <p class="date-display">{{ formattedDate }}</p>
      </header>

      <hr class="divider" />

      <div class="spiritual-content">
        <div class="content-block scripture-box">
          <h3>Scripture of the Day</h3>
          <p class="scripture-text">"{{ aiResponse.scripture }}"</p>
          <cite>— {{ aiResponse.verse_ref }}</cite>
        </div>

        <div class="content-block reflection-box">
          <h3>Spiritual Reflection</h3>
          <p class="reflection-text">{{ aiResponse.reflection }}</p>
        </div>

        <div v-if="aiResponse.prayer" class="content-block prayer-box">
          <h3>Daily Prayer</h3>
          <p class="prayer-text">{{ aiResponse.prayer }}</p>
        </div>

        <div v-if="aiResponse.action" class="content-block action-box">
          <h3>Faith in Action</h3>
          <p class="action-text">{{ aiResponse.action }}</p>
        </div>

        <div class="daily-virtue">
          <span class="virtue-label">Today's Virtue</span>
          <span class="virtue-content">{{ aiResponse.virtue }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";

.liturgical-container {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;

  .loading-state {
    text-align: center;
    margin-top: 5rem;
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.05);
      width: 40px; height: 40px;
      border-radius: 50%;
      border-left-color: #2c3e50;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-bottom: 1rem;
    }
    p { font-style: italic; color: #7f8c8d; }
  }

  .liturgical-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    width: 100%;
    max-width: 1000px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-top: 6px solid #808080;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    padding: 2.5rem;
    position: relative;
    transition: border-color 0.8s ease;
    animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;

    .badges-row {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 1.2rem;

      .season-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border-radius: 50px;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .season-icon { margin-right: 8px; }
    }

    .feast-title { font-size: 1.4rem; font-weight: 600; color: #2c3e50; margin: 0.5rem 0; line-height: 1.2; }
    .date-display { color: #7f8c8d; font-size: 1.1rem; margin-bottom: 1rem; font-weight: 500; }
    .divider { border: 0; border-top: 1px solid #f2f2f2; margin: 2rem 0; }

    .spiritual-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .content-block {
      opacity: 0;
      animation: fadeIn 0.8s ease forwards;

      h3 { 
        font-size: 0.75rem; 
        color: #86868b; 
        text-transform: uppercase; 
        letter-spacing: 0.1em; 
        margin-bottom: 1rem; 
        font-weight: 600; 
      }
      
      &.scripture-box {
        /* Removed background for a cleaner, editorial look */
        padding: 0 1rem;
        animation-delay: 0.4s;
        text-align: center;
        
        .scripture-text { font-family: "New York", "Georgia", serif; font-style: italic; color: #1d1d1f; font-size: 2.2rem; line-height: 1.4; margin-bottom: 1rem; }
        cite { display: block; font-weight: 500; font-size: 1rem; color: #86868b; margin-top: 0.5rem; }
      }

      &.reflection-box {
        animation-delay: 0.5s;
      }

      .reflection-text { line-height: 1.8; color: #2c3e50; font-size: 1.2rem; }

      &.prayer-box {
        animation-delay: 0.6s;
        .prayer-text { font-family: 'Georgia', serif; font-style: italic; font-size: 1.15rem; color: #576574; }
      }

      &.action-box {
        animation-delay: 0.7s;
        .action-text { font-weight: 500; color: #2c3e50; font-size: 1.1rem; }
      }
    }

    .daily-virtue {
      text-align: center;
      margin-top: 2.5rem;
      opacity: 0;
      animation: fadeIn 0.8s ease forwards 0.7s;
      
      .virtue-label {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: #95a5a6;
        margin-bottom: 0.5rem;
      }
      .virtue-content { font-weight: 600; color: #2c3e50; font-size: 1.3rem; }
    }

    .share-btn-corner {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
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
        background: rgba(0,0,0,0.05); 
        transform: translateY(-2px);
      }
    }

    @media (min-width: 768px) {
      .feast-title { font-size: 1.8rem; }
      .content-block.scripture-box .scripture-text { font-size: 3rem; }
    }
  }
}

@keyframes spin { to { transform: rotate(360deg); } }

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>