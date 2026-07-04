export default function KpiCard({ label, value, change, changeType = "neutral", icon: Icon, accentColor = "blue" }) {
  const accentMap = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };

  const changeColor = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-slate-500",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentMap[accentColor]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {change && <div className={`text-xs font-medium mt-1 ${changeColor[changeType]}`}>{change}</div>}
    </div>
  );
}