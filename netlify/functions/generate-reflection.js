const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Parse the date sent from the frontend
    const { date } = JSON.parse(event.body);

    // Initialize Gemini AI
    // We check both standard and VITE_ prefixed keys to be safe
    const apiKey = process.env.GEN_AI_KEY || process.env.VITE_GEN_AI_KEY;
    
    if (!apiKey) {
      console.error("API Key missing in Netlify environment variables");
      return { statusCode: 500, body: JSON.stringify({ error: "Server Configuration Error" }) };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // The prompt logic moved from HomeView.vue
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
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    };

  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
