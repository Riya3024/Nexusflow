export default function RouteRow({ route, nodes }) {
  const from = nodes.find(n => n.id === route.from);
  const to = nodes.find(n => n.id === route.to);

  if (!from || !to) return null;

  const avgRisk =
    ((from.riskScore || 0) + (to.riskScore || 0)) / 2;

  let status = "NORMAL";
  let color = "#22C55E";

  if (avgRisk > 70) {
    status = "CRITICAL";
    color = "#EF4444";
  } else if (avgRisk > 40) {
    status = "RISKY";
    color = "#FACC15";
  }

  const delay = route.delay || 0;

  return (
    <tr style={{ borderBottom: "1px solid #1E3056" }}>
      <td>{route.id}</td>

      <td>
        {from.name} → {to.name}
      </td>

      <td>{route.mode || "Ship"}</td>

      <td style={{ color }}>
        {avgRisk.toFixed(1)}
      </td>

      <td>{delay}h</td>

      <td style={{ color, fontWeight: "bold" }}>
        {status}
      </td>
    </tr>
  );
}