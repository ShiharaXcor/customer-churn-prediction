export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

export const riskColor = (tier) => {
  switch (tier) {
    case "High": return { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", dot: "bg-red-500" };
    case "Medium": return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-500" };
    case "Low": return { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", dot: "bg-green-500" };
    default: return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
  }
};