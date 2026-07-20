import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaFileInvoiceDollar,
  FaSpinner,
  FaEye,
  FaRedo,
} from "react-icons/fa";
import DashboardLayout from "../../layouts/DashboardLayout";

const BASE = import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000";
const RECORDS_API = `${BASE}/api/payroll/records`;
const GENERATE_API = `${BASE}/api/payroll/generate`;

export default function Payslip() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // { [payrollId]: "/uploads/payslips/..." } — populated after each successful generate
  const [payslipPaths, setPayslipPaths] = useState({});
  // Set of payroll IDs that are currently being generated
  const [generatingIds, setGeneratingIds] = useState(new Set());

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(today.getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // ── Fetch payroll records for selected month/year ──
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${RECORDS_API}?month=${selectedMonth}&year=${selectedYear}`,
        { headers }
      );
      const rows = res.data.payrollRecords || [];
      setRecords(rows);

      // Pre-populate payslipPaths from DB so View button shows on refresh
      const paths = {};
      rows.forEach((r) => {
        if (r.payslip_path) paths[r.id] = r.payslip_path;
      });
      setPayslipPaths((prev) => ({ ...prev, ...paths }));
    } catch (err) {
      console.error("Failed to fetch payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedMonth, selectedYear]);

  // ── Generate (or regenerate) payslip PDF ──
  const handleGeneratePayslip = async (rec) => {
    setGeneratingIds((prev) => new Set([...prev, rec.id]));
    try {
      const res = await axios.post(GENERATE_API, { id: rec.id }, { headers });
      const path = res.data.payslip_path;
      if (path) {
        setPayslipPaths((prev) => ({ ...prev, [rec.id]: path }));
      }
    } catch (err) {
      console.error("Failed to generate payslip:", err);
      alert(err.response?.data?.message || "Failed to generate payslip.");
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(rec.id);
        return next;
      });
    }
  };

  // ── Open the generated PDF in a new tab ──
  const openPayslip = (id) => {
    const path = payslipPaths[id];
    if (path) window.open(`${BASE}${path}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 animate-fadeIn bg-slate-50/50 rounded-[2.5rem]">

        {/* ── Page Header ── */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />

          <div className="space-y-1.5 text-left relative z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-100">
              Payslip Generation
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-1.5">
              Monthly Payslip Manager
            </h1>
            <p className="text-slate-400 text-xs font-semibold">
              Generate payslip PDFs for employees. After generating, use View to open the PDF.
            </p>
          </div>

          {/* Month / Year selectors */}
          <div className="flex gap-2 self-start md:self-center shrink-0 z-10">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 border-2 border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              {monthNames.map((m, i) => (
                <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3.5 py-2 border-2 border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Payroll Table ── */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-4 w-44">Employee</th>
                  <th className="px-3 py-4 text-center">Work Days</th>
                  <th className="px-3 py-4 text-center">Present / LOP</th>
                  <th className="px-3 py-4 text-right">Gross Salary</th>
                  <th className="px-3 py-4 text-right">Deductions</th>
                  <th className="px-3 py-4 text-right">Net Salary</th>
                  <th className="px-5 py-4 text-center w-52">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">

                {/* Loading */}
                {loading && records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-blue-600" />
                        <span>Loading payroll records...</span>
                      </div>
                    </td>
                  </tr>

                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                      No records for {monthNames[parseInt(selectedMonth, 10) - 1]} {selectedYear}.
                      Run calculations in Salary Details first.
                    </td>
                  </tr>

                ) : (
                  records.map((rec) => {
                    const isGenerating = generatingIds.has(rec.id);
                    const hasPayslip = !!payslipPaths[rec.id];

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/40 transition">

                        {/* Employee */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 leading-tight">{rec.name}</p>
                          <p className="text-[9px] text-slate-400 font-black mt-0.5 uppercase">
                            {rec.company_employee_id || `EMP-${rec.user_id}`}
                          </p>
                        </td>

                        {/* Working Days */}
                        <td className="px-3 py-4 text-center text-slate-800 font-bold">
                          {rec.total_working_days}
                        </td>

                        {/* Present / LOP */}
                        <td className="px-3 py-4 text-center font-bold text-slate-500">
                          {rec.present_days} P /{" "}
                          <span className="text-rose-500 font-extrabold">{rec.lop_days} LOP</span>
                        </td>

                        {/* Gross */}
                        <td className="px-3 py-4 text-right text-slate-800 font-extrabold">
                          ₹{parseFloat(rec.gross_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Deductions */}
                        <td className="px-3 py-4 text-right text-rose-500 font-extrabold">
                          ₹{parseFloat(rec.total_deductions || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Net */}
                        <td className="px-3 py-4 text-right text-emerald-600 font-black">
                          ₹{parseFloat(rec.net_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* ── Actions ── */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">

                            {/* VIEW — only visible after PDF is generated */}
                            {hasPayslip && (
                              <button
                                onClick={() => openPayslip(rec.id)}
                                title="Open Payslip PDF"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                              >
                                <FaEye size={10} /> View
                              </button>
                            )}

                            {/* GENERATE / REGENERATE */}
                            <button
                              onClick={() => handleGeneratePayslip(rec)}
                              disabled={isGenerating}
                              title={hasPayslip ? "Regenerate Payslip PDF" : "Generate Payslip PDF"}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold text-white transition cursor-pointer shadow-sm
                                disabled:opacity-60 disabled:cursor-not-allowed
                                ${hasPayslip
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                              {isGenerating ? (
                                <FaSpinner className="animate-spin" size={10} />
                              ) : hasPayslip ? (
                                <FaRedo size={10} />
                              ) : (
                                <FaFileInvoiceDollar size={10} />
                              )}
                              {isGenerating ? "Generating..." : hasPayslip ? "Regenerate" : "Generate"}
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
