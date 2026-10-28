<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { supabase, dateKey, dateFromKey } from '../supabase';
import { liturgicalField } from '../liturgicalColors';
import PageLoader from '../components/PageLoader.vue';

// The thirty mornings before today, newest first
const DAYS_KEPT = 30;

const readings = ref([]);
const loading = ref(true);
const failed = ref(false);

// The loader covers the page until the list and its fonts are ready, as on the reading
const ready = ref(false);

const formatDay = (key) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(
    dateFromKey(key)
  );

// The opening of the verse, cut at a word so it reads as a phrase
const opening = (text = '') => {
  const clean = text.trim().replace(/^["“'‘]+|["”'’]+$/g, '');
  if (clean.length <= 120) return clean;
  return `${clean.slice(0, clean.lastIndexOf(' ', 120))}…`;
};

const loadReadings = async () => {
  const today = new Date();
  const earliest = new Date(today.getFullYear(), today.getMonth(), today.getDate() - DAYS_KEPT);

  const { data, error } = await supabase
    .from('daily_reflections')
    .select(
      'date_key, feast:content->>feast, season:content->>season, color:content->>color, verse_ref:content->>verse_ref, scripture:content->>scripture'
    )
    .gte('date_key', dateKey(earliest))
    .lt('date_key', dateKey(today))
    .order('date_key', { ascending: false });

  if (error) {
    console.error('Could not load past readings:', error);
    failed.value = true;
  } else {
    readings.value = data.map((row) => ({
      date: row.date_key,
      day: formatDay(row.date_key),
      feast: row.feast,
      mark: liturgicalField(row.color, row.season),
      reference: row.verse_ref,
      opening: opening(row.scripture),
    }));
  }
  loading.value = false;
  await nextTick();
  await document.fonts?.ready;
  ready.value = true;
};

onMounted(loadReadings);
</script>

<template>
  <div class="past-view">
    <PageLoader :show="!ready" text="Gathering past readings…" />

    <section class="past-intro" aria-labelledby="past-title">
      <div class="past-inner">
        <h1 id="past-title" v-reveal>Past readings</h1>
        <p class="past-lead" v-reveal="1">
          The scripture, reflection and prayer from each of the past 30 mornings.
        </p>
      </div>
    </section>

    <section class="past-list" aria-label="Earlier days">
      <div class="past-inner">
        <ol v-if="readings.length" class="readings">
          <li v-for="reading in readings" :key="reading.date" class="reading" v-reveal>
            <router-link :to="{ name: 'day', params: { date: reading.date } }" class="reading-link">
              <span class="reading-day">
                <span class="reading-date">{{ reading.day }}</span>
                <span class="reading-feast">
                  <span
                    class="season-dot"
                    :style="{ background: reading.mark.field }"
                    :title="`Vestments: ${reading.mark.name}`"
                  ></span
                  >{{ reading.feast }}
                </span>
              </span>
              <span class="reading-words">
                <span class="reading-opening">“{{ reading.opening }}”</span>
                <cite class="reading-ref">{{ reading.reference }}</cite>
              </span>
            </router-link>
          </li>
        </ol>

        <p v-else-if="failed" class="past-status" role="status">
          Past readings could not be loaded just now. Please try again in a moment.
        </p>
        <p v-else-if="!loading" class="past-status">There are no earlier readings yet.</p>

      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '../scss/variables' as *;
@use '../scss/mixins' as *;

.past-inner {
  max-width: $content-max;
  margin-inline: auto;
}

// The intro continues the header's navy, as the scripture does on the home page
.past-intro {
  padding: clamp(3rem, 6vw, 5rem) $page-margin clamp(3.5rem, 7vw, 5.5rem);
  background: $color-navy;
  color: $color-ivory;

  h1 {
    font-family: $font-family-serif;
    font-size: clamp(2.75rem, 1rem + 4.4vw, 4.5rem);
    font-style: italic;
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: -0.015em;
  }
}

.past-lead {
  margin-top: 1.25rem;
  font-size: $step-lead;
  line-height: 1.5;
  color: $color-navy-ink-soft;
}

.past-list {
  padding: clamp(3rem, 6vw, 5rem) $page-margin clamp(4.5rem, 8vw, 7rem);
  background: $color-stone;
  color: $color-text-primary;
}

.readings {
  margin: 0;
  padding: 0;
  list-style: none;
}

// Each day is a row of the page grid: the date and feast on the left, the verse on the right
.reading-link {
  @include page-grid;
  align-items: baseline;
  padding-block: clamp(1.75rem, 3vw, 2.5rem);
  color: inherit;
  font-weight: 400;
  text-decoration: none;

  &:hover .reading-opening,
  &:focus-visible .reading-opening {
    text-decoration: underline;
    text-decoration-thickness: 0.06em;
    text-underline-offset: 0.18em;
  }
}

.reading-day {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reading-date {
  font-size: $step-lead;
  font-weight: 500;
}

.reading-feast {
  font-size: $step-body;
  color: $color-stone-ink-soft;
  text-wrap: balance;
}

.season-dot {
  display: inline-block;
  width: 0.625rem;
  height: 0.625rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  vertical-align: 0.05em;
}

.reading-words {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reading-opening {
  max-width: 34em;
  font-family: $font-family-serif;
  font-size: clamp(1.5rem, 1.1rem + 0.9vw, 1.875rem);
  font-style: italic;
  font-weight: 500;
  line-height: 1.3;
}

// The reference as on the reading itself: gold, italic capitals behind a quotation dash
.reading-ref {
  color: $color-accent-gold-dark;
  font-size: 0.9375rem;
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &::before {
    content: '\2015\00a0';
  }
}

.past-status {
  font-size: $step-lead;
  color: $color-stone-ink-soft;
}
</style>
