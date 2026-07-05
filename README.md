# Customer Churn Prediction System

A full-stack machine learning system that predicts customer churn risk, explains individual predictions using SHAP, and generates data-driven retention recommendations — built end-to-end with a production-style architecture (FastAPI + React + Docker).

## 🎯 Problem

Predict which customers are likely to churn so a business can proactively intervene with targeted retention offers, prioritizing high-value at-risk accounts before revenue is lost.


## 🏗️ Architecture

React (Vite + Tailwind) ──HTTP──> FastAPI ──> Random Forest Model (scikit-learn)
│
└──> SHAP Explainer (per-customer explanations)


- **Frontend:** React, Vite, Tailwind CSS, Recharts, Axios
- **Backend:** FastAPI, scikit-learn, XGBoost, SHAP
- **Data:** IBM Telco Customer Churn dataset (7,043 customers, 21 features)
- **Infra:** Docker, Docker Compose, nginx (serving frontend build)

## ✨ Features

- **Data Analysis** — Full EDA notebook covering distributions, correlations, and churn drivers
- **Churn Prediction** — Random Forest classifier (recall-optimized) with engineered features
- **Risk Dashboard** — Real-time KPIs, risk-tier distribution, segment breakdowns
- **Customer Risk Table** — Sortable, filterable list of all customers with live risk scores
- **Explainable AI** — SHAP-powered per-customer breakdown of *why* a customer is high risk
- **Retention Engine** — Rule-based suggestions generated from each customer's actual top risk drivers (not generic advice)
- **Live Prediction Form** — Input any customer profile and get a real-time churn probability from the trained model
- **Model Performance Page** — Confusion matrix, ROC curve, precision-recall curve, threshold analysis

## 🧠 ML Approach

- Tested 3 algorithms (Logistic Regression, Random Forest, XGBoost) × 2 imbalance-handling strategies (`class_weight` vs SMOTE) × 2 encoding strategies (One-Hot/Ordinal/Binary vs Label Encoding) = **12 model variants compared**
- **Key finding:** SMOTE underperformed algorithm-level class weighting on Recall across all algorithms — likely due to unrealistic synthetic samples from interpolating one-hot encoded categorical features
- **Final model:** Random Forest with `class_weight="balanced"` on One-Hot/Ordinal/Binary encoded features
  - Accuracy: 77.6% | Precision: 56.0% | Recall: 73.5% | F1: 0.636 | ROC-AUC: 0.840
- Business reasoning: prioritized **Recall** — missing an at-risk customer costs more than a false retention offer

## 📁 Project Structure


customer-churn-prediction/
├── backend/
│   ├── app/                          # FastAPI application
│   │   ├── main.py
│   │   ├── model.py
│   │   ├── schemas.py
│   │   └── retention.py
│   ├── ml/
│   │   ├── notebooks/                # 01–05: EDA → Feature Engineering → Training → Evaluation → SHAP
│   │   ├── models/                   # Trained model artifacts
│   │   └── outputs/                  # Evaluation plots, sample predictions
│   ├── data/
│   ├── requirements.txt
│   ├── requirements-docker.txt
│   └── Dockerfile
├── frontend/                          # React dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md



## 🚀 Setup

### Option A — Docker (recommended, one command)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

### Option B — Manual local setup

```bash
# Backend
cd backend
python -m venv churn-prediction-env
churn-prediction-env\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Regenerating the model

Run notebooks `01` → `05` in `backend/ml/notebooks/` in order. Requires the [Telco Customer Churn dataset](https://www.kaggle.com/datasets/blastchar/telco-customer-churn) placed at `backend/data/raw/telco_churn.csv`.

## 📊 Dataset

[IBM Telco Customer Churn](https://www.kaggle.com/datasets/blastchar/telco-customer-churn) — 7,043 customers, 21 features (demographics, account info, services subscribed).

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/predict` | POST | Predict churn probability for a single customer |
| `/customers` | GET | List customers with risk scores (filterable by risk tier) |
| `/stats` | GET | Dashboard KPIs (churn rate, revenue at risk, etc.) |
| `/model-metrics` | GET | Core model evaluation metrics |
| `/model-performance-full` | GET | Full evaluation summary (confusion matrix, top features) |
| `/feature-importance` | GET | Top features driving churn |

## 🔮 Future Improvements

- Deploy live (Render/Railway + Vercel)
- Add authentication for multi-user access
- A/B test retention suggestion effectiveness with real intervention outcomes
- Add model monitoring/drift detection for production use

## 👤 Author

** shihara  lakshan **     



