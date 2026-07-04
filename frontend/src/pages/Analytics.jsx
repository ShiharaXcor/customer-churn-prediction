import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import { getCustomers, getFeatureImportance } from "../api/client";

const CONTRACT_LABELS = { 0: "Month-to-month", 1: "One year", 2: "Two year" };

export default function Analytics() {
  const [customers, setCustomers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCustomers(null, 500), getFeatureImportance()])
      .then(([customersData, featureData]) => {
        setCustomers(customersData);
        setFeatures(featureData);
      })
      .catch((err) => console.error("Failed to load analytics data", err))
      .finally(() => setLoading(false));
  }, []);

  // Churn rate by contract type
  const churnByContract = [0, 1, 2].map((code) => {
    const group = customers.filter((c) => c.Contract === code);
    const churned = group.filter((c) => c.ActualChurn === 1).length;
    return {
      name: CONTRACT_LABELS[code],
      churnRate: group.length ? Number(((churned / group.length) * 100).toFixed(1)) : 0,
      total: group.length,
    };
  });

  // Churn rate by tenure bucket
  const tenureBuckets = [
    { label: "0-12 mo", min: 0, max: 12 },
    { label: "13-24 mo", min: 13, max: 24 },
    { label: "25-48 mo", min: 25, max: 48 },
    { label: "48+ mo", min: 49, max: 999 },
  ];
  const churnByTenure = tenureBuckets.map((bucket) => {
    const group = customers.filter((c) => c.tenure >= bucket.min && c.tenure <= bucket.max);
    const churned = group.filter((c) => c.ActualChurn === 1).length;
    return {
      name: bucket.label,
      churnRate: group.length ? Number(((churned / group.length) * 100).toFixed(1)) : 0,
    };
  });

  // Risk tier composition
  const riskComposition = ["Low", "Medium", "High"].map((tier) => ({
    name: tier,
    value: customers.filter((c) => c.RiskTier === tier).length,
  }));
  const RISK_COLORS = { Low: "#16a34a", Medium: "#d97706", High: "#dc2626" };

  if (loading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Loading insights...">
        <div className="flex items-center justify-center h-96 text-slate-400">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics & Insights" subtitle="What drives customer churn">
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Feature Importance */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Churn Drivers (Feature Importance)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={features} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis type="category" dataKey="Feature" tick={{ fontSize: 11 }} stroke="#64748b" width={140} />
              <Tooltip />
              <Bar dataKey="Importance" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk composition */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Overall Risk Composition</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={riskComposition}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
              >
                {riskComposition.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={30} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Churn by Contract */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Churn Rate by Contract Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={churnByContract}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" unit="%" />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="churnRate" fill="#dc2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Churn by Tenure */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Churn Rate by Tenure</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={churnByTenure}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" unit="%" />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="churnRate" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  );
}