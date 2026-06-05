import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function RiskChart({ node }) {

  const data = (node?.history || []).map((value, index) => ({
    time: index,
    risk: value || 0
  }));

  if (!data.length) return null;

  return (
    <div style={{ height: 150 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="risk"
            stroke="#38BDF8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}