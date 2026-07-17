import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  Monitor,
  Globe,
  MapPin,
  Clock,
  LogIn,
  LogOut,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  Smartphone,
  Wifi,
  Activity,
} from "lucide-react";

const API_BASE = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/login-history`;

const STATUS_CONFIG = {
  success: {
    label: "Success",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
    dot: "bg-emerald-500",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-100",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  blocked: {
    label: "Blocked",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-100",
    dot: "bg-amber-500",
    icon: AlertTriangle,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.success;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function duration(login, logout) {
  if (!login || !logout) return "—";
  const diff = Math.abs(new Date(logout) - new Date(login));
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const PAGE_SIZE = 15;

export default function LoginHistory() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, { headers });
      setRecords(res.data.login_history || []);
    } catch (err) {
      console.error("fetchHistory error:", err);
      showToast("Failed to load login history", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    let data = [...records];
    if (statusFilter !== "all") {
      data = data.filter((r) => r.login_status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q) ||
          (r.ipaddress || "").includes(q) ||
          (r.browser || "").toLowerCase().includes(q) ||
          (r.os || "").toLowerCase().includes(q)
      );
    }
    setFiltered(data);
    setPage(1);
  }, [records, search, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this login history record?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/${id}`, { headers });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast("Record deleted successfully");
    } catch (err) {
      console.error("delete error:", err);
      showToast("Failed to delete record", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = {
    total: records.length,
    success: records.filter((r) => r.login_status === "success").length,
    failed: records.filter((r) => r.login_status === "failed").length,
    active: records.filter((r) => r.login_at && !r.logout_at).length,
  };

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 transition-all ${
            toast.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {toast.type === "error" ? <XCircle size={14} /> : <CheckCircle size={14} />}
          {toast.msg}
        </div>
      )}

      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#08112d] via-[#151a5a] to-[#08112d] rounded-3xl p-6 text-white border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                Security Portal
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
                Login History Registry
              </h1>
              <p className="text-slate-300 text-xs font-semibold">
                Monitor all employee login activity, active sessions, and client devices.
              </p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="bg-[#2390ea] hover:bg-[#1678d4] text-white px-5 py-3 rounded-2xl text-xs font-bold transition duration-150 flex items-center gap-1.5 shadow-md hover:scale-[1.02] cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Registry
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Records",
              value: stats.total,
              subtext: `${stats.total} entries`,
              icon: Clock,
              theme: {
                bg: "from-blue-500/10 to-indigo-500/10",
                border: "border-slate-200/60 hover:border-blue-400/50",
                iconBg: "bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)]",
                blob: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
              }
            },
            {
              label: "Successful",
              value: stats.success,
              subtext: `${stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(0) : 0}% rate`,
              icon: CheckCircle,
              theme: {
                bg: "from-emerald-500/10 to-teal-500/10",
                border: "border-slate-200/60 hover:border-emerald-400/50",
                iconBg: "bg-gradient-to-tr from-emerald-400 to-teal-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]",
                blob: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
              }
            },
            {
              label: "Failed Attempts",
              value: stats.failed,
              subtext: `${stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(0) : 0}% rate`,
              icon: XCircle,
              theme: {
                bg: "from-rose-500/10 to-red-500/10",
                border: "border-slate-200/60 hover:border-rose-400/50",
                iconBg: "bg-gradient-to-tr from-rose-400 to-red-600 text-white shadow-[0_4px_12px_rgba(244,63,94,0.25)]",
                blob: "bg-gradient-to-br from-rose-500/10 to-red-500/10"
              }
            },
            {
              label: "Active Sessions",
              value: stats.active,
              subtext: `${stats.active} active`,
              icon: Wifi,
              theme: {
                bg: "from-violet-500/10 to-purple-500/10",
                border: "border-slate-200/60 hover:border-violet-400/50",
                iconBg: "bg-gradient-to-tr from-violet-400 to-purple-600 text-white shadow-[0_4px_12px_rgba(139,92,246,0.25)]",
                blob: "bg-gradient-to-br from-violet-500/10 to-purple-500/10"
              }
            }
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`relative group bg-white border ${s.theme.border} rounded-3xl p-4.5 flex items-center gap-4 overflow-hidden shadow-[0_6px_25px_rgba(0,0,0,0.012)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-default`}
              >
                {/* Glow/Blob Background */}
                <div className={`absolute top-0 right-0 w-28 h-28 rounded-full -mr-6 -mt-6 opacity-35 group-hover:opacity-68 group-hover:scale-110 blur-xl transition-all duration-500 ${s.theme.blob}`} />
                
                {/* Icon Box */}
                <div className={`w-11 h-11 rounded-2xl ${s.theme.iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 z-10`}>
                  <Icon size={20} />
                </div>

                <div className="z-10 min-w-0">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-none mb-1 group-hover:text-slate-900 transition-colors duration-300">
                    {s.value}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate mb-0.5">
                    {s.label}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors duration-300 shrink-0" />
                    <span className="truncate">{s.subtext}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, IP, browser, OS…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <RefreshCw size={24} className="animate-spin text-blue-600" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-3">Loading history registry...</span>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 font-semibold text-xs gap-2">
              <Activity size={32} className="text-slate-300" />
              <span>No login history registry entries found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-3xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["User", "Login At", "Logout At", "Duration", "IP Address", "Browser / OS", "Location", "Status", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((rec, i) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/40 text-xs font-semibold text-slate-700 transition duration-150"
                    >
                      {/* User */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 text-white text-[10px] font-black shadow-sm">
                            {rec.first_name?.[0]?.toUpperCase() || <User size={12} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs leading-none mb-0.5">
                              {rec.first_name
                                ? `${rec.first_name} ${rec.last_name || ""}`.trim()
                                : `User #${rec.user_id || "—"}`}
                            </p>
                            <p className="text-slate-400 text-[10px] font-medium leading-none">{rec.email || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Login At */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <LogIn size={13} className="text-blue-500" />
                          <span className="text-slate-800">{formatDate(rec.login_at)}</span>
                        </div>
                      </td>

                      {/* Logout At */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {rec.logout_at ? (
                          <div className="flex items-center gap-1.5">
                            <LogOut size={13} className="text-slate-400" />
                            <span className="text-slate-600">{formatDate(rec.logout_at)}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                        {duration(rec.login_at, rec.logout_at)}
                      </td>

                      {/* IP */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Globe size={13} className="text-slate-400 shrink-0" />
                          <span>{rec.ipaddress || "—"}</span>
                        </div>
                      </td>

                      {/* Browser / OS */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-800 font-bold">
                            <Monitor size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[90px]">{rec.browser || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                            <Smartphone size={12} className="shrink-0" />
                            <span className="truncate max-w-[90px]">{rec.os || "—"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                        {rec.lattitude && rec.longitude ? (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-rose-500 shrink-0" />
                            <span>
                              {parseFloat(rec.lattitude).toFixed(3)},{" "}
                              {parseFloat(rec.longitude).toFixed(3)}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <StatusBadge status={rec.login_status} />
                          {rec.failure_reason && (
                            <p className="text-[10px] text-rose-600 font-bold max-w-[100px] truncate" title={rec.failure_reason}>
                              {rec.failure_reason}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(rec.id)}
                          disabled={deletingId === rec.id}
                          title="Delete record"
                          className="p-2 border border-transparent hover:border-rose-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition duration-150 flex items-center justify-center shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === rec.id ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs font-bold text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && page > 3) p = page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                      page === p
                        ? "bg-[#2390ea] text-white"
                        : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
