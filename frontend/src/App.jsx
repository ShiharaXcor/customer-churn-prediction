import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview";
import RiskTable from "./pages/RiskTable";
import CustomerDetail from "./pages/CustomerDetail";
import Analytics from "./pages/Analytics";
import Retention from "./pages/Retention";
import ModelPerformance from "./pages/ModelPerformance";
import PredictNew from "./pages/PredictNew";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/risk-table" element={<RiskTable />} />
        <Route path="/customer/:id" element={<CustomerDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/retention" element={<Retention />} />
        <Route path="/model-performance" element={<ModelPerformance />} />
        <Route path="/predict" element={<PredictNew />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;