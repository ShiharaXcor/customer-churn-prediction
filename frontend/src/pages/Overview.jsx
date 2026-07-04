import { useEffect, useState } from "react";
import { Users, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import KpiCard from "../components/ui/KpiCard";
import Card from "../components/ui/Card";
import { getStats, getCustomers } from "../api/client";
import { formatCurrency, formatPercent } from "../utils/formatters";

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getCustomers(null, 200)])
      .then(([statsData, customersData]) => {
        setStats(statsData);
        setCustomers(customersData);
      })
      .catch(err => console.error("Failed to load dashboard data", err))
      .finally(() => setLoading(false));
  }, []);

  const riskDistribution = ["Low", "Medium", "High"].map(tier => ({
    name: tier,
    value: customers.filter(c => c.RiskTier === tier).length,
  }));

  const RISK_COLORS = { Low: "#16a34a", Medium: "#d97706", High: "#dc2626" };

  const contractChurn = customers.reduce((acc, c) => {
    const contract = c.Contract === 0 ? "Month-to-month" : c.Contract === 1 ? "One year" : "Two year";
    const existing = acc.find(a => a.name === contract);
    if (existing) existing.count += 1;
    else acc.push({ name: contract, count: 1 });
    return acc;
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Overview" subtitle="Loading dashboard data...">
        <div className="flex items-center justify-center h-96 text-slate-400">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Overview Dashboard" subtitle="Real-time churn risk monitoring">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Customers"
          value={stats?.total_customers?.toLocaleString() ?? "-"}
          icon={Users}
          accentColor="blue"
          change="Active customer base"
          changeType="neutral"
        />
        <KpiCard
          label="Churn Rate"
          value={formatPercent(stats?.churn_rate ?? 0)}
          icon={TrendingDown}
          accentColor="red"
          change="Historical churn rate"
          changeType="negative"
        />
        <KpiCard
          label="High Risk Customers"
          value={stats?.high_risk_count?.toLocaleString() ?? "-"}
          icon={AlertTriangle}
          accentColor="amber"
          change="Require immediate attention"
          changeType="negative"
        />
        <KpiCard
          label="Revenue at Risk"
          value={formatCurrency(stats?.revenue_at_risk ?? 0)}
          icon={DollarSign}
          accentColor="green"
          change="Monthly recurring revenue"
          changeType="neutral"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-1 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Risk Tier Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={riskDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {riskDistribution.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={30} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="col-span-2 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Customers by Contract Type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={contractChurn}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  );
}