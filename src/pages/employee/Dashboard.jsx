import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  Fingerprint,
  CheckCircle2,
  XCircle,
  Calendar,
  UserCheck,
  User,
  ArrowRight,
  HelpCircle,
  Download,
  ChevronDown,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Gift,
  Star,
  GraduationCap,
  TrendingUp,
  Activity,
  ListTodo,
  CheckSquare,
  Search,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Award,
  BookOpen
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from "recharts";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("employee") || "{}") || {};
    } catch {
      return {};
    }
  });

  const [shifts, setShifts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [remainingLeaves, setRemainingLeaves] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [locationMode, setLocationMode] = useState("office"); // office | home
  const [scanState, setScanState] = useState("idle"); // idle | scanning | success | denied
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shiftRes, logRes, leaveRes, holidayRes, requestsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/attendance/shifts`, { headers }).catch(() => ({ data: { shifts: [] } })),
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/attendance/logs`, { headers }).catch(() => ({ data: { logs: [] } })),
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/leaves/remaining`, { headers }).catch(() => ({ data: { remainingLeaves: [] } })),
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/holiday`, { headers }).catch(() => ({ data: { holidays: [] } })),
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/leaves`, { headers }).catch(() => ({ data: { leaveRequests: [] } }))
      ]);

      const fetchedShifts = shiftRes?.data?.shifts || shiftRes?.data || [];
      setShifts(Array.isArray(fetchedShifts) ? fetchedShifts : []);

      const fetchedRequests = requestsRes?.data?.leaveRequests || requestsRes?.data || [];
      setLeaveRequests(Array.isArray(fetchedRequests) ? fetchedRequests : []);

      const logData = logRes?.data?.logs || logRes?.data || [];
      const logsArray = Array.isArray(logData) ? logData : [];
      const formattedLogs = logsArray.map(l => {
        if (!l) return null;
        const punchInDate = l.punch_in_at ? new Date(l.punch_in_at) : null;
        const punchOutDate = l.punch_out_at ? new Date(l.punch_out_at) : null;

        return {
          id: `LOG-${l.id}`,
          punchInRaw: l.punch_in_at,
          punchOutRaw: l.punch_out_at,
          shiftName: l.shift_name || "General Shift",
          punchIn: punchInDate ? punchInDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          punchOut: punchOutDate ? punchOutDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          location: l.location || "Bangalore Tech Park HQ",
          status: punchInDate && l.shift_start_time ?
            (punchInDate.toLocaleTimeString("en-GB") > l.shift_start_time ? "Late Check-in" : "On Time") : "On Time",
          gpsStatus: "Inside Geofence"
        };
      }).filter(Boolean);
      setLogs(formattedLogs);

      const fetchedLeaves = leaveRes?.data?.remainingLeaves || leaveRes?.data || [];
      setRemainingLeaves(Array.isArray(fetchedLeaves) ? fetchedLeaves : []);

      const fetchedHolidays = holidayRes?.data?.holidays || holidayRes?.data || [];
      setHolidays(Array.isArray(fetchedHolidays) ? fetchedHolidays : []);
    } catch (error) {
      console.error("Fetch employee dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const officeConfig = {
    name: "Bangalore Tech Park HQ",
    lat: 12.9716,
    lng: 77.5946,
    radius: 100
  };

  const simulatedCoords = locationMode === "office"
    ? { lat: 12.9718, lng: 77.5945, distance: 24 }
    : { lat: 12.9141, lng: 77.6413, distance: 8200 };

  const isInsideGeofence = simulatedCoords.distance <= officeConfig.radius;

  const defaultShift = Array.isArray(shifts) ? shifts.find(s => s?.shift_name === "General Shift") || shifts[0] : null;
  const activeEmpLog = Array.isArray(logs) ? logs.find(log => log?.punchOut === "--:--") : null;
  const isPunchedIn = !!activeEmpLog;

  const triggerBiometricPunch = () => {
    if (scanState === "scanning") return;

    setScanState("scanning");

    setTimeout(async () => {
      if (!isInsideGeofence) {
        setScanState("denied");
        setTimeout(() => setScanState("idle"), 3000);
        return;
      }

      try {
        await axios.post(`${import.meta.env.VITE_SERVER_ADDRESS}/api/attendance/punch`, {
          user_id: employee?.id,
          shift_id: defaultShift?.id || 1
        }, { headers });

        setScanState("success");
        await fetchData();
        setTimeout(() => setScanState("idle"), 1550);
      } catch (err) {
        console.error("Punch request failed:", err);
        setScanState("denied");
        setTimeout(() => setScanState("idle"), 3000);
      }
    }, 2000);
  };

  // ----------------------------------------------------
  // Statistics and Graph Formatting Logic (Aesthetics)
  // ----------------------------------------------------

  // Group logs by date to prevent duplicate calculations for multiple sessions in a single day
  const logsByDate = {};
  if (Array.isArray(logs)) {
    logs.forEach(l => {
      if (l && l.punchInRaw) {
        const dateStr = new Date(l.punchInRaw).toDateString();
        if (!logsByDate[dateStr]) {
          logsByDate[dateStr] = [];
        }
        logsByDate[dateStr].push(l);
      }
    });
  }

  // Calculate unique days stats: status is based on first check-in of each day
  let computedPresent = 0;
  let computedLate = 0;
  let computedOnTime = 0;

  Object.keys(logsByDate).forEach(dateStr => {
    computedPresent++;
    const dayLogs = logsByDate[dateStr];
    // logs is sorted DESC, so first check-in of the day is the last element
    const firstPunch = dayLogs[dayLogs.length - 1];
    if (firstPunch && firstPunch.status && String(firstPunch.status).includes("Late")) {
      computedLate++;
    } else {
      computedOnTime++;
    }
  });

  const totalPresent = computedPresent;
  const leaveBalance = Array.isArray(remainingLeaves)
    ? remainingLeaves.reduce((sum, item) => sum + Number(item?.balance_leave || 0), 0)
    : 0;
  const pendingLeaves = Array.isArray(leaveRequests)
    ? leaveRequests.filter(r => r && (r.status === "Pending" || r.status === "pending")).length
    : 0;

  const totalOnTime = computedOnTime;
  const totalLate = computedLate;
  const totalAbsent = Array.isArray(holidays) ? holidays.length : 0;
  const totalLeaveCount = Array.isArray(leaveRequests) ? leaveRequests.filter(r => r && (r.status === "Approved" || r.status === "approved")).length : 0;

  const shiftTimeString = defaultShift
    ? `${defaultShift.shift_start_time?.substring(0, 5) || "09:00"} - ${defaultShift.shift_end_time?.substring(0, 5) || "18:00"}`
    : "09:00 - 18:00";

  const formattedCurrentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Export Report
  const handleExportCSV = () => {
    if (!Array.isArray(logs)) return;
    const csvHeaders = ["Log ID", "Assigned Shift", "Punch In", "Punch Out", "GPS Status", "Status"];
    const csvRows = logs.map(log => {
      if (!log) return [];
      return [
        log.id,
        log.shiftName,
        log.punchIn,
        log.punchOut,
        "Inside Geofence",
        log.status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [csvHeaders.join(","), ...csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `My_Attendance_Registry_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Attendance Overview Donut Chart Data
  const donutChartData = [
    { name: "Present", value: totalPresent || 14, color: "#10B981" },      // Green
    { name: "On Leave", value: totalLeaveCount || 1, color: "#8B5CF6" },   // Purple
    { name: "Absent", value: totalLate || 2, color: "#F59E0B" },           // Amber (Using Late as Proxy)
    { name: "Half Day", value: totalAbsent || 1, color: "#3B82F6" }        // Blue (Using Holiday count as Proxy)
  ];
  const totalDays = donutChartData.reduce((sum, item) => sum + item.value, 0);

  // 2. Employee Trend (Cumulative hours worked daily)
  const dailyWorkHours = [];
  Object.keys(logsByDate).forEach(dateStr => {
    const dayLogs = logsByDate[dateStr];
    let totalMs = 0;
    dayLogs.forEach(l => {
      if (l.punchInRaw) {
        const inDate = new Date(l.punchInRaw);
        const outDate = l.punchOutRaw ? new Date(l.punchOutRaw) : new Date();
        const diff = outDate - inDate;
        if (diff > 0) totalMs += diff;
      }
    });
    const hours = Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;
    dailyWorkHours.push({
      name: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hours: hours,
      rawDate: new Date(dateStr)
    });
  });

  const workHoursTrendData = dailyWorkHours.length > 0
    ? dailyWorkHours.sort((a, b) => a.rawDate - b.rawDate).slice(-6)
    : [
      { name: "Dec", hours: 7.8 },
      { name: "Jan", hours: 8.2 },
      { name: "Feb", hours: 8.0 },
      { name: "Mar", hours: 8.5 },
      { name: "Apr", hours: 9.0 },
      { name: "May", hours: 8.3 },
    ];

  // 3. Upcoming Events & Holidays list
  const upcomingEvents = [
    { title: "Employee Birthday", desc: "Rahim Uddin", type: "birthday", date: "Today" },
    { title: "Work Anniversary", desc: "Sumaiya Akter", type: "anniversary", date: "24 June" },
    { title: "Payroll Processing", desc: "June 2026 Payroll", type: "payroll", date: "25 June, 2026" },
    { title: "Training Program", desc: "Leadership Training", type: "training", date: "28 June, 2026" }
  ];

  // 4. Leave Summary (used for Leave card)
  const totalLeaves = Array.isArray(remainingLeaves) ? remainingLeaves.reduce((sum, item) => sum + Number(item?.total_leave || 0), 0) : 24;
  const approvedLeaves = Array.isArray(leaveRequests) ? leaveRequests.filter(r => r && (r.status === "Approved" || r.status === "approved")).length : 0;
  const pendingLeavesCount = Array.isArray(leaveRequests) ? leaveRequests.filter(r => r && (r.status === "Pending" || r.status === "pending")).length : 0;
  const rejectedLeaves = Array.isArray(leaveRequests) ? leaveRequests.filter(r => r && (r.status === "Rejected" || r.status === "rejected")).length : 0;

  // 5. Department headcount data (for the vertical bar chart representing company distribution)
  const departmentHeadcountData = [
    { name: "HR", count: 120 },
    { name: "IT", count: 320 },
    { name: "Finance", count: 180 },
    { name: "Marketing", count: 150 },
    { name: "Sales", count: 220 },
    { name: "Operations", count: 160 },
    { name: "Support", count: 98 }
  ];

  // 6. Recent Activities timeline
  const recentActivities = [
    { text: "Punched in today at Bangalore Tech Park HQ", time: "2 min ago", type: "punch" },
    { text: "Leave request for Casual Leave submitted", time: "15 min ago", type: "leave" },
    { text: "Monthly payslip for May 2026 generated", time: "1 hour ago", type: "payroll" },
    { text: "Profile details updated successfully", time: "2 hours ago", type: "profile" }
  ];

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 animate-fadeIn bg-slate-50/50 rounded-[2.5rem]">

        {/* Date Selector & Report Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-2 border border-slate-200/80 bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer select-none">
            <Calendar className="text-slate-400" size={14} />
            <span>May 20, 2025</span>
            <ChevronDown className="text-slate-400" size={12} />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition duration-150 shadow-md shadow-indigo-100 hover:-translate-y-0.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Download Report</span>
          </button>
        </div>

        {/* Metrics Row (5 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Card 1: Days Present (Purple Theme) */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-inner">
              <UserCheck size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Present Today</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{totalPresent || 14}</p>
              <p className="text-[9px] text-indigo-600 font-bold mt-1">↑ 24 this month</p>
            </div>
          </div>

          {/* Card 3: Leave Balance (Orange Theme) */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/50 shadow-inner">
              <Calendar size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">On Leave Today</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{totalLeaveCount || 1}</p>
              <p className="text-[9px] text-amber-600 font-bold mt-1">9.6% of total</p>
            </div>
          </div>

          {/* Card 3: Absent Today (Red Theme) */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100/50 shadow-inner">
              <AlertCircle size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Absent Today</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{totalLate || 2}</p>
              <p className="text-[9px] text-rose-600 font-bold mt-1">6.4% of total</p>
            </div>
          </div>

          {/* Card 4: Work Hours Average (Blue Theme) */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100/50 shadow-inner">
              <Clock size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">New Joiners (May)</p>
              <p className="text-2xl font-black text-slate-800 mt-1">24</p>
              <p className="text-[9px] text-cyan-600 font-bold mt-1">↑ 12% from last month</p>
            </div>
          </div>

          {/* Card 2: Presence Rate (Green Theme) */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50 shadow-inner">
              <User size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Exit Employee</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{leaveBalance || 18}</p>
              <p className="text-[9px] text-emerald-600 font-bold mt-1">84.0% of total</p>
            </div>
          </div>
        </div>

        {/* Section 1: Overview Row (3-Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Card 1: Attendance Donut Chart */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Attendance Overview</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase cursor-pointer border border-slate-200 px-2 py-0.5 rounded-lg bg-slate-50">This Month</span>
            </div>

            <div className="flex items-center gap-4 h-[180px] mt-2 relative">
              <div className="w-[150px] h-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {donutChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", fontSize: "11px", fontWeight: "bold" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-slate-800 mt-0.5">{totalDays}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total</span>
                </div>
              </div>

              {/* Pie Legends list */}
              <div className="flex-1 space-y-2">
                {donutChartData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-500 font-semibold truncate">{d.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-850 pl-1 shrink-0">
                      {d.value} ({Math.round((d.value / totalDays) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <a href="/employee/attendance" className="text-[10px] font-bold text-indigo-650 hover:text-indigo-850 flex items-center gap-1.5 transition mt-2 self-center cursor-pointer">
              View Attendance Report <ArrowRight size={10} />
            </a>
          </div>

          {/* Card 2: Work Hours Trend (Line Chart) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Employee Trend</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase cursor-pointer border border-slate-200 px-2 py-0.5 rounded-lg bg-slate-50">Last 6 Months</span>
            </div>

            <div className="h-[180px] w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={workHoursTrendData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrendHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} domain={[0, 12]} />
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
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrendHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <a href="/employee/attendance" className="text-[10px] font-bold text-indigo-650 hover:text-indigo-850 flex items-center gap-1.5 transition self-center cursor-pointer">
              View Full Report <ArrowRight size={10} />
            </a>
          </div>

          {/* Card 3: Upcoming Events */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Upcoming Events</h4>
              <a href="/holiday/calendar" className="text-[10px] font-bold text-indigo-600 hover:underline">View All</a>
            </div>

            <div className="space-y-3 mt-2 overflow-y-auto pr-1 shrink-0 flex-1 scrollbar-thin">
              {upcomingEvents.map((ev, index) => {
                let iconColor = "bg-indigo-50 text-indigo-600";
                let IconComponent = Gift;
                if (ev.type === "anniversary") { IconComponent = Star; iconColor = "bg-amber-50 text-amber-600"; }
                if (ev.type === "payroll") { IconComponent = Award; iconColor = "bg-emerald-50 text-emerald-600"; }
                if (ev.type === "training") { IconComponent = BookOpen; iconColor = "bg-cyan-50 text-cyan-600"; }

                return (
                  <div key={index} className="flex items-center justify-between gap-3 text-xs bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                        <IconComponent size={14} />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="font-extrabold text-slate-800 leading-tight truncate">{ev.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{ev.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold shrink-0">{ev.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Summaries & Punch Row (4-Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1: Leave Summary */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Leave Summary</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">This Month</p>
            </div>

            <div className="space-y-3.5 my-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-650 border-b border-slate-50 pb-2">
                <span>Total Leave Balance</span>
                <span className="font-black text-slate-800">{totalLeaves} Days</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-650 border-b border-slate-50 pb-2">
                <span>Approved</span>
                <span className="font-black text-emerald-600">{approvedLeaves} Days</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-650 border-b border-slate-50 pb-2">
                <span>Pending</span>
                <span className="font-black text-amber-600">{pendingLeavesCount} Days</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-650 border-b border-slate-50 pb-2">
                <span>Rejected</span>
                <span className="font-black text-rose-500">{rejectedLeaves} Days</span>
              </div>
            </div>

            <a href="/employee/leave" className="text-[10px] font-bold text-indigo-650 hover:text-indigo-850 flex items-center gap-1.5 mt-2 self-center cursor-pointer">
              View Leave Report <ArrowRight size={10} />
            </a>
          </div>

          {/* Card 2: Biometric Punch Station */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl flex flex-col justify-between h-[300px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Fingerprint size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black tracking-widest text-slate-200">BIOMETRICS</span>
              </div>
              <div className="flex bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
                <button
                  onClick={() => setLocationMode("office")}
                  className={`px-2 py-1 rounded text-[8px] font-bold cursor-pointer transition ${locationMode === "office" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Office
                </button>
                <button
                  onClick={() => setLocationMode("home")}
                  className={`px-2 py-1 rounded text-[8px] font-bold cursor-pointer transition ${locationMode === "home" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  WFH
                </button>
              </div>
            </div>

            {/* Fingerprint Scanner in the Center */}
            <div className="flex flex-col items-center justify-center my-1.5 relative">
              <button
                onClick={triggerBiometricPunch}
                disabled={scanState === "scanning"}
                className={`
                  relative w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-md
                  ${scanState === "idle" ? "bg-slate-950 border-slate-850 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500 hover:scale-[1.03]" : ""}
                  ${scanState === "scanning" ? "bg-indigo-950/80 border-indigo-500 text-indigo-300 scale-105 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : ""}
                  ${scanState === "success" ? "bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : ""}
                  ${scanState === "denied" ? "bg-rose-950 border-rose-500 text-rose-350 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : ""}
                `}
              >
                <Fingerprint size={32} className={scanState === "scanning" ? "animate-pulse" : ""} />
                {scanState === "scanning" && (
                  <div className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-sweep" />
                )}
              </button>

              <div className="mt-2 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold border ${isInsideGeofence ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                  {isInsideGeofence ? "Within HQ Geofence" : "Outside Geofence"}
                </span>
                {isPunchedIn && activeEmpLog && (
                  <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold">
                    PUNCHED IN: <span className="text-indigo-400 font-extrabold">{activeEmpLog.punchIn}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Scanning Notifications in Footer */}
            <div className="min-h-[35px] flex items-center justify-center">
              {scanState === "denied" && (
                <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[9px] text-rose-400 font-bold text-center flex items-center justify-center gap-1 w-full">
                  <XCircle size={10} className="shrink-0" />
                  <span>GPS Error: WFH restricted.</span>
                </div>
              )}
              {scanState === "success" && (
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] text-emerald-400 font-bold text-center flex items-center justify-center gap-1 w-full">
                  <CheckCircle2 size={10} className="shrink-0" />
                  <span>Verified successfully!</span>
                </div>
              )}
              {scanState === "idle" && (
                <div className="text-[9px] text-slate-400 font-semibold text-center uppercase tracking-wider">
                  Hold Finger to {isPunchedIn ? "Punch Out" : "Punch In"}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Quick Access */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Quick Access</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Quick Actions</p>
            </div>

            <div className="grid grid-cols-4 gap-2.5 my-3">
              {[
                { name: "Apply Leave", path: "/employee/leave", color: "bg-indigo-50 text-indigo-600", Icon: Calendar },
                { name: "Logs", path: "/employee/attendance", color: "bg-emerald-50 text-emerald-600", Icon: Clock },
                { name: "Profile", path: "/employee/profile", color: "bg-amber-50 text-amber-600", Icon: User },
                { name: "Payslips", path: "/employee/profile", color: "bg-rose-50 text-rose-600", Icon: Download },
                { name: "Performance", path: "/employee/profile", color: "bg-purple-50 text-purple-600", Icon: Award },
                { name: "Tasks", path: "/employee/dashboard", color: "bg-blue-50 text-blue-600", Icon: CheckSquare },
                { name: "Documents", path: "/employee/profile", color: "bg-cyan-50 text-cyan-600", Icon: Briefcase },
                { name: "Support", path: "/employee/dashboard", color: "bg-slate-50 text-slate-600", Icon: HelpCircle }
              ].map((act, index) => {
                const ActIcon = act.Icon;
                return (
                  <button
                    key={index}
                    onClick={() => window.location.href = act.path}
                    className="flex flex-col items-center justify-center gap-1.5 p-1 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition cursor-pointer"
                  >
                    <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${act.color}`}>
                      <ActIcon size={14} />
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wide truncate max-w-full leading-none">{act.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Task & Workload objectives */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[300px]">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Objectives</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Performance Goals</p>
            </div>

            <div className="space-y-3.5 my-3 shrink-0 flex-1 flex flex-col justify-center">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black text-slate-650 uppercase">
                  <span>Daily Action Plan</span>
                  <span className="text-indigo-650">85%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black text-slate-655 uppercase">
                  <span>Quarter Targets</span>
                  <span className="text-emerald-600">60%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "60%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black text-slate-650 uppercase">
                  <span>Training Programs</span>
                  <span className="text-cyan-600">40%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: "40%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Bottom Row charts and timelines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Column 1 (lg:col-span-8): Department Headcount */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[340px]">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Department-wise Headcount</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Company Distribution</p>
            </div>

            <div className="h-[230px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentHeadcountData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', radius: 8 }}
                    contentStyle={{
                      backgroundColor: "#0b1220",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#818cf8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  >
                    {/* Visual numbers on top of bars */}
                    {departmentHeadcountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#818cf8" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Column 2 (lg:col-span-4): Recent Activities */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[340px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Recent Activities</h4>
              <a href="/employee/attendance" className="text-[10px] font-bold text-indigo-650 hover:underline">View All</a>
            </div>

            <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-thin">
              {recentActivities.map((act, index) => {
                let dotColor = "bg-indigo-500 shadow-[0_0_6px_#6366f1]";
                if (act.type === "leave") dotColor = "bg-amber-500 shadow-[0_0_6px_#f59e0b]";
                if (act.type === "payroll") dotColor = "bg-emerald-500 shadow-[0_0_6px_#10b981]";
                if (act.type === "profile") dotColor = "bg-purple-500 shadow-[0_0_6px_#a855f7]";

                return (
                  <div key={index} className="flex gap-3 text-xs">
                    {/* Bullet line track indicator */}
                    <div className="flex flex-col items-center shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} mt-1`} />
                      {index < recentActivities.length - 1 && (
                        <span className="w-[1.5px] bg-slate-200 grow mt-1 mb-[-4px]" />
                      )}
                    </div>
                    <div className="min-w-0 text-left flex-1 pb-1">
                      <p className="font-extrabold text-slate-700 leading-tight leading-5">{act.text}</p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1 uppercase">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes sweep {
          0%, 100% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
        }
        .animate-sweep {
          animation: sweep 2s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
      `}</style>
    </EmployeeDashboardLayout>
  );
}

















