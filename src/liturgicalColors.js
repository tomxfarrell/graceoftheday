// The colour of the day's vestments, shown as a small mark beside the feast's name.
// White days are marked in gold, as white vestments are often trimmed, so the mark shows.
export const LITURGICAL_FIELDS = {
  green: { name: 'green', field: '#2f5a3f' },
  violet: { name: 'violet', field: '#4a336b' },
  rose: { name: 'rose', field: '#8e4462' },
  red: { name: 'red', field: '#832828' },
  white: { name: 'white', field: '#c9a96e' },
  black: { name: 'black', field: '#2a2724' },
};

export const seasonKey = (season = '') => {
  const s = season.toLowerCase();
  if (s.includes('advent') || s.includes('gaudete')) return 'advent';
  if (s.includes('christmas') || s.includes('epiphany')) return 'christmas';
  if (
    ['lent', 'laetare', 'holy week', 'palm', 'triduum', 'passion'].some((w) =>
      s.includes(w)
    )
  )
    return 'lent';
  if (s.includes('easter') || s.includes('pentecost')) return 'easter';
  return 'ordinary';
};

// The day's colour as the reading names it, or the season's usual colour when it doesn't
export const colorKey = (color = '', season = '') => {
  const c = color.toLowerCase();
  const aliases = { purple: 'violet', pink: 'rose', gold: 'white' };
  const named = Object.keys({ ...LITURGICAL_FIELDS, ...aliases }).find((k) =>
    c.includes(k)
  );
  if (named) return aliases[named] || named;

  const s = season.toLowerCase();
  if (s.includes('gaudete') || s.includes('laetare')) return 'rose';
  if (['palm', 'triduum', 'pentecost'].some((w) => s.includes(w))) return 'red';
  return { advent: 'violet', lent: 'violet', christmas: 'white', easter: 'white' }[
    seasonKey(season)
  ] || 'green';
};

export const liturgicalField = (color, season) => LITURGICAL_FIELDS[colorKey(color, season)];
