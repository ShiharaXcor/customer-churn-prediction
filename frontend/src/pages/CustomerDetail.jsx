import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import RiskBadge from "../components/ui/RiskBadge";
import { getCustomers, predictCustomer } from "../api/client";
import { formatCurrency } from "../utils/formatters";

const CONTRACT_LABELS = { 0: "Month-to-month", 1: "One year", 2: "Two year" };

// Maps raw sample_predictions.csv row -> the shape the /predict endpoint expects
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

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCustomers(null, 500)
      .then(async (rows) => {
        const row = rows[Number(id)] ?? rows[0];
        setCustomer(row);
        try {
          const payload = toPredictPayload(row);
          const result = await predictCustomer(payload);
          setPrediction(result);
        } catch (e) {
          setError("Could not generate live prediction for this customer.");
        }
      })
      .catch(() => setError("Failed to load customer data."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Customer Detail" subtitle="Loading...">
        <div className="flex items-center justify-center h-96 text-slate-400">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout title="Customer Detail" subtitle="Not found">
        <div className="text-slate-400">Customer not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Customer #${customer.customerID ?? id}`} subtitle="Individual churn risk breakdown">
      <Link to="/risk-table" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5">
        <ArrowLeft size={16} /> Back to Risk Table
      </Link>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Left: Customer profile */}
        <Card className="col-span-1 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              {(Number(id) + 1)}
            </div>
            <div>
              <div className="font-semibold text-slate-900">Customer #{customer.customerID ?? id}</div>
              <div className="text-xs text-slate-500">{CONTRACT_LABELS[customer.Contract] ?? "-"} contract</div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Tenure</span>
              <span className="font-medium text-slate-800">{customer.tenure} months</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Monthly Charges</span>
              <span className="font-medium text-slate-800">{formatCurrency(customer.MonthlyCharges)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Total Charges</span>
              <span className="font-medium text-slate-800">{formatCurrency(customer.TotalCharges)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Contract</span>
              <span className="font-medium text-slate-800">{CONTRACT_LABELS[customer.Contract] ?? "-"}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-slate-500">Actual Outcome</span>
              <span className={`font-medium ${customer.ActualChurn ? "text-red-600" : "text-green-600"}`}>
                {customer.ActualChurn ? "Churned" : "Retained"}
              </span>
            </div>
          </div>
        </Card>

        {/* Middle: Prediction */}
        <Card className="col-span-1 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-sm text-slate-500 mb-2">Predicted Churn Probability</span>
          <div className="relative w-32 h-32 mb-3">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="12" fill="none" />
              <circle
                cx="64" cy="64" r="56"
                stroke={prediction?.risk_tier === "High" ? "#dc2626" : prediction?.risk_tier === "Medium" ? "#d97706" : "#16a34a"}
                strokeWidth="12"
                fill="none"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - (prediction?.churn_probability ?? 0))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-900">
              {prediction ? `${(prediction.churn_probability * 100).toFixed(0)}%` : "-"}
            </div>
          </div>
          {prediction && <RiskBadge tier={prediction.risk_tier} />}
          {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        </Card>

        {/* Right: Top risk factors */}
        <Card className="col-span-1 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Risk Factors (SHAP)</h3>
          <div className="space-y-3">
            {prediction?.top_risk_factors?.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {factor.Direction === "increases risk" ? (
                  <TrendingUp size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <TrendingDown size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <div className="text-sm font-medium text-slate-800">{factor.Feature}</div>
                  <div className={`text-xs ${factor.Direction === "increases risk" ? "text-red-500" : "text-green-500"}`}>
                    {factor.Direction}
                  </div>
                </div>
              </div>
            )) ?? <p className="text-sm text-slate-400">No explanation available.</p>}
          </div>
        </Card>
      </div>

      {/* Retention Suggestions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">Recommended Retention Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {prediction?.retention_suggestions?.map((suggestion, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {idx + 1}
              </div>
              <p className="text-sm text-slate-700">{suggestion}</p>
            </div>
          )) ?? <p className="text-sm text-slate-400">No suggestions available.</p>}
        </div>
      </Card>
    </DashboardLayout>
  );
}