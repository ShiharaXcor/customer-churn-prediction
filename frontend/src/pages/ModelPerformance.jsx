import { useEffect, useState } from "react";
import { Activity, Target, CheckCircle2, TrendingUp } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import KpiCard from "../components/ui/KpiCard";
import { getModelPerformanceFull, STATIC_BASE_URL } from "../api/client";
import { formatPercent } from "../utils/formatters";

export default function ModelPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModelPerformanceFull()
      .then(setData)
      .catch((err) => console.error("Failed to load model performance", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Model Performance" subtitle="Loading metrics...">
        <div className="flex items-center justify-center h-96 text-slate-400">Loading...</div>
      </DashboardLayout>
    );
  }

  const cm = data?.confusion_matrix ?? {};

  return (
    <DashboardLayout title="Model Performance" subtitle={data?.model_name ?? "Evaluation metrics"}>
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label="Accuracy" value={formatPercent(data?.accuracy ?? 0)} icon={CheckCircle2} accentColor="blue" />
        <KpiCard label="Precision" value={formatPercent(data?.precision ?? 0)} icon={Target} accentColor="amber" />
        <KpiCard label="Recall" value={formatPercent(data?.recall ?? 0)} icon={TrendingUp} accentColor="green" />
        <KpiCard label="ROC-AUC" value={data?.roc_auc?.toFixed(3) ?? "-"} icon={Activity} accentColor="red" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Confusion Matrix visual */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Confusion Matrix</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
              <div className="text-2xl font-bold text-green-700">{cm.true_negative ?? "-"}</div>
              <div className="text-xs text-green-600 mt-1">True Negative<br/>(Correctly predicted staying)</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center">
              <div className="text-2xl font-bold text-amber-700">{cm.false_positive ?? "-"}</div>
              <div className="text-xs text-amber-600 mt-1">False Positive<br/>(Unnecessary retention offers)</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-center">
              <div className="text-2xl font-bold text-red-700">{cm.false_negative ?? "-"}</div>
              <div className="text-xs text-red-600 mt-1">False Negative<br/>(Missed at-risk customers)</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center">
              <div className="text-2xl font-bold text-blue-700">{cm.true_positive ?? "-"}</div>
              <div className="text-xs text-blue-600 mt-1">True Positive<br/>(Correctly caught churners)</div>
            </div>
          </div>
        </Card>

        {/* Confusion matrix image from notebook */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Confusion Matrix Plot</h3>
          <img
            src={`${STATIC_BASE_URL}/confusion_matrix.png`}
            alt="Confusion Matrix"
            className="w-full rounded-lg border border-slate-100"
          />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">ROC Curve</h3>
          <img
            src={`${STATIC_BASE_URL}/roc_curve.png`}
            alt="ROC Curve"
            className="w-full rounded-lg border border-slate-100"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Precision-Recall Curve</h3>
          <img
            src={`${STATIC_BASE_URL}/precision_recall_curve.png`}
            alt="Precision-Recall Curve"
            className="w-full rounded-lg border border-slate-100"
          />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Threshold Trade-off</h3>
          <img
            src={`${STATIC_BASE_URL}/threshold_tradeoff.png`}
            alt="Threshold Tradeoff"
            className="w-full rounded-lg border border-slate-100"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top 10 Features Driving Churn</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {data?.top_10_features?.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-700">{f.Feature}</span>
                <span className="font-medium text-blue-600">{(f.Importance * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}