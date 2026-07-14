import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Calendar,
  Clock,
  Plus,
  ChevronRight,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  PieChart as PieIcon,
} from "lucide-react";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";

export default function EmployeeLeaveDashboard() {
  const [remainingLeaves, setRemainingLeaves] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remainingRes, requestsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/leaves/remaining`, { headers }),
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/leaves`, { headers }),
      ]);

      setRemainingLeaves(remainingRes.data.remainingLeaves || remainingRes.data || []);
      setLeaveRequests(requestsRes.data.leaveRequests || requestsRes.data || []);
    } catch (err) {
      console.error("Error fetching employee dashboard leave data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Stats
  const pendingCount = leaveRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = leaveRequests.filter((r) => r.status === "Approved").length;
  const rejectedCount = leaveRequests.filter((r) => r.status === "Rejected").length;
  const totalBalance = remainingLeaves.reduce((acc, curr) => acc + (parseFloat(curr.balance_leave) || 0), 0);

  // Recharts Pie Chart Data
  const getPieData = () => {
    const data = remainingLeaves.map((rl) => ({
      name: rl.leave_type_name,
      value: parseFloat(rl.balance_leave) || 0,
    }));
    return data.some((d) => d.value > 0) ? data : [{ name: "No Balance", value: 1 }];
  };

  const chartColors = ["#6366f1", "#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#ec4899"];

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#08112d] via-[#151a5a] to-[#08112d] rounded-3xl p-6 text-white border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                Leaves Portal
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
                Leaves Dashboard
              </h1>
              <p className="text-slate-300 text-xs font-semibold">
                Overview of your remaining leaves, request stats, and upcoming requests.
              </p>
            </div>
            <button
              onClick={() => navigate("/employee/leave/apply")}
              className="bg-[#2390ea] hover:bg-[#1678d4] text-white px-5 py-3 rounded-2xl text-xs font-bold transition duration-150 flex items-center gap-2 shadow-md hover:scale-[1.02]"
            >
              <Plus size={16} />
              Apply Leave
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            <span className="text-sm font-bold text-slate-600 ml-3">Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Total Balance */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Remaining Balance</span>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{totalBalance} Days</h3>
                  </div>
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <CalendarDays size={18} />
                  </div>
                </div>
              </div>

              {/* Pending Requests */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pending Actions</span>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{pendingCount} Applications</h3>
                  </div>
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock size={18} />
                  </div>
                </div>
              </div>

              {/* Approved Leaves */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Approved Leaves</span>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{approvedCount} Applications</h3>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CheckCircle size={18} />
                  </div>
                </div>
              </div>

              {/* Rejected Leaves */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Rejected Applications</span>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{rejectedCount} Applications</h3>
                  </div>
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                    <XCircle size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Balances & Chart Breakdown */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Column: Remaining Balances List */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Remaining Leave Balances</h4>
                  <p className="text-[10px] text-slate-400 font-bold">MY CURRENT BALANCES BREAKDOWN</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {remainingLeaves.length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold py-4 text-center col-span-2">
                      No leave balance records available.
                    </p>
                  ) : (
                    remainingLeaves.map((rl) => (
                      <div key={rl.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider truncate">
                            {rl.leave_type_name}
                          </p>
                          <p className="text-2xl font-black text-slate-800 mt-2">
                            {rl.balance_leave} <span className="text-xs text-slate-500 font-bold">Days</span>
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                          <span>Total Credit: {rl.total_leave} Days</span>
                          <span className="text-[#2390ea]">{rl.credit_type || "N/A"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Pie Chart distribution */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <PieIcon size={16} className="text-cyan-500" />
                    Balance Share Distribution
                  </h4>
                  <p className="text-slate-400 text-[10px] font-bold">LEAVE BALANCE WEIGHTS</p>
                </div>

                <div className="relative h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {getPieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0b1220",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-black text-slate-800">{totalBalance}d</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-bold overflow-y-auto max-h-[80px] mt-4">
                  {getPieData().map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                      <span className="truncate">{entry.name}</span>
                      <span className="text-slate-400 ml-auto">{entry.value} Days</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Requests Section */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Recent Activity Logs</h4>
                  <p className="text-[10px] text-slate-400 font-bold">LATEST APPLICATIONS SUBMITTED</p>
                </div>
                <Link
                  to="/employee/leave/history"
                  className="text-[#2390ea] hover:text-[#1678d4] text-[11px] font-bold flex items-center gap-1 transition"
                >
                  View full history
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {leaveRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-6 text-center">
                    No leave requests found. Click "Apply Leave" to submit your first application.
                  </p>
                ) : (
                  leaveRequests.slice(0, 3).map((req) => {
                    const fromDateStr = new Date(req.from_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const toDateStr = new Date(req.to_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const status = req.status || "Pending";

                    return (
                      <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                            status === "Rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 text-xs">{req.leave_type_name}</h5>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {fromDateStr} to {toDateStr}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {req.description && (
                            <p className="hidden md:block text-[11px] text-slate-400 italic max-w-[200px] truncate" title={req.description}>
                              "{req.description}"
                            </p>
                          )}
                          <span
                            className={`
                              inline-flex items-center gap-1
                              px-2.5 py-0.5
                              rounded-full
                              text-[10px]
                              font-bold
                              border
                              ${status === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : status === "Rejected"
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                              }
                            `}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </EmployeeDashboardLayout>
  );
}
