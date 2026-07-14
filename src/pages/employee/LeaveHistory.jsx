import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  FileText,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";

export default function EmployeeLeaveHistory() {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/leaves`,
        { headers }
      );
      setLeaveRequests(res.data.leaveRequests || res.data || []);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteRequest = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this leave request?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/leaves/${id}`,
        { headers }
      );
      await fetchData();
    } catch (err) {
      console.error("Cancel leave request error:", err);
      alert(err.response?.data?.message || "Failed to cancel request.");
    }
  };

  // Filter requests
  const filteredRequests = leaveRequests.filter((req) => {
    const matchesSearch = req.leave_type_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/employee/leave")}
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
                  Leaves Portal
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
                  Leave History Registry
                </h1>
                <p className="text-slate-300 text-xs font-semibold">
                  A complete history of all your submitted leave applications and their review statuses.
                </p>
              </div>
              <button
                onClick={() => navigate("/employee/leave/apply")}
                className="bg-[#2390ea] hover:bg-[#1678d4] text-white px-5 py-3 rounded-2xl text-xs font-bold transition duration-150 flex items-center gap-1.5 shadow-md hover:scale-[1.02]"
              >
                Apply Leave
              </button>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Leave Type..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white pl-10 pr-4 py-2.5 rounded-2xl text-slate-750 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0">
              <Filter size={12} />
              Filter status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 border border-slate-200 rounded-2xl p-2.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition duration-150"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              <span className="text-sm font-bold text-slate-600 ml-3">Loading history registry...</span>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-3xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Leave Type", "Duration", "Reason / Description", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-slate-400 font-semibold text-xs"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <HelpCircle size={24} className="text-slate-300" />
                          <span>No leave applications found matching filters.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const fromDateStr = new Date(req.from_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      const toDateStr = new Date(req.to_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      const status = req.status || "Pending";

                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-slate-50/40 text-xs font-semibold text-slate-700 transition duration-150"
                        >
                          <td className="px-5 py-4 font-bold text-slate-800">
                            {req.leave_type_name}
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-slate-700">{fromDateStr}</p>
                            <p className="text-[9px] text-slate-400 font-black">
                              to {toDateStr}
                            </p>
                          </td>
                          <td
                            className="px-5 py-4 text-slate-550 font-medium max-w-[240px] truncate"
                            title={req.description}
                          >
                            {req.description || "N/A"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`
                                inline-flex items-center gap-1
                                px-2.5 py-0.5
                                rounded-full
                                text-[10px]
                                font-bold
                                border
                                ${
                                  status === "Approved"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : status === "Rejected"
                                    ? "bg-rose-50 text-rose-700 border-rose-100"
                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                }
                              `}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  status === "Approved"
                                    ? "bg-emerald-500"
                                    : status === "Rejected"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {status === "Pending" ? (
                              <button
                                onClick={() => handleDeleteRequest(req.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-150 flex items-center justify-center border border-transparent hover:border-rose-100 shadow-sm hover:shadow"
                                title="Cancel request"
                              >
                                <Trash2 size={14} />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                                <AlertCircle size={12} className="text-slate-300" />
                                Processed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
