import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Asks Gemini for the reading of one day.
 * `date` is a human-readable date such as "Thu Nov 12 2026".
 */
export const generateReflection = async (date) => {
  // We check both standard and VITE_ prefixed keys to be safe
  const apiKey = process.env.GEN_AI_KEY || process.env.VITE_GEN_AI_KEY;
  if (!apiKey) throw new Error('API Key missing in Netlify environment variables');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const prompt = `
      Today's date is ${date}.
      Identify the Catholic Feast/Day, Season, and traditional Color.
      Provide the main Scripture of the day, a daily Virtue, a concrete Action Item to practice it, a 3-sentence Reflection, and a short Prayer.
      Return ONLY a JSON object:
      { "feast": "Title", "season": "SeasonName", "color": "colorname", "scripture": "Verse text", "verse_ref": "Reference", "virtue": "Word: Action", "action": "Concrete action...", "reflection": "...", "prayer": "Short prayer..." }
    `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from the response (Gemini sometimes wraps it in markdown blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response');

  return JSON.parse(jsonMatch[0]);
};
