import { createClient } from '@supabase/supabase-js';

// These are loaded from .env file for local dev, and from Netlify environment variables in production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Readings are stored under the reader's local date, as YYYY-MM-DD
export const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// A YYYY-MM-DD key back into a local date
export const dateFromKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};
