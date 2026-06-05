import { useState, useEffect } from "react";
import axios from "axios";

export default function AskAI() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayText, setDisplayText] = useState(""); // 🔥 typewriter
  const [loading, setLoading] = useState(false);

  // =========================
  // 🔥 TYPEWRITER EFFECT
  // =========================
  useEffect(() => {
    if (!answer) return;

    let i = 0;
    setDisplayText("");

    const interval = setInterval(() => {
      setDisplayText(answer.slice(0, i));
      i++;

      if (i > answer.length) {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [answer]);

  // =========================
  // 🔥 ASK AI
  // =========================
  const askAI = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setAnswer(""); // reset old answer

      const res = await axios.post("/api/query", {
        question
      });

      setAnswer(res.data.data || "No response");

    } catch (err) {
      console.error(err);
      setAnswer("AI failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ color: "#38BDF8" }}>🤖 AI Assistant</h3>

      {/* INPUT */}
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about routes, risks, delays..."
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 10,
          background: "#070B14",
          border: "1px solid #1E3056",
          color: "white",
          borderRadius: 6
        }}
      />

      {/* BUTTON */}
      <button
        onClick={askAI}
        style={{
          width: "100%",
          padding: 8,
          background: "#38BDF8",
          border: "none",
          cursor: "pointer",
          marginBottom: 10,
          borderRadius: 6,
          fontWeight: "bold"
        }}
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {/* ANSWER BOX */}
      <div style={{
        color: "#E2E8F0",
        fontSize: 14,
        minHeight: 80,
        background: "#070B14",
        border: "1px solid #1E3056",
        padding: 10,
        borderRadius: 8,
        lineHeight: 1.6
      }}>
        {loading && "Analyzing system state..."}
        {!loading && displayText}
      </div>
    </div>
  );
}