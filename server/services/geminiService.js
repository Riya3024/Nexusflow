const fetch = require("node-fetch");

// ==========================
// 🔥 MAIN GEMINI CALL
// ==========================
async function callGemini(prompt, retries = 3) {
  try {

    // 🔥 ADD TIMEOUT (production safe)
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 45000);

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

  console.error(
    "❌ GEMINI API ERROR:",
    data.error.message
  );

  return JSON.stringify({
    affectedPorts: [
      "Dubai",
      "Singapore",
      "Rotterdam"
    ],
    reason: [
      "Fallback Mode",
      "Gemini quota exceeded"
    ]
  });
}

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "AI could not generate response";

  } catch(error){
  console.error("❌ GEMINI FETCH ERROR:", error);

  return JSON.stringify({
    affectedPorts: [],
    reason: ["Gemini unavailable"]
  });
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

  try {

    const prompt = `
You are a logistics AI.

A logistics hub has failed.

Failed Node:
${JSON.stringify(node)}

All Nodes:
${JSON.stringify(nodes)}

Return JSON:

{
  "affectedPorts": [],
  "reason": []
}
`;

    const ai = await callGemini(prompt);

    const parsed = safeJsonParse(ai);

    if (!parsed) {
      return fallbackCascade(node, nodes);
    }

    return parsed;

  } catch (err) {

    console.error("CASCADE ANALYSIS ERROR:", err);

    return fallbackCascade(node, nodes);
  }
}



  


// ==========================
// 💬 NATURAL LANGUAGE QUERY
// ==========================
async function askGemini(question, systemState) {

  const prompt = `
You are NexusFlow AI.

Current System State:
${JSON.stringify(systemState)}

User Question:
${question}

Answer clearly and briefly.
`;

  return await callGemini(prompt);
}

  // ✅ FIX: CORRECT PROMPT (WAS WRONG)

  

 

// ==========================
// 🛠 SAFE JSON PARSER
// ==========================
function safeJsonParse(text) {
  try {
    if (!text) return null;

    // Find first JSON object
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return null;
    }

    const jsonString = text.substring(start, end + 1);

    return JSON.parse(jsonString);

  } catch (err) {
    console.error("❌ JSON PARSE ERROR:", err);
    return null;
  }
}

   

    
    
// ==========================
// 🔥 FALLBACK ENGINE
// ==========================
function fallbackCascade(node, nodes) {

  if (!node || !nodes) {
    return {
      affectedPorts: [],
      reason: ["Insufficient data"]
    };
  }

  const affected = nodes
    .filter(
      n =>
        n.id !== node.id &&
        n.region === node.region
    )
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
  askGemini,
  safeJsonParse
};