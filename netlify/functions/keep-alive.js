// Runs on a schedule (see netlify.toml) and makes one small database query,
// so the free Supabase project always has recent activity and is not paused.
export const handler = async () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

  if (!url || !key) {
    console.error('Supabase URL or key missing in Netlify environment variables');
    return { statusCode: 500, body: 'Server Configuration Error' };
  }

  const response = await fetch(`${url}/rest/v1/daily_reflections?select=date_key&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Supabase keep-alive failed:', response.status, detail);
    return { statusCode: 502, body: 'Supabase keep-alive failed' };
  }

  console.log('Supabase keep-alive succeeded.');
  return { statusCode: 200, body: 'ok' };
};
