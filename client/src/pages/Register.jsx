import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const register = async () => {

    try {

      setLoading(true);
      setError("");

      await axios.post(
  `${API_URL}/api/auth/register`,
  {
    name,
    company,
    email,
    password
  }
);

      navigate("/");

    } catch (err) {

      setError(
        err?.response?.data?.error ||
        "Registration Failed"
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
          width: 450,
          padding: 40,
          borderRadius: 20,
          background: "#0D1526",
          border: "1px solid #1E3056",
          boxShadow:
            "0 0 40px rgba(56,189,248,0.15)"
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#38BDF8"
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#94A3B8",
            marginBottom: 25
          }}
        >
          Join NexusFlow Platform
        </p>

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

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          placeholder="Company Name"
          value={company}
          onChange={(e) =>
            setCompany(e.target.value)
          }
          style={inputStyle}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
        />

        <button
          onClick={register}
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 10,
            border: "none",
            background: "#38BDF8",
            color: "#00111A",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: 10
          }}
        >
          {loading
            ? "Creating Account..."
            : "Register"}
        </button>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            color: "#94A3B8"
          }}
        >
          Already have an account?
          <Link
            to="/"
            style={{
              color: "#38BDF8",
              marginLeft: 6,
              textDecoration: "none"
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 15,
  borderRadius: 10,
  border: "1px solid #1E3056",
  background: "#111827",
  color: "white"
};