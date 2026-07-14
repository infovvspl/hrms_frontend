import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CreditCard, Eye, AlertCircle } from "lucide-react";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";

export default function EmployeePayroll() {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/payroll/my-payslips`,
          { headers }
        );
        setPayslips(res.data.payslips || []);
      } catch (err) {
        console.error("Error fetching employee payslips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/employee/dashboard")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition w-fit"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="bg-gradient-to-r from-[#08112d] via-[#151a5a] to-[#08112d] rounded-3xl p-6 text-white border border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                  Payroll Portal
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
                  My Payslip Registry
                </h1>
                <p className="text-slate-300 text-xs font-semibold">
                  Access and view your official monthly payslips compiled in PDF format.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
              <p className="text-slate-400 text-xs mt-3 font-semibold">Loading your payslips...</p>
            </div>
          ) : payslips.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <CreditCard size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-slate-800 font-extrabold text-sm">No Payslips Found</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto font-medium">
                  Your monthly payroll has not been finalized or published by HR yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {payslips.map((ps) => {
                const monthName = monthNames[parseInt(ps.month, 10) - 1] || ps.month;
                return (
                  <div
                    key={ps.id}
                    className="bg-slate-50/50 border border-slate-200/50 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md hover:border-slate-300/80 transition group relative overflow-hidden"
                  >
                    <div className="space-y-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold text-slate-800 text-sm">
                          {monthName} {ps.year}
                        </p>
                        <span
                          className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            ps.payslip_path
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                              : "bg-amber-50 text-amber-700 border-amber-200/50"
                          }`}
                        >
                          {ps.payslip_path ? "Published" : "Pending"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        Worked: <span className="font-extrabold text-slate-650">{ps.present_days} days</span>
                        {parseFloat(ps.lop_days || 0) > 0 && (
                          <span className="text-rose-500 ml-1 font-extrabold">({ps.lop_days} LOP)</span>
                        )}
                      </p>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mt-3">
                        Net Pay: ₹{parseFloat(ps.net_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                      {ps.payslip_path ? (
                        <button
                          onClick={() =>
                            window.open(
                              `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}${ps.payslip_path}`,
                              "_blank"
                            )
                          }
                          className="w-full py-2 bg-indigo-650 bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm shadow-indigo-100 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Eye size={12} /> View PDF
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold transition cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <AlertCircle size={12} /> Under Processing
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
