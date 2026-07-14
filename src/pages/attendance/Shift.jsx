import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaClock,
  FaCalendarAlt,
  FaUserFriends,
  FaPlus,
  FaUserTie,
} from "react-icons/fa";
import DashboardLayout from "../../layouts/DashboardLayout";

const SHIFT_API = "http://localhost:5000/api/attendance/shifts";
const ASSIGNMENT_API = "http://localhost:5000/api/attendance/assignments";
const ASSIGN_POST_API = "http://localhost:5000/api/attendance/assign";
const EMPLOYEE_API = "http://localhost:5000/api/employees";

export default function Shift() {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ empId: "", shiftId: "" });

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const loadData = async () => {
    try {
      const [shiftRes, empRes, assignRes] = await Promise.all([
        axios.get(SHIFT_API, { headers }),
        axios.get(EMPLOYEE_API, { headers }),
        axios.get(ASSIGNMENT_API, { headers })
      ]);

      const shiftData = shiftRes.data.shifts || shiftRes.data || [];
      const empData = empRes.data.employees || empRes.data || [];
      const assignData = assignRes.data.assignments || assignRes.data || [];

      // Format shifts
      const colors = [
        "from-blue-500 to-cyan-500",
        "from-amber-500 to-orange-500",
        "from-indigo-500 to-purple-500",
        "from-emerald-500 to-teal-500"
      ];
      const texts = ["text-blue-600", "text-amber-600", "text-indigo-600", "text-emerald-600"];
      
      const formatTo12Hour = (timeStr) => {
        if (!timeStr) return "--:--";
        const parts = timeStr.split(":");
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1] || "00";
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = String(hours).padStart(2, "0");
        return `${hoursStr}:${minutes} ${ampm}`;
      };

      const formattedShifts = shiftData.map((s, idx) => ({
        id: s.id,
        name: s.shift_name,
        startTime: formatTo12Hour(s.start_time),
        endTime: formatTo12Hour(s.end_time),
        hours: "8 hrs",
        color: colors[idx % colors.length],
        text: texts[idx % texts.length]
      }));

      setShifts(formattedShifts);

      // Format employees
      const formattedEmployees = empData.map(e => {
        const assigned = assignData.find(a => String(a.user_id) === String(e.id));
        return {
          id: e.id,
          empCode: e.company_employee_id || e.id,
          name: e.name || `${e.first_name || ""} ${e.last_name || ""}`.trim(),
          email: e.email,
          shiftId: assigned ? assigned.shift_id : null,
          shiftName: assigned ? assigned.shift_name : "Unscheduled"
        };
      });

      setEmployees(formattedEmployees);
    } catch (err) {
      console.error("Load shifts/employees error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignShift = async (e) => {
    e.preventDefault();
    try {
      await axios.post(ASSIGN_POST_API, {
        user_id: assignData.empId,
        shift_id: assignData.shiftId
      }, { headers });

      setShowAssignModal(false);
      await loadData();
      alert("Shift assigned successfully.");
    } catch (err) {
      console.error("Assign shift error:", err);
      alert("Failed to assign shift.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#08112d] via-[#151a5a] to-[#08112d] rounded-3xl p-6 text-white border border-white/10 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 space-y-1">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
              Shift Management
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
              Workforce Shift Scheduling
            </h1>
            <p className="text-slate-300 text-xs font-semibold">
              Configure timing slots and assign shifts to employee profiles.
            </p>
          </div>

          <button
            onClick={() => {
              setAssignData({
                empId: employees.length > 0 ? employees[0].id : "",
                shiftId: shifts.length > 0 ? shifts[0].id : ""
              });
              setShowAssignModal(true);
            }}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer z-10"
          >
            <FaPlus size={10} /> Assign Shift
          </button>
        </div>

        {/* Shift Timings Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {shifts.map((s) => {
            const membersCount = employees.filter(e => e.shiftId === s.id).length;
            return (
              <div
                key={s.id}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-slate-200 hover:shadow-md transition duration-300"
              >
                <div className={`absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r ${s.color}`} />
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h5 className="font-extrabold text-slate-800 text-xs">{s.name}</h5>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-50 border border-slate-100 ${s.text}`}>
                      {s.hours}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
                    <FaClock size={11} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">{s.startTime}</span>
                    <span className="text-slate-300">—</span>
                    <span className="font-semibold text-slate-700">{s.endTime}</span>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <FaUserFriends size={11} /> Assigned Staff
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {membersCount} members
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rota List Table */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">Staff Shift Assignment Rota</h4>
            <p className="text-[10px] text-slate-400 font-bold">CURRENT ROSTER ASSIGNMENT SYSTEM</p>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-3xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Staff Name", "Employee ID", "Work Email", "Scheduled Shift"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {employees.map((emp) => {
                  const s = shifts.find(sh => sh.id === emp.shiftId);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/40 font-semibold text-slate-700">
                      <td className="px-5 py-4 font-bold text-slate-800 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-black">
                          {emp.name.charAt(0)}
                        </div>
                        {emp.name}
                      </td>
                      <td className="px-5 py-4 text-slate-400 font-bold">{emp.empCode}</td>
                      <td className="px-5 py-4 text-slate-500 font-medium">{emp.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 font-bold ${s ? s.text : "text-slate-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s ? "bg-indigo-500" : "bg-slate-400"}`} />
                          {s ? s.name : "Unscheduled"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Shift Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white relative">
              <h3 className="font-extrabold text-md">Assign Staff Shift</h3>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-0.5">HRMS Schedulers</p>
              <button
                onClick={() => setShowAssignModal(false)}
                className="absolute right-4 top-4 text-white/70 hover:text-white transition cursor-pointer text-sm font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignShift} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block select-none">
                  Select Employee
                </label>
                <select
                  value={assignData.empId}
                  onChange={(e) => setAssignData(prev => ({ ...prev, empId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 outline-none"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (ID #{emp.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block select-none">
                  Select Shift Slot
                </label>
                <select
                  value={assignData.shiftId}
                  onChange={(e) => setAssignData(prev => ({ ...prev, shiftId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 outline-none"
                >
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow shadow-indigo-600/20 cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
