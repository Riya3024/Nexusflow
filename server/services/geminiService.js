const fetch = require("node-fetch");

// ==========================
// 🔥 MAIN GEMINI CALL
// ==========================
async function callGemini(prompt, retries = 3) {
  try {

    // 🔥 ADD TIMEOUT (production safe)
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        signal: controller.signal, // ✅ ADDED
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("🔍 GEMINI RAW:", JSON.stringify(data, null, 2));

    // ❌ API ERROR
    if (data.error) {

      if (data.error.code === 503 && retries > 0) {
        console.log(`🔁 Retrying Gemini... (${retries})`);
        await sleep(1000);
        return callGemini(prompt, retries - 1);
      }

      console.error("❌ GEMINI API ERROR:", data.error.message);
      return "AI service unavailable";
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "AI could not generate response";

  } catch (error) {
    console.error("❌ GEMINI FETCH ERROR:", error);
    return "AI failed due to network issue";
  }
}

// ==========================
// 🧠 ROUTE OPTIMIZER
// ==========================
async function getRouteAlternatives(route, nodes) {

  const prompt = `
You are a logistics AI.

Given:

1. Current Best Route:
${JSON.stringify(route)}

2. Node Risk Data:
${JSON.stringify(nodes)}

TASK:
- Suggest 3 better alternative routes
- Minimize risk
- Explain tradeoffs

Return STRICT JSON:

[
  {
    "rank": 1,
    "path": ["A","B","C"],
    "risk": 30,
    "time": "fast",
    "reason": "Avoids high congestion zone"
  }
]
`;

  const raw = await callGemini(prompt);
  const parsed = safeJsonParse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

// ==========================
// 🔥 CASCADE SIMULATOR
// ==========================
async function getCascadeAnalysis(node, nodes) {

  const prompt = `
Return ONLY valid JSON.
No text. No explanation. No markdown.

Format:
[
  {
    "rank": 1,
    "path": ["A","B","C"],
    "risk": 30,
    "time": "fast",
    "reason": "Avoids congestion"
  }
]

Current Route:
${JSON.stringify(route)}

Nodes:
${JSON.stringify(nodes)}
`;

  const ai = await callGemini(prompt);

  // 🔥 HANDLE ALL FAIL CASES
  if (
    !ai ||
    ai.includes("unavailable") ||
    ai.includes("Quota") ||
    ai.includes("429")
  ) {
    console.log("⚠️ Using fallback cascade");
    return fallbackCascade(node, nodes);
  }

  return safeJsonParse(ai);
}


// ==========================
// 💬 NATURAL LANGUAGE QUERY
// ==========================
async function askGemini(question, systemState) {

  // ✅ FIX: CORRECT PROMPT (WAS WRONG)
  const prompt = `
You are a logistics AI.

Given this safest route from Dijkstra:
${JSON.stringify(route)}

And node risk data:
${JSON.stringify(nodes)}

Generate 3 better alternative routes.

Rules:
- Minimize risk
- Avoid congestion
- Provide different paths

Return STRICT JSON:

[
  {
    "rank": 1,
    "path": ["node1","node2","node3"],
    "newRiskScore": 40,
    "reason": "Avoids congestion at hub X"
  }
]
`;

  const ai = await callGemini(prompt);

if (!ai || ai.includes("unavailable")) {
  return fallbackCascade(node, nodes);
}

return safeJsonParse(ai);
}

// ==========================
// 🛠 SAFE JSON PARSER
// ==========================
function safeJsonParse(text) {
  try {
    if (!text || typeof text !== "string") return null;

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return parsed;

  } catch (err) {
    console.error("❌ JSON PARSE ERROR:", text);

    // 🔥 IMPORTANT: return EMPTY ARRAY for routes
    return [];
  }
}
    
// ==========================
// 🔥 FALLBACK ENGINE
// ==========================
function fallbackCascade(node, nodes) {
  const affected = nodes
    .filter(n => n.region === node.region)
    .map(n => n.name);

  return {
    affectedPorts: affected,
    reason: [
      "Regional congestion",
      "Route disruption",
      "Traffic overload"
    ]
  };
}

// ==========================
// 🔥 HELPER
// ==========================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================
// EXPORTS
// ==========================
module.exports = {
  callGemini,
  getRouteAlternatives,
  getCascadeAnalysis,
  askGemini
};