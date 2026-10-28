// Liturgical vestment colors. White is shown as gold so it stays visible on parchment.
export const LITURGICAL_COLORS = {
  green: { name: 'Green', hex: '#3f6f4f' },
  violet: { name: 'Violet', hex: '#5e3f86' },
  rose: { name: 'Rose', hex: '#b5577a' },
  red: { name: 'Red', hex: '#a23232' },
  white: { name: 'White', hex: '#a8822f' },
  black: { name: 'Black', hex: '#3a3631' },
};

/**
 * Calculates the date of Easter for a given year using the Meeus/Jones/Butcher algorithm.
 * @param {number} year The year to calculate Easter for.
 * @returns {Date} The date of Easter.
 */
export const getEaster = (year) => {
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
