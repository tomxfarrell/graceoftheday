<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue';
import { supabase, dateKey, dateFromKey } from '../supabase';
import { liturgicalField } from '../liturgicalColors';
import { currentFeast, liturgicalSeason, todaysVerse } from '../liturgicalSeason';
import { getEaster } from '../liturgicalCalendar';
import { prefersReducedMotion } from '../reveal';

// Today when the address is the home page; a past day at /day/YYYY-MM-DD
const props = defineProps({
  date: { type: String, default: '' },
});

const viewDate = computed(() => (props.date ? dateFromKey(props.date) : new Date()));
const isToday = computed(() => dateKey(viewDate.value) === dateKey(new Date()));

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

// The chapters, in reading order, with the ground and ink the page takes in each
const CHAPTERS = [
  { id: 'scripture', label: 'Scripture' },
  { id: 'reflection', label: 'Spiritual Reflection' },
  { id: 'prayer', label: 'Daily Prayer' },
  { id: 'virtue', label: "Today's Virtue" },
  { id: 'action', label: 'Faith in Action' },
];

const INK = '#1d1d1f';
const IVORY = '#f5f0e6';

// --- Helpers ---

const stripQuotes = (text = '') => text.trim().replace(/^["“'‘]+|["”'’]+$/g, '');

// --- Computed Properties ---
const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(viewDate.value);
});

const season = computed(
  () => dayData.value?.season || getFallbackSeason(viewDate.value).name
);

const liturgical = computed(() => liturgicalField(dayData.value?.color, season.value));

// The liturgical day named beside the reflection: the feast or weekday title when
// there is one, otherwise the season (as on the error fallback)
const dayName = computed(() => {
  const title = dayData.value?.title;
  return title && title !== 'Daily Reflection' ? title : season.value;
});

// Long verses step down so the whole passage fits on the first screen
const verseSize = computed(() => {
  const length = aiResponse.value.scripture.length;
  if (length <= 140) return 'verse--short';
  if (length <= 320) return 'verse--medium';
  return 'verse--long';
});

// "Hope: Trusting in God's quiet growth" becomes a large word and its line
const virtueParts = computed(() => {
  const [word, ...rest] = (aiResponse.value.virtue || '').split(':');
  return { word: word.trim(), rest: rest.join(':').trim() };
});

// --- Each chapter keeps its own ground; only the index marks follow the reader ---
const activeChapter = ref('scripture');

// The marks sit over every chapter, so they take the ink of the one being read
const indexInk = computed(
  () => (['scripture', 'prayer', 'footer'].includes(activeChapter.value) ? IVORY : INK)
);

// A chapter is active while it crosses the middle of the screen
let chapterObserver;
const watchChapters = () => {
  chapterObserver?.disconnect();
  chapterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeChapter.value = entry.target.dataset.chapter;
      });
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );
  document.querySelectorAll('[data-chapter]').forEach((el) => chapterObserver.observe(el));
};

const goToChapter = (id) => {
  document
    .querySelector(`[data-chapter="${id}"]`)
    ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
};

onBeforeUnmount(() => {
  chapterObserver?.disconnect();
});

// --- The verse arrives one line at a time ---
const verseEl = ref(null);
const verseLines = ref(0);
const verseState = ref(''); // '' | 'is-measuring' | 'is-arriving'
const verseWords = computed(() => `“${aiResponse.value.scripture}”`.split(/\s+/));

// Group the words into the lines the browser wrapped them onto, then let each line rise in turn
const arriveVerse = async () => {
  if (prefersReducedMotion()) return;
  verseState.value = 'is-measuring';
  await nextTick();
  await document.fonts?.ready;
  const tops = [];
  verseEl.value?.querySelectorAll('.verse-word').forEach((word) => {
    let line = tops.indexOf(word.offsetTop);
    if (line === -1) line = tops.push(word.offsetTop) - 1;
    word.style.setProperty('--line', line);
  });
  verseLines.value = tops.length;
  verseState.value = 'is-arriving';
};

watch(loading, async (isLoading) => {
  if (isLoading) return;
  arriveVerse();
  await nextTick();
  watchChapters();
});

// --- Methods ---

