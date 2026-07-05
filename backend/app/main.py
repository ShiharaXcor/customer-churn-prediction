from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path

from app.schemas import CustomerInput, PredictionResponse, ModelMetrics, DashboardStats
from app.model import predict_churn
from app.retention import generate_retention_suggestions
from fastapi.staticfiles import StaticFiles



BASE_DIR = Path(__file__).resolve().parent.parent / "ml" / "models"
OUTPUTS_DIR = Path(__file__).resolve().parent.parent / "ml" / "outputs"



app = FastAPI(
    title="Customer Churn Prediction API",
    description="Predicts customer churn risk and generates retention suggestions using ML + SHAP explainability.",
    version="1.0.0"
)

app.mount("/static-outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="static-outputs")

# Allow the React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "Customer Churn Prediction API is running", "docs": "/docs"}


@app.post("/predict", response_model=PredictionResponse)
def predict(customer: CustomerInput):
    try:
        result = predict_churn(customer.dict())
        suggestions = generate_retention_suggestions(result["top_risk_factors"])
        return {**result, "retention_suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/model-metrics", response_model=ModelMetrics)
def model_metrics():
    with open(BASE_DIR / "evaluation_summary.json") as f:
        data = json.load(f)
    return {
        "model_name": data["model_name"],
        "accuracy": data["accuracy"],
        "precision": data["precision"],
        "recall": data["recall"],
        "f1_score": data["f1_score"],
        "roc_auc": data["roc_auc"]
    }


@app.get("/stats", response_model=DashboardStats)
def dashboard_stats():
    import pandas as pd
    import numpy as np

    df = pd.read_csv(OUTPUTS_DIR / "sample_predictions.csv")
    df = df.replace([np.inf, -np.inf], np.nan)

    total = len(df)
    churn_rate = float(df["ActualChurn"].mean())
    high_risk = int((df["RiskTier"] == "High").sum())
    revenue_at_risk = float(df[df["RiskTier"] == "High"]["MonthlyCharges"].sum()) if "MonthlyCharges" in df.columns else 0.0

    return {
        "total_customers": total,
        "churn_rate": round(churn_rate, 4) if not np.isnan(churn_rate) else 0.0,
        "high_risk_count": high_risk,
        "revenue_at_risk": round(revenue_at_risk, 2) if not np.isnan(revenue_at_risk) else 0.0
    }


@app.get("/customers")
def get_customers(limit: int = 50, risk_tier: str = None):
    import pandas as pd
    import numpy as np

    df = pd.read_csv(OUTPUTS_DIR / "sample_predictions.csv")

    if risk_tier:
        df = df[df["RiskTier"] == risk_tier]

    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.where(pd.notnull(df), None)

    return df.head(limit).to_dict(orient="records")


@app.get("/feature-importance")
def feature_importance():
    import pandas as pd
    df = pd.read_csv(OUTPUTS_DIR / "feature_importance.csv")
    return df.head(10).to_dict(orient="records")


@app.get("/model-performance-full")
def model_performance_full():
    import json
    with open(BASE_DIR / "evaluation_summary.json") as f:
        data = json.load(f)
    return data