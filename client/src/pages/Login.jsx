import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
  `${API_URL}/api/auth/login`,
  {
    email,
    password
  }
);

      localStorage.setItem("token", res.data.token);

localStorage.setItem(
  "user",
  JSON.stringify(res.data.user)
);

navigate("/dashboard/planner");

    } catch (err) {
      setError(
        err?.response?.data?.error ||
        "Invalid Email or Password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#050816,#081120,#0B1324)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <div
        style={{
          width: 420,
          padding: 40,
          borderRadius: 20,
          background: "#0D1526",
          border: "1px solid #1E3056",
          boxShadow:
            "0 0 40px rgba(56,189,248,0.15)"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              color: "#38BDF8",
              marginBottom: 5
            }}
          >
            NexusFlow
          </h1>

          <p
            style={{
              color: "#94A3B8",
              marginBottom: 30
            }}
          >
            AI-Powered Supply Chain Intelligence
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#3F1D1D",
              color: "#F87171",
              padding: 12,
              borderRadius: 8,
              marginBottom: 15
            }}
          >
            {error}
          </div>
        )}

        <label
          style={{
            color: "#CBD5E1",
            fontSize: 14
          }}
        >
          Email
        </label>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            marginBottom: 15,
            borderRadius: 10,
            border: "1px solid #1E3056",
            background: "#111827",
            color: "white"
          }}
        />

        <label
          style={{
            color: "#CBD5E1",
            fontSize: 14
          }}
        >
          Password
        </label>

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            marginBottom: 20,
            borderRadius: 10,
            border: "1px solid #1E3056",
            background: "#111827",
            color: "white"
          }}
        />

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "#38BDF8",
            color: "#00111A",
            fontWeight: "bold",
            fontSize: 16
          }}
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "#94A3B8"
          }}
        >
          Don't have an account?
          <Link
            to="/register"
            style={{
              color: "#38BDF8",
              marginLeft: 6,
              textDecoration: "none"
            }}
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}