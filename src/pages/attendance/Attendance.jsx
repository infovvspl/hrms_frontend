import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaChevronLeft, 
  FaChevronRight, 
  FaUserCheck, 
  FaSpinner,
  FaDownload,
  FaCheckCircle,
  FaArrowRight
} from "react-icons/fa";
import DashboardLayout from "../../layouts/DashboardLayout";

const EMPLOYEE_API = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/employees`;
const LOG_API = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/attendance/logs`;

export default function Attendance() {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar Month State
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, logRes] = await Promise.all([
        axios.get(EMPLOYEE_API, { headers }).catch(() => ({ data: { employees: [] } })),
        axios.get(LOG_API, { headers }).catch(() => ({ data: { logs: [] } }))
      ]);

      const empData = empRes.data.employees || empRes.data || [];
      const logData = logRes.data.logs || logRes.data || [];

      setEmployees(empData.map(e => ({
        ...e,
        name: e.name || `${e.first_name || ""} ${e.last_name || ""}`.trim()
      })));

      const formattedLogs = logData.map(l => {
        const punchInDate = l.punch_in_at ? new Date(l.punch_in_at) : null;
        const punchOutDate = l.punch_out_at ? new Date(l.punch_out_at) : null;
        
        return {
          id: `LOG-${l.id}`,
          employeeId: l.employee_code || `EMP-${l.user_id}`,
          employeeName: l.employee_name || "",
          shiftName: l.shift_name || "General Shift",
          punchIn: punchInDate ? punchInDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          punchOut: punchOutDate ? punchOutDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          status: punchInDate && l.shift_start_time ? 
            (punchInDate.toLocaleTimeString("en-GB") > l.shift_start_time ? "Late Check-in" : "On Time") : "On Time",
          punchInRaw: l.punch_in_at,
          userId: l.user_id
        };
      });
      setLogs(formattedLogs);
    } catch (error) {
      console.error("Fetch attendance data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calendar Helpers
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  // REAL Today Stats Filtering
  const yearStr = today.getFullYear();
  const monthStr = String(today.getMonth() + 1).padStart(2, "0");
  const dayStr = String(today.getDate()).padStart(2, "0");
  const todayDateStr = `${yearStr}-${monthStr}-${dayStr}`;

  const logsToday = logs.filter(l => {
    if (!l.punchInRaw) return false;
    const d = new Date(l.punchInRaw);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}` === todayDateStr;
  });

  const totalLogsToday = logsToday.length;
  const activePunches = logsToday.filter(l => l.punchOut === "--:--").length;
  const totalEmployeesCount = employees.length || 1;

  // Real Monthly Analytics calculations (based on past weekdays)
  let totalWorkSlots = 0;
  let actualPunches = 0;
  let onTimePunches = 0;
  
  const todayMidnight = new Date();
  todayMidnight.setHours(0,0,0,0);

  employees.forEach(emp => {
    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const cellDate = new Date(currentYear, currentMonth, dNum);
      if (cellDate > todayMidnight) continue; // Skip future dates
      
      const dayOfWeek = cellDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends
      
      totalWorkSlots++;
      
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      const dayLogs = logs.filter(l => {
        if (!l.punchInRaw) return false;
        const isMatch = String(l.employeeId) === String(emp.company_employee_id) || String(l.userId) === String(emp.id);
        if (!isMatch) return false;
        const d = new Date(l.punchInRaw);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}` === dateStr;
      });

      if (dayLogs.length > 0) {
        actualPunches++;
        const isAnyLate = dayLogs.some(l => l.status.includes("Late"));
        if (!isAnyLate) {
          onTimePunches++;
        }
      }
    }
  });

  const presenceRate = totalWorkSlots > 0 ? Math.min(100, Math.round((actualPunches / totalWorkSlots) * 100)) : 100;
  const onTimeRate = actualPunches > 0 ? Math.round((onTimePunches / actualPunches) * 100) : 100;

  // Helper status checks for attendance sheet cells
  const getStatusForEmployeeOnDate = (empCode, dbId, dayNum) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const cellDate = new Date(currentYear, currentMonth, dayNum);

    const empLogs = logs.filter(l => {
      if (!l.punchInRaw) return false;
      const isMatch = String(l.employeeId) === String(empCode) || String(l.userId) === String(dbId);
      if (!isMatch) return false;
      const d = new Date(l.punchInRaw);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}` === dateStr;
    });

    if (empLogs.length > 0) {
      const isAnyLate = empLogs.some(l => l.status.includes("Late"));
      return isAnyLate ? "L" : "P";
    }

    if (cellDate > todayMidnight) {
      return "-";
    }

    const dayOfWeek = cellDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "W";
    }

    return "A";
  };

  // Monthly CSV Exporter
  const handleDownloadMonthlyCSV = () => {
    const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    const csvHeaders = ["Employee ID", "Employee Name", ...dayHeaders, "Total Present", "Total Late", "Total Absent"];
    
    const csvRows = employees.map(emp => {
      const empId = emp.company_employee_id || `EMP-${emp.id}`;
      const empName = emp.name;
      
      let present = 0;
      let late = 0;
      let absent = 0;
      
      const rowDays = Array.from({ length: daysInMonth }, (_, i) => {
        const status = getStatusForEmployeeOnDate(emp.company_employee_id, emp.id, i + 1);
        if (status === "P") present++;
        if (status === "L") late++;
        if (status === "A") absent++;
        return status;
      });

      return [
        empId,
        `"${empName.replace(/"/g, '""')}"`,
        ...rowDays,
        present,
        late,
        absent
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [csvHeaders.join(","), ...csvRows.map(row => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Monthly_Attendance_Sheet_${monthNames[currentMonth]}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
         <div className="space-y-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 animate-fadeIn bg-slate-50/50 rounded-[2.5rem]">
        
        {/* Corporate Style KPI Statistics row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Real Present Today */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50 shadow-inner">
              <FaUserCheck size={20} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Present Today</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{totalLogsToday}</p>
            </div>
          </div>
          
          {/* Active shifts today */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50 shadow-inner">
              <FaCheckCircle size={20} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Active Shifts</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{activePunches}</p>
            </div>
          </div>

          {/* Monthly On-Time Rate */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/50 shadow-inner">
              <FaClock size={20} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Month On-Time Rate</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{onTimeRate}%</p>
            </div>
          </div>

          {/* Monthly Presence Rate */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-inner">
              <FaCalendarAlt size={20} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Month Presence Rate</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{presenceRate}%</p>
            </div>
          </div>
        </div>

        {/* Dedicated Monthly Attendance Sheet Grid Card */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="text-left font-semibold">
              <h3 className="font-extrabold text-slate-800 text-lg">
                Monthly Sheet Matrix — {monthNames[currentMonth]} {currentYear}
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Comprehensive calendar overview of daily employee check-in sessions.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              
              {/* Month Adjuster Control */}
              <div className="flex items-center bg-slate-105 p-1 rounded-xl border border-slate-200/40 bg-slate-100">
                <button 
                  onClick={prevMonth}
                  className="p-2 hover:bg-white rounded-lg text-slate-600 transition cursor-pointer"
                >
                  <FaChevronLeft size={10} />
                </button>
                <span className="px-3 text-xs font-black text-slate-705 uppercase">
                  {monthNames[currentMonth].substring(0, 3)}
                </span>
                <button 
                  onClick={nextMonth}
                  className="p-2 hover:bg-white rounded-lg text-slate-600 transition cursor-pointer"
                >
                  <FaChevronRight size={10} />
                </button>
              </div>

              {/* Monthly CSV Exporter Trigger */}
              <button 
                onClick={handleDownloadMonthlyCSV}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-755 text-white hover:bg-blue-700 rounded-xl text-xs font-black transition flex items-center gap-2 shadow shadow-blue-150 cursor-pointer"
              >
                <FaDownload /> Download Monthly CSV
              </button>
            </div>
          </div>

          {/* Grid spreadsheet Table */}
          <div className="overflow-x-auto border border-slate-200/70 rounded-2xl max-w-full">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 w-44">
                    Staff Member
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <th key={i} className="px-1 py-3 text-[9px] font-black text-slate-400 uppercase text-center w-8 border-l border-slate-100">
                      {i + 1}
                    </th>
                  ))}
                  <th className="px-2 py-3 text-[9px] font-black text-emerald-600 uppercase text-center w-12 border-l border-slate-200">
                    P
                  </th>
                  <th className="px-2 py-3 text-[9px] font-black text-amber-600 uppercase text-center w-12 border-l border-slate-100">
                    L
                  </th>
                  <th className="px-2 py-3 text-[9px] font-black text-rose-600 uppercase text-center w-12 border-l border-slate-100">
                    A
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={daysInMonth + 4} className="text-center py-12 text-slate-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-blue-600" size={14} />
                        <span>Rendering sheets database...</span>
                      </div>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={daysInMonth + 4} className="text-center py-12 text-slate-400 font-bold">
                      No employees records registered.
                    </td>
                  </tr>
                ) : (
                  employees.map(emp => {
                    let present = 0;
                    let late = 0;
                    let absent = 0;

                    const rowCells = Array.from({ length: daysInMonth }, (_, idx) => {
                      const dayNum = idx + 1;
                      const status = getStatusForEmployeeOnDate(emp.company_employee_id, emp.id, dayNum);
                      
                      if (status === "P") present++;
                      if (status === "L") late++;
                      if (status === "A") absent++;
                      
                      return { dayNum, status };
                    });

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/40 transition duration-100 border-b border-slate-100 last:border-0">
                        {/* Sticky Employee Name Column */}
                        <td className="px-4 py-3 sticky left-0 bg-white border-r border-slate-150 z-10 font-bold text-slate-800 text-left">
                          <p className="truncate w-36 leading-tight" title={emp.name}>{emp.name}</p>
                          <p className="text-[8px] text-slate-400 font-black mt-0.5">{emp.company_employee_id || `EMP-${emp.id}`}</p>
                        </td>

                        {/* Day Columns */}
                        {rowCells.map(cell => {
                          const isP = cell.status === "P";
                          const isL = cell.status === "L";
                          const isA = cell.status === "A";
                          const isW = cell.status === "W";

                          return (
                            <td key={cell.dayNum} className="px-1 py-3 text-center border-l border-slate-100">
                              {isP && <span className="w-5.5 h-5.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-black mx-auto text-[9px]">P</span>}
                              {isL && <span className="w-5.5 h-5.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-black mx-auto text-[9px]">L</span>}
                              {isA && <span className="w-5.5 h-5.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center font-black mx-auto text-[9px]">A</span>}
                              {isW && <span className="text-[9px] text-slate-300 font-bold">W</span>}
                              {cell.status === "-" && <span className="text-slate-300">-</span>}
                            </td>
                          );
                        })}

                        {/* Totals */}
                        <td className="px-2 py-3 text-center font-black text-emerald-600 border-l border-slate-200 bg-slate-50/50">
                          {present}
                        </td>
                        <td className="px-2 py-3 text-center font-black text-amber-600 border-l border-slate-100 bg-slate-50/50">
                          {late}
                        </td>
                        <td className="px-2 py-3 text-center font-black text-rose-600 border-l border-slate-100 bg-slate-50/50">
                          {absent}
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
      `}</style>
    </DashboardLayout>
  );
}
