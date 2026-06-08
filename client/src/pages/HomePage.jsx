import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const goGuest = () => {
  localStorage.removeItem("token");
  localStorage.setItem(
    "user",
    JSON.stringify({
      name: "Guest User",
      email: "guest@nexusflow.com",
      id: "GUEST"
    })
  );
  navigate("/dashboard/planner");
};

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.badge}>AI-Powered Logistics Platform</div>
        <h1 style={styles.title}>NexusFlow</h1>
        <p style={styles.subtitle}>
          Plan shipments smarter with live coordinates, weather risk, climate hazards,
          emissions analysis, and AI-based route recommendation across Road, Air, and Sea.
        </p>

        <div style={styles.actions}>
          <button style={styles.primaryBtn} onClick={() => navigate("/login")}>
            Login
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate("/register")}>
            Register
          </button>
          <button style={styles.guestBtn} onClick={goGuest}>
            Continue as Guest
          </button>
        </div>
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>What NexusFlow Does</h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Live Shipment Planning</h3>
            <p style={styles.cardText}>
              Enter origin and destination cities to calculate shipment distance,
              route options, time, cost, and risk in real time.
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Weather and Hazard Risk</h3>
            <p style={styles.cardText}>
              Weather, flood, and earthquake indicators help you avoid risky transport
              decisions before shipping.
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Emissions Visibility</h3>
            <p style={styles.cardText}>
              Compare fuel usage, CO2 emissions, and tonne-km values for each transport mode.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <span style={styles.stepNo}>1</span>
            <p style={styles.stepText}>Choose your origin, destination, weight, priority, and budget.</p>
          </div>
          <div style={styles.step}>
            <span style={styles.stepNo}>2</span>
            <p style={styles.stepText}>The system fetches live coordinates and calculates distance.</p>
          </div>
          <div style={styles.step}>
            <span style={styles.stepNo}>3</span>
            <p style={styles.stepText}>Weather, hazards, and emissions are evaluated for each route.</p>
          </div>
          <div style={styles.step}>
            <span style={styles.stepNo}>4</span>
            <p style={styles.stepText}>NexusFlow recommends the best mode based on cost, time, and risk.</p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Access Options</h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Login Users</h3>
            <p style={styles.cardText}>
              Get full access to shipment planning, analytics, and dashboard features.
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Registered Users</h3>
            <p style={styles.cardText}>
              Save progress, view audit history, and use the complete recommendation engine.
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Guest Users</h3>
            <p style={styles.cardText}>
              Explore the project without registration in a limited demo mode.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.footerSection}>
        <h2 style={styles.footerTitle}>Ready to explore NexusFlow?</h2>
        <p style={styles.footerText}>
          Start as a guest, or sign in to unlock the full logistics planning experience.
        </p>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050816 0%, #0f172a 100%)",
    color: "white",
    padding: "40px 20px"
  },
  hero: {
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center",
    padding: "70px 20px 50px"
  },
  badge: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "999px",
    background: "rgba(56, 189, 248, 0.12)",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    color: "#7dd3fc",
    fontSize: "14px",
    marginBottom: "18px"
  },
  title: {
    margin: 0,
    fontSize: "clamp(42px, 8vw, 72px)",
    color: "#38BDF8",
    letterSpacing: "0.5px"
  },
  subtitle: {
    maxWidth: "820px",
    margin: "18px auto 0",
    fontSize: "18px",
    lineHeight: "1.8",
    color: "#cbd5e1"
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "30px"
  },
  primaryBtn: {
    background: "#38BDF8",
    color: "#03111f",
    border: "none",
    padding: "14px 22px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  secondaryBtn: {
    background: "transparent",
    color: "#ffffff",
    border: "1px solid #38BDF8",
    padding: "14px 22px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  guestBtn: {
    background: "#1f2937",
    color: "#ffffff",
    border: "1px solid #334155",
    padding: "14px 22px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },
  section: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "30px 0"
  },
  sectionAlt: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "30px 24px",
    background: "rgba(15, 23, 42, 0.55)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    borderRadius: "18px"
  },
  sectionTitle: {
    fontSize: "28px",
    marginBottom: "18px",
    color: "#ffffff"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px"
  },
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "22px"
  },
  cardTitle: {
    margin: "0 0 10px 0",
    color: "#38BDF8",
    fontSize: "18px"
  },
  cardText: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: "1.7"
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px"
  },
  step: {
    background: "#0b1220",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "20px"
  },
  stepNo: {
    display: "inline-flex",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center",
    background: "#38BDF8",
    color: "#03111f",
    fontWeight: "800",
    marginBottom: "12px"
  },
  stepText: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: "1.7"
  },
  footerSection: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 0 20px",
    textAlign: "center"
  },
  footerTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "26px"
  },
  footerText: {
    marginTop: "12px",
    color: "#cbd5e1",
    fontSize: "17px"
  }
};