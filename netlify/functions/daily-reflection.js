import { generateReflection } from '../lib/reflection.js';

// Runs on a schedule (see netlify.toml). Each run makes sure a reading is stored for
// tomorrow, today and every day shown on the past readings page, so a day with no
// visitors leaves no gap. The database queries also keep the free Supabase project
// from being paused for inactivity.

// How far back to fill gaps; matches DAYS_KEPT in PastReadingsView.vue
const DAYS_BACK = 30;
// Scheduled functions must finish within 30 seconds, so each run writes only a few days
const MAX_PER_RUN = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

const supabaseRequest = async (path, options = {}) => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;
  if (!url || !key) throw new Error('Supabase URL or key missing in Netlify environment variables');

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  }
  return response;
};

// YYYY-MM-DD, the same key the site stores readings under
const keyOf = (date) => date.toISOString().slice(0, 10);

// "Thu Nov 12 2026", the same form the site sends to Gemini
const promptDate = (date) =>
  date
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .replace(/,/g, '');

/**
 * Days without a stored reading, most urgent first: tomorrow (already "today" for
 * readers ahead of UTC), then today, then back through the past readings window.
 */
export const findMissingDays = async (now = new Date()) => {
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const wanted = [];
  for (let offset = 1; offset >= -DAYS_BACK; offset--) {
    wanted.push(new Date(todayUtc.getTime() + offset * DAY_MS));
  }

  const response = await supabaseRequest(
    `daily_reflections?select=date_key&date_key=gte.${keyOf(wanted.at(-1))}`
  );
  const stored = new Set((await response.json()).map((row) => row.date_key));

  return wanted.filter((date) => !stored.has(keyOf(date)));
};

const storeDay = async (date) => {
  const content = await generateReflection(promptDate(date));
  await supabaseRequest('daily_reflections', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([{ date_key: keyOf(date), content }]),
  });
};

export const handler = async () => {
  try {
    const missing = await findMissingDays();
    const batch = missing.slice(0, MAX_PER_RUN);

    const results = await Promise.allSettled(batch.map(storeDay));
    results.forEach((result, index) => {
      const key = keyOf(batch[index]);
      if (result.status === 'fulfilled') console.log(`Stored reading for ${key}.`);
      else console.error(`Could not store reading for ${key}:`, result.reason);
    });

    const stored = results.filter((result) => result.status === 'fulfilled').length;
    console.log(`${stored} stored, ${missing.length - stored} still missing.`);
    return { statusCode: 200, body: 'ok' };
  } catch (error) {
    console.error('Daily reflection error:', error);
    return { statusCode: 500, body: error.message };
  }
};
