import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaArrowRight,
  FaCoins,
  FaCalculator,
  FaFileInvoiceDollar,
  FaSpinner,
  FaUsers
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";

const RECORD_API = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/payroll/records`;
const EMPLOYEE_API = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/employees`;

export default function PayrollMain() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [employeesCount, setEmployeesCount] = useState(0);

  const today = new Date();
  const currentMonthStr = String(today.getMonth() + 1).padStart(2, "0");
  const currentYearVal = today.getFullYear();

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const [empRes, payrollRes] = await Promise.all([
          axios.get(EMPLOYEE_API, { headers }).catch(() => ({ data: [] })),
          axios.get(`${RECORD_API}?month=${currentMonthStr}&year=${currentYearVal}`, { headers }).catch(() => ({ data: { payrollRecords: [] } }))
        ]);

        const emps = empRes.data.employees || empRes.data || [];
        setEmployeesCount(emps.length);

        const payrollData = payrollRes.data.payrollRecords || [];
        setRecords(payrollData);
      } catch (err) {
        console.error("Failed to load payroll overview stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  // Compute stats
  const totalPayrollSpend = records.reduce((sum, r) => sum + parseFloat(r.net_salary || 0), 0);
  const calculatedCount = records.length;

  // Chart data
  const chartData = records.map(r => ({
    name: r.name.split(" ")[0],
    "Net Salary": parseFloat(r.net_salary || 0),
    "Deductions": parseFloat(r.total_deductions || 0)
  })).slice(0, 10); // show top 10

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 animate-fadeIn bg-slate-50/50 rounded-[2.5rem]">
        

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50 shadow-inner">
              <FaCoins size={20} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Payroll Spend (This Month)</p>
              <p className="text-2xl font-black text-slate-800 mt-1">₹{totalPayrollSpend.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-inner">
              <FaCalculator size={20} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Calculated Staff</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{calculatedCount} / {employeesCount}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100 shadow-inner">
              <FaUsers size={20} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Active Employees</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{employeesCount}</p>
            </div>
          </div>
        </div>

        {/* Feature Sections Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left space-y-4 hover:shadow-md transition">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50">
                <FaCreditCard size={20} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">Salary Configurations</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                Set up salary contracts, hourly rates, and standard allowances (HRA, TA) and tax deductions for each employee based on PostgreSQL master listings.
              </p>
            </div>
            <button 
              onClick={() => navigate("/payroll/salary-details")}
              className="mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 self-start cursor-pointer shadow shadow-blue-150"
            >
              Configure Details <FaArrowRight />
            </button>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left space-y-4 hover:shadow-md transition">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0 border border-indigo-100/50">
                <FaCalculator size={20} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">Payslip Processing</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                Audit monthly work schedules, calculate deductions based on leave records, and publish official payslips to employee profiles.
              </p>
            </div>
            <button 
              onClick={() => navigate("/payroll/payslip")}
              className="mt-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 self-start cursor-pointer shadow shadow-indigo-150"
            >
              Process Monthly Payroll <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm space-y-4 text-left">
          <div>
            <h3 className="font-extrabold text-slate-850 text-sm">Monthly Payroll Distribution</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Top 10 Employees Breakdown</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-blue-600 mr-2" />
              <span className="text-xs font-bold text-slate-400">Loading payroll distribution chart...</span>
            </div>
          ) : chartData.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-xs font-bold">No calculated records found for this month. Run calculations inside the Payslip Processing sub-branch.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b1220",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar dataKey="Net Salary" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Deductions" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
