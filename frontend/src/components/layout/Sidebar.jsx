import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserSearch, BarChart3, Heart, Activity, UserPlus } from "lucide-react";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/risk-table", label: "Risk Table", icon: Users },
  { to: "/customer/1", label: "Customer Detail", icon: UserSearch },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/retention", label: "Retention", icon: Heart },
  { to: "/model-performance", label: "Model Performance", icon: Activity },
  { to: "/predict", label: "Predict New", icon: UserPlus },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0">
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
            CP
          </div>
          <span className="text-white font-semibold text-lg">ChurnPredict</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
        Customer Churn Prediction v1.0
      </div>
    </aside>
  );
}