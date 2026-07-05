import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const getStats = () => api.get("/stats").then(res => res.data);

export const getCustomers = (riskTier = null, limit = 100) =>
  api.get("/customers", { params: { risk_tier: riskTier, limit } }).then(res => res.data);

export const getModelMetrics = () => api.get("/model-metrics").then(res => res.data);

export const getModelPerformanceFull = () =>
  api.get("/model-performance-full").then(res => res.data);

export const getFeatureImportance = () =>
  api.get("/feature-importance").then(res => res.data);

export const predictCustomer = (customerData) =>
  api.post("/predict", customerData).then(res => res.data);

export const STATIC_BASE_URL = `${API_BASE_URL}/static-outputs`;

export default api;