/**
 * Helper to map the JSON data to our reactive state
 */
const applyData = (data) => {
  dayData.value = { title: data.feast, season: data.season, color: data.color };
  currentFeast.value = data.feast;
  liturgicalSeason.value = data.season;
  aiResponse.value = {
    virtue: data.virtue,
    reflection: data.reflection,
    scripture: stripQuotes(data.scripture),
    verse_ref: data.verse_ref,
    prayer: data.prayer,
    action: data.action,
  };
  todaysVerse.value = {
    text: aiResponse.value.scripture,
    reference: data.verse_ref,
  };
};

/**
 * Determine the liturgical season client-side for fallback purposes.
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
  const todayKey = dateKey(viewDate.value);

  try {
    // 1. Check if the community has already generated this day's data
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

    // A past day is only ever read from the cache; readings are generated for today alone
    if (!isToday.value) throw new Error(`No reading was kept for ${todayKey}.`);

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
      const fallback = getFallbackSeason(viewDate.value);
      dayData.value = { title: 'Daily Reflection', season: fallback.name };
      currentFeast.value = '';
    }
    aiResponse.value = {
      virtue: 'Patience',
      reflection: isToday.value
        ? 'We are momentarily unable to retrieve the daily reading. Please check back in a moment.'
        : 'No reading was kept for this day. You can find today\'s reading on the home page.',
      scripture: 'Be still, and know that I am God.',
      verse_ref: 'Psalm 46:10',
      prayer: 'Lord, grant us peace.',
      action: 'Take a moment of silence.',
    };
    todaysVerse.value = {
      text: aiResponse.value.scripture,
      reference: aiResponse.value.verse_ref,
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
  <div class="home-view" :class="{ 'is-loading': loading }">
    <!-- Scripture: the first chapter, and the one large moment -->
    <section
      class="chapter chapter--navy chapter--scripture"
      :class="verseState"
      :style="{ '--lines': verseLines }"
      data-chapter="scripture"
      aria-labelledby="day-title"
    >
      <div class="chapter-inner">
        <!-- The chapter's name, like the others: what this is, and for which day -->
        <h1 id="day-title" class="scripture-title" v-reveal>
          {{ isToday ? "Today's Scripture" : 'Scripture' }}<span class="scripture-date">{{
            formattedDate
          }}</span>
        </h1>
        <template v-if="!loading">
          <!-- Each word is a span so the verse can arrive one line at a time -->
          <blockquote ref="verseEl" class="verse" :class="verseSize">
            <template v-for="(word, i) in verseWords" :key="i"
              ><span class="verse-word">{{ word }}</span>{{ ' ' }}</template
            >
          </blockquote>
          <p class="verse-ref">
            <cite>{{ aiResponse.verse_ref }}</cite>
          </p>
        </template>
        <p v-else class="verse-waiting" role="status">Preparing today's reading…</p>
      </div>
    </section>

    <template v-if="!loading">
      <section
        class="chapter chapter--stone"
        data-chapter="reflection"
        aria-labelledby="reflection-title"
      >
        <div class="chapter-inner row">
          <div class="row-label">
            <h2 id="reflection-title" v-reveal>Spiritual Reflection</h2>
            <p class="row-note" v-reveal="1">
              <span
                class="season-dot"
                :style="{ background: liturgical.field }"
                :title="`Vestments: ${liturgical.name}`"
              ></span
              >{{ dayName }}
            </p>
          </div>
          <p class="reflection-text" v-reveal="2">{{ aiResponse.reflection }}</p>
        </div>
      </section>

      <section
        class="chapter chapter--navy"
        data-chapter="prayer"
        aria-labelledby="prayer-title"
      >
        <div class="chapter-inner row">
          <div class="row-label">
            <h2 id="prayer-title" v-reveal>Daily Prayer</h2>
          </div>
          <p class="prayer-text" v-reveal="1">{{ aiResponse.prayer }}</p>
        </div>
      </section>

      <section class="chapter chapter--white" data-chapter="virtue" aria-labelledby="virtue-title">
        <div class="chapter-inner row">
          <div class="row-label">
            <h2 id="virtue-title" v-reveal>Today's Virtue</h2>
          </div>
          <div>
            <p class="virtue-word" v-reveal="1">{{ virtueParts.word }}</p>
            <p v-if="virtueParts.rest" class="virtue-rest" v-reveal="2">{{ virtueParts.rest }}</p>
          </div>
        </div>
      </section>

      <section
        class="chapter chapter--stone"
        data-chapter="action"
        aria-labelledby="action-title"
      >
        <div class="chapter-inner row">
          <div class="row-label">
            <h2 id="action-title" v-reveal>Faith in Action</h2>
          </div>
          <p class="action-text" v-reveal="1">{{ aiResponse.action }}</p>
        </div>
      </section>

      <!-- Where you are in the morning's reading; each mark jumps to its chapter -->
      <nav class="chapter-index" :style="{ '--index-ink': indexInk }" aria-label="Chapters">
        <button
          v-for="chapter in CHAPTERS"
          :key="chapter.id"
          type="button"
          class="chapter-mark"
          :class="{ 'is-active': chapter.id === activeChapter }"
          :aria-label="chapter.label"
          :title="chapter.label"
          :aria-current="chapter.id === activeChapter ? 'true' : undefined"
          @click="goToChapter(chapter.id)"
        ></button>
      </nav>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use '../scss/variables' as *;
@use '../scss/mixins' as *;

// --- Chapters: each part of the morning in its own space, on its own colour ---
.chapter {
  --highlight: #{$color-accent-gold-dark};
  --ink-soft: #{$color-stone-ink-soft};
  padding: clamp(4.5rem, 8vw, 7rem) $page-margin;
  color: var(--chapter-ink, #{$color-text-primary});
}

// The brand's navy holds the two quiet moments: the page opens on it before dawn,
// and the prayer returns to it, so the page alternates dark and light
.chapter--navy {
  --chapter-ink: #{$color-ivory};
  --ink-soft: #{$color-navy-ink-soft};
  --highlight: #{$color-accent-gold};
  background: $color-navy;
}

.chapter--scripture {
  padding-top: clamp(3.5rem, 7vw, 6rem);
  padding-bottom: clamp(6rem, 11vw, 9rem);
}

.chapter--stone {
  background: $color-stone;
}

.chapter--white {
  background: $color-canvas;
}

.chapter-inner {
  width: 100%;
  max-width: $content-max;
  margin-inline: auto;
}

// Every chapter after the first: its name in the narrow column, its words in the wide one
.row {
  @include page-grid;
  align-items: baseline;
}

.row-label h2 {
  font-size: $step-label;
  line-height: 1.15;
}

.row-note {
  margin-top: 0.75rem;
  text-wrap: balance;
  font-size: $step-body;
  color: var(--ink-soft);
}

// The day's vestment colour, a small mark that stays with the feast's first word
.season-dot {
  display: inline-block;
  width: 0.625rem;
  height: 0.625rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  vertical-align: 0.05em;
}

// --- Scripture ---
// Named like every other chapter: plain sans, sentence case, the date in the softer ink
.scripture-title {
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
  font-family: $font-family-sans;
  font-size: $step-lead;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0;
}

.scripture-date {
  font-weight: 400;
  color: var(--ink-soft);

  &::before {
    content: ' · ';
  }

  // On a narrow phone the date takes its own line instead of trailing a dot
  @media (max-width: 559px) {
    display: block;

    &::before {
      content: none;
    }
  }
}

.verse {
  font-family: $font-family-serif;
  font-style: italic;
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.015em;
  // Avoids a lonely last word while still filling the width
  text-wrap: pretty;

  // The opening quotation mark hangs into the margin, so the letters align with the
  // title above; only where the margin is wide enough to hold it
  @media (min-width: 640px) {
    text-indent: -0.42em;
  }

  &.verse--short {
    font-size: clamp(2.75rem, 0.5rem + 6.5vw, 7.5rem);
  }

  &.verse--medium {
    font-size: clamp(2.125rem, 0.25rem + 4.4vw, 4.5rem);
  }

  &.verse--long {
    font-size: clamp(1.875rem, 0.5rem + 3vw, 3.5rem);
  }
}

// The reference as on the original site: gold, italic capitals behind a quotation dash
.verse-ref {
  margin-top: 2rem;

  cite {
    color: var(--highlight, #{$color-accent-gold-dark});
    font-size: 0.9375rem;
    font-style: italic;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    &::before {
      content: '\2015\00a0';
    }
  }
}

.verse-waiting {
  font-size: $step-lead;
  font-style: italic;
  font-weight: 500;
  color: var(--ink-soft);
}

// The verse arrives one line at a time (only when motion is allowed)
.verse-word {
  display: inline-block;
  // Each word is its own box, so it must not inherit the verse's hanging indent
  text-indent: 0;
}

.chapter--scripture.is-measuring {
  .verse-word,
  .verse-ref {
    opacity: 0;
  }
}

.chapter--scripture.is-arriving {
  .verse-word {
    animation: line-rise 1.2s $ease-out both;
    animation-delay: calc(var(--line, 0) * 150ms + 150ms);
  }

  .verse-ref {
    animation: line-rise 1.2s $ease-out both;
    animation-delay: calc(var(--lines, 0) * 150ms + 300ms);
  }
}

@keyframes line-rise {
  from {
    opacity: 0;
    transform: translateY(0.35em);
  }
}

// --- Reflection: set for reading, at a generous size ---
.reflection-text {
  max-width: 34em;
  font-size: 1.5rem;
  line-height: 1.6;
}

// --- Prayer: in the serif, on the colour of the day ---
.prayer-text {
  max-width: 24ch;
  font-family: $font-family-serif;
  font-size: $step-heading;
  font-style: italic;
  font-weight: 500;
  line-height: 1.25;
}

// --- Virtue: one word in gold ---
.virtue-word {
  font-family: $font-family-serif;
  font-size: clamp(4rem, 1.5rem + 8vw, 10rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--highlight);
  overflow-wrap: anywhere;
}

// As the word comes into view, light passes across it from left to right, like a shine
// on gilt, and passes again every six seconds. The page's one gradient, confined to the
// pass: between passes the word rests in solid gold, and keeps it wherever the motion or
// the text clip isn't available.
@supports ((-webkit-background-clip: text) or (background-clip: text)) { // taste-skill-ignore: the gilt shine
  @include motion-ok {
    .virtue-word.is-revealed {
      background: linear-gradient(105deg, #{$color-accent-gold-dark} 0 42%, #{$color-gilt-shine} 50%, #{$color-accent-gold-dark} 58% 100%); // taste-skill-ignore: the gilt shine
      background-size: 300% 100%;
      background-position: 100% 0;
      -webkit-background-clip: text; // taste-skill-ignore: the gilt shine
      background-clip: text; // taste-skill-ignore: the gilt shine
      color: transparent;
      animation: gilt-shine 6s ease-in-out 0.7s infinite both;
    }
  }
}

// The pass takes the first 1.8 seconds of each six; the word rests in gold for the rest.
// The pass begins and ends on solid gold, so the loop restarts without a visible jump.
@keyframes gilt-shine {
  0% {
    background-position: 100% 0;
  }

  30%,
  100% {
    background-position: 0 0;
  }
}

.virtue-rest {
  margin-top: 1.5rem;
  max-width: 26em;
  font-size: 1.5rem;
  line-height: 1.5;
  color: var(--ink-soft);
}

// --- Action: one plain instruction for the day, set large ---
.action-text {
  max-width: 24em;
  font-size: $step-label;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

// --- The chapter index: a column of marks at the right edge, desktop only ---
.chapter-index {
  display: none;

  @include wide {
    position: fixed;
    top: 50%;
    right: clamp(1rem, 2vw, 2rem);
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    transform: translateY(-50%);
  }
}

.chapter-mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;

  // The mark itself: a short bar that lengthens for the chapter being read
  &::before {
    content: '';
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 9999px;
    background: var(--index-ink);
    opacity: 0.3;
    transition:
      height 0.4s $ease-out,
      opacity 0.4s ease,
      background-color 0.4s ease;
  }

  &.is-active::before {
    height: 1.5rem;
    opacity: 1;
  }

  &:hover::before {
    opacity: 0.7;
  }
}

</style>
