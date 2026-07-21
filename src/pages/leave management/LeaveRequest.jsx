import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Trash2,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  FileText
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const API_BASE = import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000";

export default function LeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [remainingLeaves, setRemainingLeaves] = useState([]);

  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("Pending"); // Default to pending for inbox focus

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // ================= FETCH DATA =================
  const fetchAllData = async () => {
    try {
      const [reqsRes, typesRes, remainRes] = await Promise.all([
        axios.get(`${API_BASE}/api/leaves`, { headers }),
        axios.get(`${API_BASE}/api/leave-types`, { headers }),
        axios.get(`${API_BASE}/api/leaves/remaining`, { headers }),
      ]);

      const requestsList = reqsRes.data.leaveRequests || [];
      setLeaveRequests(requestsList);
      setLeaveTypes(typesRes.data.leaveTypes || []);
      setRemainingLeaves(remainRes.data.remainingLeaves || []);

      // Auto-select the first request in the filtered list if none is selected
      if (requestsList.length > 0 && !selectedRequestId) {
        // Find first pending one
        const firstPending = requestsList.find(r => r.status === "Pending");
        setSelectedRequestId(firstPending ? firstPending.id : requestsList[0].id);
      }
    } catch (error) {
      console.error("Error fetching leave requests data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // ================= ACTIONS =================
  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.put(`${API_BASE}/api/leaves/${id}/status`, { status }, { headers });
      if (res.data.success) {
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update leave status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;

    try {
      const res = await axios.delete(`${API_BASE}/api/leaves/${id}`, { headers });
      if (res.data.success) {
        setSelectedRequestId(null);
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      alert(error.response?.data?.message || "Failed to delete leave request");
    }
  };

  const calculateDuration = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // ================= FILTERING =================
  const filteredRequests = leaveRequests.filter((req) => {
    const fullName = `${req.first_name || ""} ${req.last_name || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesType = filterLeaveType === "All" || String(req.leave_types) === filterLeaveType;
    const matchesStatus = filterStatus === "All" || req.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedRequest = leaveRequests.find(r => r.id === selectedRequestId);

  // Remaining leave details lookup helper
  const getEmployeeBalanceForType = (userId, leaveTypeId) => {
    const record = remainingLeaves.find(
      (b) => b.user_id === userId && String(b.leave_types) === String(leaveTypeId)
    );
    return record
      ? { balance: parseFloat(record.balance_leave), total: parseFloat(record.total_leave) }
      : { balance: 0, total: 0 };
  };

  // Overlap Conflicts Checker helper
  const getConflictingRequests = (req) => {
    if (!req) return [];
    const deptName = req.department_name;
    const start = new Date(req.from_date);
    const end = new Date(req.to_date);

    return leaveRequests.filter((other) => {
      // Must be same department, different employee, and approved/pending
      if (other.id === req.id) return false;
      if (other.user_id === req.user_id) return false;
      if (other.department_name !== deptName) return false;
      if (other.status === "Rejected") return false;

      const otherStart = new Date(other.from_date);
      const otherEnd = new Date(other.to_date);

      // Check date overlaps
      return start <= otherEnd && end >= otherStart;
    });
  };

  const conflicts = getConflictingRequests(selectedRequest);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 flex flex-col">

        {/* ================= CONTROLS & FILTERING PILLS ================= */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
          {/* Status Tab Filters */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 w-full md:w-auto">
            {["Pending", "Approved", "Rejected", "All"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setSelectedRequestId(null); // Reset detail pane view
                }}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex-1 md:flex-initial ${
                  filterStatus === status
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {status}
                {status === "Pending" && leaveRequests.filter(r => r.status === "Pending").length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                    {leaveRequests.filter(r => r.status === "Pending").length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filters and search input */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Leave Type Select */}
            <select
              value={filterLeaveType}
              onChange={(e) => {
                setFilterLeaveType(e.target.value);
                setSelectedRequestId(null);
              }}
              className="bg-slate-50 border border-slate-200 hover:border-slate-350 px-3.5 py-2 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
            >
              <option value="All">All Leave Types</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>{lt.name}</option>
              ))}
            </select>

            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedRequestId(null);
                }}
                placeholder="Search Employee..."
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white pl-9 pr-4 py-2.5 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* ================= MAIN SPLIT-PANE WORKSPACE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-[500px]">
          
          {/* LEFT 5 COLUMNS: REQUEST INBOX */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-slate-200/60 p-4 shadow-sm overflow-hidden h-[580px]">
            <h3 className="text-slate-800 font-extrabold text-xs px-2 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Inbox ({filteredRequests.length})</span>
              <span className="text-[10px] text-slate-400 font-medium">Click card to review details</span>
            </h3>

            <div className="divide-y divide-slate-100 overflow-y-auto pr-1 flex-1 mt-2 scrollbar-thin">
              {filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
                  <Layers size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-bold">No requests found</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Active employee leave submissions will populate here.</p>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = req.id === selectedRequestId;
                  const duration = calculateDuration(req.from_date, req.to_date);

                  return (
                    <motion.div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      whileHover={{ x: 3 }}
                      className={`p-3.5 my-1.5 rounded-2xl cursor-pointer transition-all duration-200 flex items-start justify-between gap-3 border ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-200 shadow-sm"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex gap-3 min-w-0">
                        {/* Status border indicator */}
                        <span className={`w-1 self-stretch rounded-full shrink-0 ${
                          req.status === "Approved"
                            ? "bg-emerald-500"
                            : req.status === "Rejected"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`} />

                        <div className="min-w-0 space-y-1">
                          <h4 className="font-bold text-slate-800 text-xs truncate">
                            {req.first_name} {req.last_name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                            <span className="truncate max-w-[90px]">{req.leave_type_name}</span>
                            <span>•</span>
                            <span className="text-blue-600 shrink-0">{duration} Days</span>
                          </div>
                          <span className="text-[10px] text-slate-450 block truncate">
                            {new Date(req.from_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(req.to_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      <ChevronRight size={14} className={`text-slate-400 shrink-0 self-center transition-transform ${isSelected ? "transform translate-x-1" : ""}`} />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT 7 COLUMNS: EXPANDED PREVIEW PANEL */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between h-[580px] overflow-hidden">
            <AnimatePresence mode="wait">
              {!selectedRequest ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center h-full text-slate-400 py-16 gap-3"
                >
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-350">
                    <FileText size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">No Request Selected</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">Select an employee application card from the list on the left to display audit records and actions.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedRequest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between overflow-y-auto pr-1 scrollbar-thin"
                >
                  {/* Detailed Panel Layout */}
                  <div className="space-y-6">
                    {/* Applicant Profile Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md">
                          {selectedRequest.first_name?.charAt(0)}{selectedRequest.last_name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm">
                            {selectedRequest.first_name} {selectedRequest.last_name}
                          </h3>
                          <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5 flex items-center gap-1.5">
                            <Layers size={10} />
                            {selectedRequest.department_name || "General Staff"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          selectedRequest.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : selectedRequest.status === "Rejected"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedRequest.status === "Approved" ? "bg-emerald-500" : selectedRequest.status === "Rejected" ? "bg-red-500" : "bg-amber-500"
                          }`} />
                          {selectedRequest.status}
                        </span>

                        <button
                          onClick={() => handleDelete(selectedRequest.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                          title="Delete Request"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Leave Specifications */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Leave Category</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">{selectedRequest.leave_type_name}</span>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Request Duration</span>
                        <span className="text-xs font-black text-slate-800 mt-1 block">
                          {calculateDuration(selectedRequest.from_date, selectedRequest.to_date)} Days
                        </span>
                      </div>
                    </div>

                    {/* Timeline Spec */}
                    <div className="flex gap-4 items-center bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                      <Calendar className="text-blue-500 shrink-0" size={16} />
                      <div className="text-xs">
                        <span className="text-slate-550 font-bold">
                          {new Date(selectedRequest.from_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="text-slate-400 mx-2">to</span>
                        <span className="text-slate-550 font-bold">
                          {new Date(selectedRequest.to_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Reason Description */}
                    {selectedRequest.description && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed italic">
                        <strong className="text-slate-700 font-bold not-italic block mb-1">Reason Description:</strong>
                        "{selectedRequest.description}"
                      </div>
                    )}

                    {/* Live Balance Checker Widget */}
                    <div>
                      <h4 className="text-slate-700 font-bold text-xs mb-2">Live Allowance Validation</h4>
                      {(() => {
                        const balInfo = getEmployeeBalanceForType(selectedRequest.user_id, selectedRequest.leave_types);
                        const duration = calculateDuration(selectedRequest.from_date, selectedRequest.to_date);
                        const balanceAfter = balInfo.balance - duration;
                        const exceeds = balanceAfter < 0;

                        return (
                          <div className={`p-4 rounded-2xl border ${
                            exceeds ? "bg-rose-50/40 border-rose-250" : "bg-emerald-50/30 border-emerald-250"
                          } space-y-3.5`}>
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-550">Current Available Balance</span>
                              <span className="text-slate-800 font-bold">{balInfo.balance} Days</span>
                            </div>

                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-550">Remaining after Approval</span>
                              <span className={`font-black ${exceeds ? "text-rose-650" : "text-emerald-700"}`}>
                                {balanceAfter} Days
                              </span>
                            </div>

                            {/* Gauge status indicator */}
                            {exceeds ? (
                              <div className="flex items-start gap-2.5 text-[11px] text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-black">Overdraft Warning:</span> This application exceeds the employee's current allowance pool by <span className="font-extrabold">{Math.abs(balanceAfter)} days</span>.
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-bold">
                                <CheckCircle2 size={14} />
                                <span>Approval safe: Sufficient balance available.</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Department Overlap/Conflict Checker Widget */}
                    <div>
                      <h4 className="text-slate-700 font-bold text-xs mb-2">Department Conflict Checker</h4>
                      {conflicts.length === 0 ? (
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 font-semibold">
                          <CheckCircle2 className="text-emerald-500" size={14} />
                          <span>No overlapping leave requests in {selectedRequest.department_name || "General Staff"} department during this period.</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-extrabold uppercase bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 w-fit">
                            <AlertTriangle size={12} />
                            <span>{conflicts.length} Overlapping Breaks found</span>
                          </div>
                          <div className="max-h-[110px] overflow-y-auto space-y-2 pr-1 border border-slate-100 p-2 rounded-xl">
                            {conflicts.map((c) => (
                              <div key={c.id} className="flex justify-between items-center text-[10px] p-2 bg-slate-50 rounded-lg">
                                <span className="font-bold text-slate-700">{c.first_name} {c.last_name}</span>
                                <span className="text-slate-450 uppercase font-semibold">{c.leave_type_name}</span>
                                <span className="text-slate-450 font-bold bg-slate-200/50 px-2 py-0.5 rounded-full">{c.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Drawer Footer */}
                  {selectedRequest.status === "Pending" && (
                    <div className="flex gap-3 border-t border-slate-100 pt-4 mt-6">
                      <button
                        onClick={() => handleStatusChange(selectedRequest.id, "Rejected")}
                        className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 border border-rose-100 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01] hover:shadow-sm"
                      >
                        <X size={14} />
                        <span>Decline Request</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(selectedRequest.id, "Approved")}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
                      >
                        <Check size={14} />
                        <span>Approve Leave</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
