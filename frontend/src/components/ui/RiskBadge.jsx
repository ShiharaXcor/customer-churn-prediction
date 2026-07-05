import { riskColor } from "../../utils/formatters";

export default function RiskBadge({ tier }) {
  const c = riskColor(tier);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {tier} Risk
    </span>
  );
}