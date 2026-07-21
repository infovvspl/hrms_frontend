import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaClock,
  FaMapMarkerAlt,
  FaSearch,
  FaCalendarAlt,
  FaCheck,
  FaDownload,
  FaUserFriends,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
} from "react-icons/fa";
import DashboardLayout from "../../layouts/DashboardLayout";

const LOG_API = "http://localhost:5000/api/attendance/logs";
const DEPARTMENT_API = "http://localhost:5000/api/departments";
const EMPLOYEE_API = "http://localhost:5000/api/employees";
const SHIFT_API = "http://localhost:5000/api/attendance/shifts";
const MANUAL_ADD_API = "http://localhost:5000/api/attendance/manual";

export default function DailyTracking() {
  const [logs, setLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    empId: "",
    shiftId: "",
    date: new Date().toISOString().split("T")[0],
    punchInTime: "09:00",
    punchOutTime: "18:00"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (manualForm.empId) {
      const selectedEmp = employees.find(e => String(e.id) === String(manualForm.empId));
      if (selectedEmp && selectedEmp.shift_id) {
        setManualForm(prev => ({ ...prev, shiftId: String(selectedEmp.shift_id) }));
      }
    }
  }, [manualForm.empId, employees]);

  const loadData = async () => {
    try {
      const [logRes, deptRes, empRes, shiftRes] = await Promise.all([
        axios.get(LOG_API, { headers }),
        axios.get(DEPARTMENT_API, { headers }),
        axios.get(EMPLOYEE_API, { headers }),
        axios.get(SHIFT_API, { headers })
      ]);

      const logData = logRes.data.logs || logRes.data || [];
      const deptData = deptRes.data.departments || deptRes.data || [];
      const empData = empRes.data.employees || empRes.data || [];
      const shiftData = shiftRes.data.shifts || shiftRes.data || [];

      setDepartments(deptData);
      setEmployees(empData.map(e => ({
        ...e,
        name: e.name || `${e.first_name || ""} ${e.last_name || ""}`.trim()
      })));
      setShifts(shiftData);

      const formattedLogs = logData.map((l, index) => {
        const punchInDate = l.punch_in_at ? new Date(l.punch_in_at) : null;
        const punchOutDate = l.punch_out_at ? new Date(l.punch_out_at) : null;

        let dateStr = null;
        if (punchInDate) {
          const year = punchInDate.getFullYear();
          const month = String(punchInDate.getMonth() + 1).padStart(2, "0");
          const day = String(punchInDate.getDate()).padStart(2, "0");
          dateStr = `${year}-${month}-${day}`;
        }

        // Find all logs for the same employee on the same day to sum worked hours
        const sameDayLogs = logData.filter(otherLog => {
          if (!otherLog.punch_in_at || !l.punch_in_at) return false;
          if (String(otherLog.user_id) !== String(l.user_id)) return false;
          return new Date(otherLog.punch_in_at).toDateString() === new Date(l.punch_in_at).toDateString();
        });

        // Determine punchStatus based on the first punch-in of the day
        let punchStatus = "On Time";
        const firstPunchOfDay = sameDayLogs.length > 0 ? sameDayLogs[sameDayLogs.length - 1] : l;
        const firstPunchInDate = firstPunchOfDay.punch_in_at ? new Date(firstPunchOfDay.punch_in_at) : null;
        if (firstPunchInDate && l.shift_start_time && firstPunchInDate.toLocaleTimeString("en-GB") > l.shift_start_time) {
          punchStatus = "Late Check-in";
        }
        if (!firstPunchInDate) {
          punchStatus = "Absent";
        }

        // Sum durations of all sessions on that day
        let totalMs = 0;
        let isActive = false;
        sameDayLogs.forEach(otherLog => {
          if (otherLog.punch_in_at) {
            const start = new Date(otherLog.punch_in_at);
            if (otherLog.punch_out_at) {
              const end = new Date(otherLog.punch_out_at);
              const diff = end - start;
              if (diff > 0) totalMs += diff;
            } else {
              // Clocked in but not clocked out yet
              const isToday = new Date(otherLog.punch_in_at).toDateString() === new Date().toDateString();
              const end = isToday ? new Date() : start;
              const diff = end - start;
              if (diff > 0) totalMs += diff;
              isActive = true;
            }
          }
        });

        let hoursWorked = "--";
        if (totalMs > 0) {
          const diffHrs = Math.floor(totalMs / 3600000);
          const diffMins = Math.floor((totalMs % 3600000) / 60000);
          hoursWorked = `${diffHrs}h ${diffMins}m${isActive ? " (Active)" : ""}`;
        }

        const punchType = l.punch_type || 'biometric';
        let gpsStatus = punchInDate ? "Inside Geofence" : "Out of Bounds";
        let bioStatus = punchInDate ? "Verified" : "Failed";
        if (punchType === 'manual') {
          gpsStatus = "N/A (Manual)";
          bioStatus = "HR Approved";
        }

        return {
          id: `L${String(index + 1).padStart(3, '0')}`,
          empId: l.employee_code || `EMP-${l.user_id}`,
          name: l.employee_name || "",
          dept: l.department || "Engineering",
          shift: l.shift_name || "General Shift",
          punchIn: punchInDate ? punchInDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          punchOut: punchOutDate ? punchOutDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--",
          hours: hoursWorked,
          gps: gpsStatus,
          bio: bioStatus,
          status: punchStatus,
          date: dateStr,
          punchType: punchType
        };
      });

      setLogs(formattedLogs);

      if (formattedLogs.length > 0) {
        const datesInLogs = formattedLogs.map(l => l.date).filter(Boolean);
        if (datesInLogs.length > 0) {
          const maxDate = datesInLogs.reduce((max, d) => (d > max ? d : max), datesInLogs[0]);
          setSelectedDate(maxDate);
        }
      }
    } catch (err) {
      console.error("Failed to load daily tracking logs:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Search and Filtering
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.empId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !selectedDept || log.dept === selectedDept;
    const matchesShift = !selectedShift || log.shift.includes(selectedShift);
    const matchesStatus = !selectedStatus || log.status === selectedStatus;
    const matchesDate = !selectedDate || log.date === selectedDate;

    return matchesSearch && matchesDept && matchesShift && matchesStatus && matchesDate;
  });

  // Keep only the latest log for each employee on the selected date to guarantee uniqueness
  const uniqueFilteredLogs = [];
  const seenEmployees = new Set();
  for (const log of filteredLogs) {
    if (!seenEmployees.has(log.empId)) {
      seenEmployees.add(log.empId);
      uniqueFilteredLogs.push(log);
    }
  }

  // Unique departments & shifts for dropdown filters
  const departmentsList = Array.from(new Set(logs.map((l) => l.dept)));
  const shiftsList = Array.from(new Set(logs.map((l) => l.shift).filter(Boolean)));

  // Metrics calculations
  const totalEmployees = Array.from(new Set(logs.map(l => l.empId))).length;
  const presentCount = uniqueFilteredLogs.filter((l) => l.punchIn !== "--:--").length;
  const absentCount = Math.max(0, totalEmployees - presentCount);
  const leaveCount = uniqueFilteredLogs.filter((l) => l.status === "On Leave").length;
  const lateCount = uniqueFilteredLogs.filter((l) => l.date === selectedDate && l.status === "Late Check-in").length;

  // Handle CSV Export Simulation
  const handleExportCSV = () => {
    const csvHeaders = ["Log ID", "Employee ID", "Name", "Department", "Shift", "Punch In", "Punch Out", "Hours Worked", "GPS Status", "Biometrics", "Status"];
    const csvRows = uniqueFilteredLogs.map(l => [l.id, l.empId, l.name, l.dept, l.shift, l.punchIn, l.punchOut, l.hours, l.gps, l.bio, l.status]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [csvHeaders.join(","), ...csvRows.map(row => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Attendance_Logs_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddManual = async (e) => {
    e.preventDefault();
    try {
      const punchInAt = `${manualForm.date}T${manualForm.punchInTime}:00`;
      const punchOutAt = `${manualForm.date}T${manualForm.punchOutTime}:00`;

      await axios.post(
        MANUAL_ADD_API,
        {
          user_id: manualForm.empId,
          shift_id: manualForm.shiftId,
          punch_in_at: punchInAt,
          punch_out_at: punchOutAt
        },
        { headers }
      );

      setShowManualModal(false);
      alert("Manual attendance added successfully.");
      await loadData();
    } catch (err) {
      console.error("Failed to add manual attendance:", err);
      alert(err.response?.data?.message || "Failed to add manual attendance.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* METRIC CARD PANEL */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <FaUserFriends size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Staff</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">{totalEmployees}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <FaCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Present Today</p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{presentCount}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Late Check-ins</p>
              <p className="text-2xl font-black text-amber-600 mt-0.5">{lateCount}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
              <FaExclamationTriangle size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Absent Today</p>
              <p className="text-2xl font-black text-rose-600 mt-0.5">{absentCount}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center gap-4 col-span-2 lg:col-span-1">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
              <FaCalendarAlt size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">On Leave</p>
              <p className="text-2xl font-black text-indigo-600 mt-0.5">{leaveCount}</p>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex justify-end gap-3 w-full">
          <button
            onClick={() => {
              setManualForm({
                empId: employees.length > 0 ? String(employees[0].id) : "",
                shiftId: shifts.length > 0 ? String(shifts[0].id) : "",
                date: new Date().toISOString().split("T")[0],
                punchInTime: "09:00",
                punchOutTime: "18:00"
              });
              setShowManualModal(true);
            }}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer border border-indigo-500/20"
          >
            Add Manual Entry
          </button>
          <button
            onClick={handleExportCSV}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <FaDownload size={12} /> Export Daily CSV
          </button>
        </div>

        {/* SEARCH & FILTERS PANEL */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
              <FaFilter size={12} />
            </div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Search & Filter Directory</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
              />
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
            </div>

            {/* Department Selection */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">All Departments</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Shift Selection */}
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">All Shifts</option>
              {shiftsList.map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>

            {/* Status Selection */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="On Time">On Time</option>
              <option value="Late Check-in">Late Check-in</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>

            {/* Date Selection */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* MAIN DATA TABLE */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">Workforce Daily Attendance Logs</h4>
              <p className="text-[10px] text-slate-400 font-bold">RECORDS MATCHING CURRENT SELECTIONS</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-black px-3 py-1.5 rounded-xl border border-slate-200/50">
              Showing {uniqueFilteredLogs.length} of {totalEmployees} Logs
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-3xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Staff Member", "Department", "Work Shift", "Punch In", "Punch Out", "Total Hours", "Geofence Check", "Biometrics", "Check-in Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {uniqueFilteredLogs.length > 0 ? (
                  uniqueFilteredLogs.map((log) => {
                    const isLate = log.status === "Late Check-in";
                    const isAbsent = log.status === "Absent";
                    const isLeave = log.status === "On Leave";

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/40 transition">
                        {/* Profile */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-slate-800">{log.name}</p>
                            <p className="text-[9px] text-slate-400 font-black">{log.empId}</p>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-5 py-4 text-slate-500 font-medium">{log.dept}</td>

                        {/* Shift */}
                        <td className="px-5 py-4 text-slate-500 font-medium">{log.shift}</td>

                        {/* Punch In / Out */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-800">
                            {log.punchIn !== "--:--" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                            {log.punchIn}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            {log.punchOut !== "--:--" && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                            {log.punchOut}
                          </div>
                        </td>

                        {/* Hours */}
                        <td className="px-5 py-4 font-mono font-bold text-slate-600">{log.hours}</td>

                        {/* GPS Verification */}
                        <td className="px-5 py-4">
                          {log.gps !== "--" && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${log.gps === "Inside Geofence"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : log.gps === "N/A (Manual)"
                                  ? "bg-slate-50 text-slate-500 border-slate-100"
                                  : "bg-rose-50 text-rose-700 border-rose-100"
                              }`}>
                              <FaMapMarkerAlt size={8} /> {log.gps}
                            </span>
                          )}
                          {log.gps === "--" && <span className="text-slate-400">-</span>}
                        </td>

                        {/* Biometrics */}
                        <td className="px-5 py-4">
                          {log.bio !== "--" && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${log.bio === "Verified"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : log.bio === "HR Approved"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                  : "bg-rose-50 text-rose-600 border-rose-100"
                              }`}>
                              {log.bio}
                            </span>
                          )}
                          {log.bio === "--" && <span className="text-slate-400">-</span>}
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`
                              inline-flex items-center gap-1
                              px-2.5 py-0.5
                              rounded-full
                              text-[9px]
                              font-bold
                              border
                              ${isLate ? "bg-amber-50 text-amber-700 border-amber-100" : ""}
                              ${isAbsent ? "bg-rose-50 text-rose-700 border-rose-100" : ""}
                              ${isLeave ? "bg-indigo-50 text-indigo-700 border-indigo-100" : ""}
                              ${!isLate && !isAbsent && !isLeave ? "bg-emerald-50 text-emerald-700 border-emerald-100" : ""}
                            `}
                          >
                            <span className={`w-1 h-1 rounded-full ${isLate ? "bg-amber-500" :
                                isAbsent ? "bg-rose-500" :
                                  isLeave ? "bg-indigo-500" : "bg-emerald-500"
                              }`} />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">📋</span>
                        <p className="font-semibold text-slate-600">No Logs Found</p>
                        <p className="text-xs text-slate-400">Try adjusting your filter search criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white relative">
              <h3 className="font-extrabold text-md">Add Manual Attendance</h3>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-0.5">HRMS Override</p>
              <button
                onClick={() => setShowManualModal(false)}
                className="absolute right-4 top-4 text-white/70 hover:text-white transition cursor-pointer text-sm font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManual} className="p-6 space-y-4">
              {/* Employee field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block select-none">
                  Select Employee
                </label>
                <select
                  value={manualForm.empId}
                  onChange={(e) => setManualForm(prev => ({ ...prev, empId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 outline-none"
                  required
                >
                  <option value="">Choose Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (ID #{emp.company_employee_id || emp.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Shift field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block select-none">
                  Select Shift Slot
                </label>
                <select
                  value={manualForm.shiftId}
                  onChange={(e) => setManualForm(prev => ({ ...prev, shiftId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 outline-none"
                  required
                >
                  <option value="">Choose Shift...</option>
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.shift_name} ({s.start_time} - {s.end_time})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block select-none">
                  Date
                </label>
                <input
                  type="date"
                  value={manualForm.date}
                  onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 outline-none bg-white"
                  required
                />
              </div>

              {/* Punch Times row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block select-none">
                    Punch In Time
                  </label>
                  <input
                    type="time"
                    value={manualForm.punchInTime}
                    onChange={(e) => setManualForm(prev => ({ ...prev, punchInTime: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 outline-none bg-white"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block select-none">
                    Punch Out Time
                  </label>
                  <input
                    type="time"
                    value={manualForm.punchOutTime}
                    onChange={(e) => setManualForm(prev => ({ ...prev, punchOutTime: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 outline-none bg-white"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow shadow-indigo-600/20 cursor-pointer"
                >
                  Add Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
