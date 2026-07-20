import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlane,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaEye,
  FaCheck,
  FaTimesCircle,
  FaFilePdf,
  FaFileImage,
  FaFilter,
} from "react-icons/fa";
import DashboardLayout from "../../layouts/DashboardLayout";

const BASE = import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function TravelPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actioningId, setActioningId] = useState(null);

  const fetchTravelRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE}/api/travel`, {
        headers: getHeaders(),
      });
      setRequests(res.data.travelRequests || []);
    } catch (e) {
      console.error("Error fetching travel requests:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    if (!window.confirm(`Are you sure you want to change status to ${status}?`)) return;

    try {
      setActioningId(id);
      await axios.put(
        `${BASE}/api/travel/${id}/status`,
        { status },
        { headers: getHeaders() }
      );
      alert(`Request has been ${status.toLowerCase()}!`);
      fetchTravelRequests();
    } catch (e) {
      console.error("Error changing status:", e);
      alert(e.response?.data?.message || "Failed to update status");
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
            Pending
          </span>
        );
    }
  };

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.employee_name?.toLowerCase().includes(q) ||
      r.employee_email?.toLowerCase().includes(q) ||
      r.travel_from?.toLowerCase().includes(q) ||
      r.travel_to?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 animate-fadeIn bg-slate-50/50 rounded-[2.5rem]">
        {/* Header banner */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />

          <div className="space-y-1.5 text-left relative z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-100">
              Reimbursements
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-1.5">
              Travel Reimbursement Manager
            </h1>
            <p className="text-slate-400 text-xs font-semibold">
              Review, approve, and audit employee business travel claims
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <FaSearch size={12} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, origin, destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white pl-10 pr-4 py-2.5 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0">
              <FaFilter size={10} />
              Status filter
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 border border-slate-200 rounded-2xl p-2.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition"
            >
              <option value="all">All Claims</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Claims Table Card */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-3 py-4">Origin ➔ Destination</th>
                  <th className="px-3 py-4">Purpose</th>
                  <th className="px-3 py-4 text-right">Amount</th>
                  <th className="px-3 py-4 text-center">Submitted On</th>
                  <th className="px-3 py-4 text-center">Receipt</th>
                  <th className="px-3 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center w-52">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-blue-600" />
                        <span>Loading travel claims...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-455 font-bold">
                      No travel reimbursement requests found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((rec) => {
                    const isActioning = actioningId === rec.id;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/40 transition">
                        {/* Employee */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 leading-tight">{rec.employee_name}</p>
                          <p className="text-[9px] text-slate-400 font-black mt-0.5 uppercase">
                            {rec.company_employee_id ? `EMP-${rec.company_employee_id}` : `USR-${rec.user_id}`}
                          </p>
                          <p className="text-[10px] text-slate-450 mt-0.5 font-medium leading-none">{rec.employee_email}</p>
                        </td>

                        {/* Route */}
                        <td className="px-3 py-4 text-slate-800 font-bold">
                          {rec.travel_from} ➔ {rec.travel_to}
                        </td>

                        {/* Purpose */}
                        <td className="px-3 py-4 max-w-xs truncate text-slate-500 font-medium" title={rec.purpose}>
                          {rec.purpose || "—"}
                        </td>

                        {/* Amount */}
                        <td className="px-3 py-4 text-right text-indigo-700 font-black">
                          ₹{parseFloat(rec.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Submitted On */}
                        <td className="px-3 py-4 text-center text-slate-500 font-bold">
                          {formatDate(rec.submitted_at)}
                        </td>

                        {/* Receipt */}
                        <td className="px-3 py-4 text-center">
                          {rec.bill ? (
                            <a
                              href={rec.bill}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:underline uppercase"
                            >
                              {rec.bill.toLowerCase().endsWith(".pdf") ? <FaFilePdf /> : <FaFileImage />}
                              View Receipt
                            </a>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-4 text-center">
                          {getStatusBadge(rec.status)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {rec.status === "Pending" ? (
                              <>
                                <button
                                  onClick={() => handleStatusChange(rec.id, "Approved")}
                                  disabled={isActioning}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold transition cursor-pointer shadow-sm disabled:opacity-60"
                                >
                                  <FaCheck size={10} /> Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(rec.id, "Rejected")}
                                  disabled={isActioning}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-extrabold transition cursor-pointer shadow-sm disabled:opacity-60"
                                >
                                  <FaTimesCircle size={10} /> Reject
                                </button>
                              </>
                            ) : rec.approver_name ? (
                              <div className="text-[10px] text-slate-400 font-bold">
                                Reviewed by: <span className="text-slate-600">{rec.approver_name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-350 text-[10px] font-bold">—</span>
                            )}
                          </div>
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
    </DashboardLayout>
  );
}
