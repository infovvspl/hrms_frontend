import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Users,
  Clock,
  Briefcase,
  Search,
  ArrowRight,
  Plus,
  ChevronRight,
  TrendingUp,
  FileText,
  PieChart as PieIcon,
  Sun,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const API_BASE = import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000";

export default function Leave() {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [searchEmployee, setSearchEmployee] = useState("");
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqsRes, typesRes, balancesRes, holRes] = await Promise.all([
          axios.get(`${API_BASE}/api/leaves`, { headers }),
          axios.get(`${API_BASE}/api/leave-types`, { headers }),
          axios.get(`${API_BASE}/api/leaves/remaining`, { headers }),
          axios.get(`${API_BASE}/api/holiday`, { headers }),
        ]);

        setRequests(reqsRes.data.leaveRequests || []);
        setLeaveTypes(typesRes.data.leaveTypes || []);
        setBalances(balancesRes.data.remainingLeaves || []);
        setHolidays(holRes.data.holidays || []);
      } catch (error) {
        console.error("Error fetching dashboard leave data:", error);
      }
    };

    fetchData();
  }, [token]);

  // ================= CALCULATE STATS =================
  const today = new Date().toISOString().split("T")[0];

  const activeLeavesToday = requests.filter((r) => {
    if (r.status !== "Approved") return false;
    const start = new Date(r.from_date).toISOString().split("T")[0];
    const end = new Date(r.to_date).toISOString().split("T")[0];
    return today >= start && today <= end;
  });

  const pendingRequestsCount = requests.filter((r) => r.status === "Pending").length;
  const totalTypesCount = leaveTypes.length;

  // Group balances by employee
  const employeeBalancesMap = balances.reduce((acc, curr) => {
    const empId = curr.user_id;
    if (!acc[empId]) {
      acc[empId] = {
        id: empId,
        name: `${curr.first_name || ""} ${curr.last_name || ""}`,
        department: curr.department_name || "General Staff",
        leaves: [],
      };
    }
    acc[empId].leaves.push({
      id: curr.id,
      typeName: curr.leave_type_name,
      balance: parseFloat(curr.balance_leave) || 0,
      total: parseFloat(curr.total_leave) || 0,
    });
    return acc;
  }, {});

  const filteredBalances = Object.values(employeeBalancesMap).filter((emp) =>
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  const upcomingHolidays = holidays
    .filter((h) => new Date(h.from_date) >= new Date())
    .sort((a, b) => new Date(a.from_date) - new Date(b.from_date))
    .slice(0, 3);

  const recentRequests = requests.slice(0, 5);

  const toggleEmployeeExpand = (empId) => {
    setExpandedEmployeeId((prev) => (prev === empId ? null : empId));
  };

  const calculateDaysLeft = (toDate) => {
    const end = new Date(toDate);
    const curr = new Date(today);
    const diff = end - curr;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 0 ? "Last day" : `${days} days left`;
  };

  // ================= DATA PREPARATION FOR CHARTS =================
  // 1. Monthly Trends Chart Data
  const getMonthlyTrends = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const trendMap = months.reduce((acc, m) => {
      acc[m] = 0;
      return acc;
    }, {});

    requests.forEach((r) => {
      if (r.status === "Approved") {
        const fromDate = new Date(r.from_date);
        if (fromDate.getFullYear() === currentYear) {
          const monthLabel = months[fromDate.getMonth()];
          trendMap[monthLabel] += 1;
        }
      }
    });

    return Object.entries(trendMap).map(([name, count]) => ({ name, value: count }));
  };

  // 2. Category Distribution Pie Chart Data
  const getCategoryDistribution = () => {
    const counts = {};
    requests.forEach((r) => {
      if (r.status === "Approved") {
        const key = r.leave_type_name || "Other";
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    const list = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return list.length > 0 ? list : [{ name: "No Approved Leave", value: 1 }];
  };

  const chartColors = ["#6366f1", "#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#ec4899"];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen bg-slate-50/50 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8"
      >
    

        {/* ================= METRICS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Out of Office Card */}
          <div className="group bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-300" />
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Out of Office Today</span>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{activeLeavesToday.length}</h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Active breaks
                </span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-500 rounded-xl group-hover:scale-110 duration-300 transition-all">
                <Sun size={20} />
              </div>
            </div>
          </div>

          {/* Pending Action Card */}
          <div className="group bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300" />
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pending Requests</span>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{pendingRequestsCount}</h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Needs action
                </span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-110 duration-300 transition-all">
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* Policy Types Card */}
          <div className="group bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300" />
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Policy Types</span>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{totalTypesCount}</h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Active systems
                </span>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl group-hover:scale-110 duration-300 transition-all">
                <Briefcase size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= CHARTS AND DYNAMIC ANALYTICS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Trends - Area Chart (2/3 Column) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-550" />
                  Monthly Approved Leave Trends
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Approved leave volume timeline over the current calendar year</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getMonthlyTrends()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
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
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeave)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution - Pie Chart (1/3 Column) */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
            <div className="pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <PieIcon size={16} className="text-cyan-500" />
                Category Distribution
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Share of approved leave requests by policy type</p>
            </div>

            <div className="relative h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCategoryDistribution()}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getCategoryDistribution().map((entry, index) => (
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Share</span>
                <span className="text-2xl font-black text-slate-800">
                  {requests.filter(r => r.status === "Approved").length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-500 font-bold overflow-y-auto max-h-[80px]">
              {getCategoryDistribution().map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="truncate">{entry.name}</span>
                  <span className="text-slate-400 ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= GRID CONTENT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT 2/3 COLUMN: SEARCHABLE ALLOWANCE CONSOLE */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-800 text-sm">Employee Allowance Console</h2>
                <p className="text-slate-400 text-[11px] mt-0.5">Track remaining balances and rollover status of employees</p>
              </div>

              <div className="relative w-full sm:w-60">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  placeholder="Search Staff Member..."
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white pl-9 pr-4 py-2 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold transition-all duration-200"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredBalances.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
                  <AlertCircle size={24} className="text-slate-300" />
                  <span>No matching employee balances found.</span>
                </div>
              ) : (
                filteredBalances.map((emp) => {
                  const isExpanded = expandedEmployeeId === emp.id;
                  return (
                    <div key={emp.id} className="py-3.5 first:pt-0 last:pb-0">
                      <div
                        onClick={() => toggleEmployeeExpand(emp.id)}
                        className="flex justify-between items-center cursor-pointer hover:bg-slate-50/50 p-2.5 rounded-xl transition duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-xs">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs">{emp.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{emp.department}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {emp.leaves.length} Categories
                          </span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-slate-400"
                          >
                            <ChevronRight size={14} />
                          </motion.div>
                        </div>
                      </div>

                      {/* Expandable details showing balances as clean bars with Framer Motion */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 ml-12 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/50">
                              {emp.leaves.map((leave, idx) => {
                                const percent = leave.total > 0 ? Math.min(100, Math.max(0, (leave.balance / leave.total) * 100)) : 0;
                                return (
                                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1.5 shadow-sm">
                                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                                      <span className="font-bold truncate max-w-[120px]">{leave.typeName}</span>
                                      <span className="font-bold text-slate-800 shrink-0">{leave.balance} / {leave.total} days</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${
                                          percent > 50 ? "bg-emerald-500" : percent > 20 ? "bg-amber-500" : "bg-red-500"
                                        }`}
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT 1/3 COLUMN: DIRECTORIES & ACTIVITIES */}
          <div className="space-y-8">
            {/* Out of Office list */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Out of Office Today
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5 font-medium">Approved employees on leave today</p>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {activeLeavesToday.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                    All staff members are active today.
                  </div>
                ) : (
                  activeLeavesToday.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 text-xs font-black">
                          {r.first_name?.charAt(0)}{r.last_name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{r.first_name} {r.last_name}</h4>
                          <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded">
                            {r.leave_type_name}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                        {calculateDaysLeft(r.to_date)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming breaks */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={16} /> Scheduled Holidays
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5 font-medium">Upcoming breaks scheduled in system</p>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {upcomingHolidays.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                    No upcoming breaks scheduled.
                  </div>
                ) : (
                  upcomingHolidays.map((h) => (
                    <div key={h.id} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <div className="w-8 h-8 bg-indigo-50 border border-indigo-100/50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0 font-bold shadow-sm">
                        <Calendar size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-xs truncate">{h.name}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                          {new Date(h.from_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent request feed / History */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <FileText className="text-blue-500" size={16} /> Recent Logs
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5 font-medium">History log of applications</p>
              </div>

              <div className="relative pl-4 border-l border-slate-100 space-y-5 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
                {recentRequests.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                    No activity logged.
                  </div>
                ) : (
                  recentRequests.map((r) => (
                    <div key={r.id} className="relative text-xs">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1 bg-white p-0.5 rounded-full border border-slate-200">
                        {r.status === "Approved" ? (
                          <CheckCircle size={10} className="text-emerald-500" />
                        ) : r.status === "Rejected" ? (
                          <XCircle size={10} className="text-red-500" />
                        ) : (
                          <Clock size={10} className="text-amber-500" />
                        )}
                      </span>

                      <div className="space-y-0.5">
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-bold text-slate-800 truncate">{r.first_name} {r.last_name}</span>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border shrink-0 ${
                            r.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : r.status === "Rejected"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">
                          {r.leave_type_name} • {new Date(r.from_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}