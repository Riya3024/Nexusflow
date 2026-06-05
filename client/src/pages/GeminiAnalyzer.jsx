import { useState } from "react";
import axios from "axios";

export default function GeminiAnalyzer({ nodes, routes }) {
  const [result, setResult] = useState("");
  const [file, setFile] = useState(null);
  const [docResult, setDocResult] = useState(null);

  // =========================
  // 🔥 EXISTING (KEEP SAME)
  // =========================
  const analyze = async () => {
    const res = await axios.post("/api/ai/analyze", {
      nodes,
      routes
    });

    setResult(res.data.data);
  };

  // =========================
  // 🔥 NEW: DOCUMENT ANALYZER
  // =========================
  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const analyzeDocument = async () => {
    if (!file) return alert("Upload a file first");

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];

      const res = await axios.post("/api/analyze-doc", {
        file: base64
      });

      setDocResult(res.data.data);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 20 }}>

      {/* ================= EXISTING ================= */}
      <h2>🤖 AI Supply Chain Analyzer</h2>

      <button onClick={analyze}>
        Run Network AI Analysis
      </button>

      <pre style={{
        marginTop: 20,
        whiteSpace: "pre-wrap",
        color: "#CBD5F5"
      }}>
        {result}
      </pre>

      <hr style={{ margin: "30px 0" }} />

      {/* ================= NEW FEATURE ================= */}
      <h2>📄 Gemini Document Analyzer</h2>

      <input type="file" onChange={handleFileUpload} />

      <button onClick={analyzeDocument} style={{ marginLeft: 10 }}>
        Analyze Document
      </button>

      {/* 🔥 Structured Output */}
      {docResult && (
        <div style={{
          marginTop: 20,
          background: "#070B14",
          padding: 15,
          border: "1px solid #1E3056",
          borderRadius: 8
        }}>

          <h4 style={{ color: "#F87171" }}>⚠ Risks</h4>
          <ul>
            {docResult.risks?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <h4 style={{ color: "#FACC15" }}>⏱ Delays</h4>
          <ul>
            {docResult.delays?.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>

          <h4 style={{ color: "#34D399" }}>✅ Recommendations</h4>
          <ul>
            {docResult.recommendations?.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>

        </div>
      )}
    </div>
  );
}