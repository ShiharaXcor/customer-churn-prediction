import joblib
import json
import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent / "ml" / "models"

# Load all artifacts once at startup
model = joblib.load(BASE_DIR / "churn_model.pkl")
scaler = joblib.load(BASE_DIR / "scaler.pkl")
ordinal_encoder = joblib.load(BASE_DIR / "ordinal_encoder.pkl")
onehot_encoder = joblib.load(BASE_DIR / "onehot_encoder.pkl")
shap_explainer = joblib.load(BASE_DIR / "shap_explainer.pkl")

with open(BASE_DIR / "feature_columns.json") as f:
    FEATURE_COLUMNS = json.load(f)

BINARY_MAP = {"Yes": 1, "No": 0}
GENDER_MAP = {"Male": 1, "Female": 0}
CONTRACT_ORDER = ["Month-to-month", "One year", "Two year"]
TENURE_ORDER = ["0-1yr", "1-2yr", "2-4yr", "4yr+"]

NOMINAL_COLS = ["MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup",
                "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
                "PaymentMethod"]

NUMERICAL_COLS = ["tenure", "MonthlyCharges", "TotalCharges", "AvgMonthlySpend", "TotalServices"]

SERVICE_COLS = ["PhoneService", "MultipleLines", "InternetService", "OnlineSecurity",
                "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies"]


def _tenure_bucket(t: int) -> str:
    if t <= 12: return "0-1yr"
    elif t <= 24: return "1-2yr"
    elif t <= 48: return "2-4yr"
    else: return "4yr+"


def _count_services(row: dict) -> int:
    return sum(1 for col in SERVICE_COLS if row[col] not in ["No", "No internet service", "No phone service"])


def preprocess_input(customer: dict) -> pd.DataFrame:
    """Replicates the EXACT transformation pipeline from notebooks 02."""
    row = customer.copy()

    row["TenureGroup"] = _tenure_bucket(row["tenure"])
    row["AvgMonthlySpend"] = row["TotalCharges"] / max(row["tenure"], 1)
    row["ChargeIncreaseFlag"] = int(row["MonthlyCharges"] > row["AvgMonthlySpend"])
    row["TotalServices"] = _count_services(row)

    df = pd.DataFrame([row])

    # Binary encoding
    df["gender"] = df["gender"].map(GENDER_MAP)
    df["Partner"] = df["Partner"].map(BINARY_MAP)
    df["Dependents"] = df["Dependents"].map(BINARY_MAP)
    df["PhoneService"] = df["PhoneService"].map(BINARY_MAP)
    df["PaperlessBilling"] = df["PaperlessBilling"].map(BINARY_MAP)

    # Ordinal encoding
    df[["Contract", "TenureGroup"]] = ordinal_encoder.transform(df[["Contract", "TenureGroup"]])

    # Nominal (one-hot) encoding
    onehot_encoded = onehot_encoder.transform(df[NOMINAL_COLS])
    onehot_feature_names = onehot_encoder.get_feature_names_out(NOMINAL_COLS)
    onehot_df = pd.DataFrame(onehot_encoded, columns=onehot_feature_names, index=df.index)

    df = df.drop(columns=NOMINAL_COLS)
    df = pd.concat([df, onehot_df], axis=1)

    # Ensure exact column order/set matches training (fill missing dummy cols with 0)
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0
    df = df[FEATURE_COLUMNS]

    return df


def predict_churn(customer: dict) -> dict:
    X = preprocess_input(customer)

    probability = float(model.predict_proba(X)[0][1])
    prediction = "Churn" if probability >= 0.5 else "No Churn"

    if probability >= 0.6:
        risk_tier = "High"
    elif probability >= 0.3:
        risk_tier = "Medium"
    else:
        risk_tier = "Low"

    # SHAP explanation for this specific customer
    shap_raw = shap_explainer.shap_values(X)
    if isinstance(shap_raw, list):
        shap_vals = shap_raw[1][0]
    elif isinstance(shap_raw, np.ndarray) and shap_raw.ndim == 3:
        shap_vals = shap_raw[0, :, 1]
    else:
        shap_vals = shap_raw[0]

    impact_df = pd.DataFrame({
        "Feature": X.columns,
        "SHAP_Value": shap_vals,
        "Feature_Value": X.iloc[0].values
    })
    impact_df["Direction"] = impact_df["SHAP_Value"].apply(lambda x: "increases risk" if x > 0 else "decreases risk")
    impact_df["AbsImpact"] = impact_df["SHAP_Value"].abs()
    top_factors = impact_df.sort_values("AbsImpact", ascending=False).head(5)

    top_risk_factors = [
        {"Feature": r["Feature"], "Direction": r["Direction"], "SHAP_Value": float(r["SHAP_Value"])}
        for _, r in top_factors.iterrows()
    ]

    return {
        "churn_probability": round(probability, 4),
        "risk_tier": risk_tier,
        "prediction": prediction,
        "top_risk_factors": top_risk_factors
    }