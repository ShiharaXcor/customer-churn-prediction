import { useEffect, useState } from "react";
import { Lightbulb, Users, AlertCircle } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import RiskBadge from "../components/ui/RiskBadge";
import { getCustomers, predictCustomer } from "../api/client";
import { formatCurrency } from "../utils/formatters";

const CONTRACT_LABELS = { 0: "Month-to-month", 1: "One year", 2: "Two year" };

function toPredictPayload(row) {
  return {
    gender: row.gender === 1 ? "Male" : "Female",
    SeniorCitizen: row.SeniorCitizen ?? 0,
    Partner: row.Partner === 1 ? "Yes" : "No",
    Dependents: row.Dependents === 1 ? "Yes" : "No",
    tenure: row.tenure,
    PhoneService: row.PhoneService === 1 ? "Yes" : "No",
    MultipleLines: row.MultipleLines_Yes ? "Yes" : "No",
    InternetService: row["InternetService_Fiber optic"] ? "Fiber optic" : row.InternetService_No ? "No" : "DSL",
    OnlineSecurity: row.OnlineSecurity_Yes ? "Yes" : "No",
    OnlineBackup: row.OnlineBackup_Yes ? "Yes" : "No",
    DeviceProtection: row.DeviceProtection_Yes ? "Yes" : "No",
    TechSupport: row.TechSupport_Yes ? "Yes" : "No",
    StreamingTV: row.StreamingTV_Yes ? "Yes" : "No",
    StreamingMovies: row.StreamingMovies_Yes ? "Yes" : "No",
    Contract: CONTRACT_LABELS[row.Contract] ?? "Month-to-month",
    PaperlessBilling: row.PaperlessBilling === 1 ? "Yes" : "No",
    PaymentMethod: row["PaymentMethod_Electronic check"] ? "Electronic check" : "Mailed check",
    MonthlyCharges: row.MonthlyCharges,
    TotalCharges: row.TotalCharges,
  };
}

export default function Retention() {
  const [highRiskCustomers, setHighRiskCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestionCounts, setSuggestionCounts] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const rows = await getCustomers("High", 20); // top 20 high-risk customers only — keeps prediction calls fast
        const withPredictions = await Promise.all(
          rows.map(async (row, idx) => {
            try {
              const payload = toPredictPayload(row);
              const prediction = await predictCustomer(payload);
              return { ...row, _idx: idx, prediction };
            } catch {
              return { ...row, _idx: idx, prediction: null };
            }
          })
        );
        setHighRiskCustomers(withPredictions);

        // Aggregate suggestion frequency across all high-risk customers
        const counts = {};
        withPredictions.forEach((c) => {
          c.prediction?.retention_suggestions?.forEach((s) => {
            counts[s] = (counts[s] || 0) + 1;
          });
        });
        setSuggestionCounts(counts);
      } catch (err) {
        console.error("Failed to load retention data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sortedSuggestions = Object.entries(suggestionCounts).sort((a, b) => b[1] - a[1]);
  const totalMonthlyRevenueAtRisk = highRiskCustomers.reduce((sum, c) => sum + (c.MonthlyCharges || 0), 0);

  if (loading) {
    return (
      <DashboardLayout title="Retention Recommendations" subtitle="Analyzing high-risk customers...">
        <div className="flex items-center justify-center h-96 text-slate-400">
          Running predictions on high-risk customers...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Retention Recommendations" subtitle="Actionable insights for your highest-risk customers">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500">High-Risk Customers Analyzed</div>
            <div className="text-xl font-bold text-slate-900">{highRiskCustomers.length}</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500">Monthly Revenue at Risk</div>
            <div className="text-xl font-bold text-slate-900">{formatCurrency(totalMonthlyRevenueAtRisk)}</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lightbulb size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500">Distinct Suggestions Generated</div>
            <div className="text-xl font-bold text-slate-900">{sortedSuggestions.length}</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Most common suggestions across all high-risk customers */}
        <Card className="col-span-1 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Most Common Retention Actions</h3>
          <div className="space-y-3">
            {sortedSuggestions.length === 0 && (
              <p className="text-sm text-slate-400">No suggestions generated yet.</p>
            )}
            {sortedSuggestions.map(([suggestion, count], idx) => (
              <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-slate-700 flex-1">{suggestion}</p>
                  <span className="flex-shrink-0 text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Per-customer breakdown */}
        <Card className="col-span-2 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">High-Risk Customers — Individual Actions</h3>
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            {highRiskCustomers.map((c) => (
              <div key={c._idx} className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-800">
                      Customer #{c.customerID ?? c._idx + 1000}
                    </span>
                    <RiskBadge tier={c.RiskTier} />
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatCurrency(c.MonthlyCharges)}/mo · {c.tenure} mo tenure
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {c.prediction?.retention_suggestions?.map((s, i) => (
                    <span key={i} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  )) ?? <span className="text-xs text-slate-400">No suggestions available</span>}
                </div>
              </div>
            ))}
            {highRiskCustomers.length === 0 && (
              <p className="text-sm text-slate-400">No high-risk customers found.</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}