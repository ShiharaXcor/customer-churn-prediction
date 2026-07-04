import { useEffect, useState, useMemo } from "react";
import { Search, ArrowUpDown, Download } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import RiskBadge from "../components/ui/RiskBadge";
import { getCustomers } from "../api/client";
import { formatCurrency } from "../utils/formatters";

const CONTRACT_LABELS = {
  0: "Month-to-month",
  1: "One year",
  2: "Two year",
};

export default function RiskTable() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sortKey, setSortKey] = useState("ChurnProbability");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    getCustomers(null, 500)
      .then(setCustomers)
      .catch((err) => console.error("Failed to load customers", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...customers];

    // Risk Filter
    if (riskFilter !== "All") {
      result = result.filter((c) => c.RiskTier === riskFilter);
    }

    // Search
    if (search.trim()) {
      const s = search.toLowerCase();

      result = result.filter((c) => {
        return (
          String(c.customerID ?? "").toLowerCase().includes(s) ||
          String(c.MonthlyCharges ?? "").includes(s) ||
          String(c.tenure ?? "").includes(s) ||
          String(c.RiskTier ?? "").toLowerCase().includes(s) ||
          (CONTRACT_LABELS[c.Contract] ?? "")
            .toLowerCase()
            .includes(s)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }

      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return result;
  }, [customers, search, riskFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const riskCounts = {
    All: customers.length,
    High: customers.filter((c) => c.RiskTier === "High").length,
    Medium: customers.filter((c) => c.RiskTier === "Medium").length,
    Low: customers.filter((c) => c.RiskTier === "Low").length,
  };

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "CustomerID",
      "Contract",
      "Tenure",
      "MonthlyCharges",
      "ChurnProbability",
      "RiskTier",
    ];

    const rows = filtered.map((c) => [
      c.customerID,
      CONTRACT_LABELS[c.Contract],
      c.tenure,
      c.MonthlyCharges,
      c.ChurnProbability,
      c.RiskTier,
    ]);

    const csv =
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "customer_risk.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      title="Customer Risk Table"
      subtitle="Sortable, filterable churn risk overview"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {["All", "High", "Medium", "Low"].map((tier) => (
            <button
              key={tier}
              onClick={() => setRiskFilter(tier)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                riskFilter === tier
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tier} ({riskCounts[tier]})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">
            Loading customers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 font-semibold">
                    Customer
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Contract
                  </th>

                  <th
                    className="text-left px-5 py-3 font-semibold cursor-pointer"
                    onClick={() => toggleSort("tenure")}
                  >
                    <div className="flex items-center gap-1">
                      Tenure
                      <ArrowUpDown size={14} />
                    </div>
                  </th>

                  <th
                    className="text-left px-5 py-3 font-semibold cursor-pointer"
                    onClick={() => toggleSort("MonthlyCharges")}
                  >
                    <div className="flex items-center gap-1">
                      Monthly Charges
                      <ArrowUpDown size={14} />
                    </div>
                  </th>

                  <th
                    className="text-left px-5 py-3 font-semibold cursor-pointer"
                    onClick={() => toggleSort("ChurnProbability")}
                  >
                    <div className="flex items-center gap-1">
                      Churn Probability
                      <ArrowUpDown size={14} />
                    </div>
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Risk Tier
                  </th>

                  <th className="text-left px-5 py-3 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.slice(0, 100).map((c, idx) => (
                  <tr
                    key={c.customerID ?? idx}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </div>

                        <span className="font-medium">
                          Customer #{c.customerID ?? idx + 1000}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      {CONTRACT_LABELS[c.Contract] ?? "-"}
                    </td>

                    <td className="px-5 py-3">
                      {c.tenure} mo
                    </td>

                    <td className="px-5 py-3">
                      {formatCurrency(c.MonthlyCharges)}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              c.ChurnProbability >= 0.6
                                ? "bg-red-500"
                                : c.ChurnProbability >= 0.3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${c.ChurnProbability * 100}%`,
                            }}
                          />
                        </div>

                        <span>
                          {(c.ChurnProbability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <RiskBadge tier={c.RiskTier} />
                    </td>

                    <td className="px-5 py-3">
                      <a
                        href={`/customer/${c.customerID ?? idx}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                      >
                        View Details →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-10 text-center text-slate-400">
                No customers match your filters.
              </div>
            )}
          </div>
        )}
      </Card>

      <p className="text-xs text-slate-400 mt-3">
        Showing {Math.min(filtered.length, 100)} of {filtered.length} customers
      </p>
    </DashboardLayout>
  );
}