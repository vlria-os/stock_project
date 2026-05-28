export default function MiniChart({ data }) {
  if (!data?.length) return null;

  // sort ascending by date so oldest is on the left
  const pts = [...data].sort((a, b) => a.stck_bsop_date.localeCompare(b.stck_bsop_date));
  const prices = pts.map((d) => parseFloat(d.stck_clpr));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 300, H = 80;

  const x = (i) => ((i / (prices.length - 1)) * W).toFixed(2);
  const y = (p) => (H - 4 - ((p - min) / range) * (H - 8)).toFixed(2);

  const linePath = prices.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p)}`).join(" ");
  const fillPath = `${linePath} L${x(prices.length - 1)},${H} L${x(0)},${H} Z`;
  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? "#ef4444" : "#3b82f6";

  const fmt = (s) => `${s.slice(4, 6)}/${s.slice(6, 8)}`;

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 6, fontWeight: 500 }}>
        30일 차트
      </div>
      <svg viewBox={`0 0 ${W} ${H + 16}`} style={{ width: "100%", display: "block" }}>
        <defs>
          <linearGradient id={`fill-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#fill-${color})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="2" y={parseFloat(y(max)) - 2} fontSize="9" style={{ fill: "var(--text)" }}>
          {parseInt(max).toLocaleString()}
        </text>
        <text x="2" y={parseFloat(y(min)) + 10} fontSize="9" style={{ fill: "var(--text)" }}>
          {parseInt(min).toLocaleString()}
        </text>
        <text x="0" y={H + 14} fontSize="9" style={{ fill: "var(--text)" }}>
          {fmt(pts[0].stck_bsop_date)}
        </text>
        <text x={W} y={H + 14} fontSize="9" textAnchor="end" style={{ fill: "var(--text)" }}>
          {fmt(pts[pts.length - 1].stck_bsop_date)}
        </text>
      </svg>
    </div>
  );
}
