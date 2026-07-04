import { useState } from "react";
import { Zap, TrendingUp, TrendingDown, Lightbulb, RotateCcw } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import RiskBadge from "../components/ui/RiskBadge";
import { predictCustomer } from "../api/client";
import { formatCurrency } from "../utils/formatters";

const initialForm = {
  gender: "Female",
  SeniorCitizen: 0,
  Partner: "No",
  Dependents: "No",
  tenure: 12,
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "No",
  StreamingMovies: "No",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  MonthlyCharges: 70,
  TotalCharges: 840,
};

const selectField = (label, name, options, value, onChange) => (
  <div>
    <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default function PredictNew() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await predictCustomer(form);
      setResult(response);
    } catch (err) {
      setError("Prediction failed. Check backend logs — likely a field mismatch.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setError(null);
  };

  return (
    <DashboardLayout title="Predict New Customer" subtitle="Live churn prediction using the trained model">
      <div className="grid grid-cols-3 gap-6">
        {/* Form */}
        <Card className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-700">Customer Details</h3>
            <button
              onClick={handleReset}
              type="button"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {selectField("Gender", "gender", ["Female", "Male"], form.gender, handleChange)}
              {selectField("Senior Citizen", "SeniorCitizen", [0, 1], form.SeniorCitizen, handleChange)}
              {selectField("Partner", "Partner", ["Yes", "No"], form.Partner, handleChange)}
              {selectField("Dependents", "Dependents", ["Yes", "No"], form.Dependents, handleChange)}

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tenure (months)</label>
                <input
                  type="number" name="tenure" min="0" max="100" value={form.tenure} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectField("Phone Service", "PhoneService", ["Yes", "No"], form.PhoneService, handleChange)}
              {selectField("Multiple Lines", "MultipleLines", ["Yes", "No", "No phone service"], form.MultipleLines, handleChange)}
              {selectField("Internet Service", "InternetService", ["DSL", "Fiber optic", "No"], form.InternetService, handleChange)}
              {selectField("Online Security", "OnlineSecurity", ["Yes", "No", "No internet service"], form.OnlineSecurity, handleChange)}
              {selectField("Online Backup", "OnlineBackup", ["Yes", "No", "No internet service"], form.OnlineBackup, handleChange)}
              {selectField("Device Protection", "DeviceProtection", ["Yes", "No", "No internet service"], form.DeviceProtection, handleChange)}
              {selectField("Tech Support", "TechSupport", ["Yes", "No", "No internet service"], form.TechSupport, handleChange)}
              {selectField("Streaming TV", "StreamingTV", ["Yes", "No", "No internet service"], form.StreamingTV, handleChange)}
              {selectField("Streaming Movies", "StreamingMovies", ["Yes", "No", "No internet service"], form.StreamingMovies, handleChange)}
              {selectField("Contract", "Contract", ["Month-to-month", "One year", "Two year"], form.Contract, handleChange)}
              {selectField("Paperless Billing", "PaperlessBilling", ["Yes", "No"], form.PaperlessBilling, handleChange)}
              {selectField("Payment Method", "PaymentMethod", ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"], form.PaymentMethod, handleChange)}

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Monthly Charges ($)</label>
                <input
                  type="number" name="MonthlyCharges" step="0.01" value={form.MonthlyCharges} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Total Charges ($)</label>
                <input
                  type="number" name="TotalCharges" step="0.01" value={form.TotalCharges} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              <Zap size={16} />
              {loading ? "Predicting..." : "Predict Churn Risk"}
            </button>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </form>
        </Card>

        {/* Result panel */}
        <Card className="col-span-1 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Prediction Result</h3>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
              <Zap size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Fill the form and click Predict to see live results here.</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              Running model inference...
            </div>
          )}

          {result && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="relative w-28 h-28 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                    <circle
                      cx="56" cy="56" r="48"
                      stroke={result.risk_tier === "High" ? "#dc2626" : result.risk_tier === "Medium" ? "#d97706" : "#16a34a"}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - result.churn_probability)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900">
                    {(result.churn_probability * 100).toFixed(0)}%
                  </div>
                </div>
                <RiskBadge tier={result.risk_tier} />
                <p className="text-xs text-slate-500 mt-2">
                  Prediction: <span className="font-medium text-slate-700">{result.prediction}</span>
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Top Risk Factors</h4>
                <div className="space-y-2">
                  {result.top_risk_factors?.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      {f.Direction === "increases risk" ? (
                        <TrendingUp size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <TrendingDown size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-slate-700">{f.Feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Lightbulb size={13} className="text-amber-500" /> Retention Suggestions
                </h4>
                <div className="space-y-2">
                  {result.retention_suggestions?.map((s, idx) => (
                    <div key={idx} className="text-xs text-slate-700 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}