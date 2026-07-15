import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";
import {
  Monitor,
  Globe,
  MapPin,
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Activity,
  ShieldCheck,
} from "lucide-react";

const API_BASE = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/login-history`;

const STATUS_CONFIG = {
  success: {
    label: "Success",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    icon: XCircle,
  },
  blocked: {
    label: "Blocked",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: AlertTriangle,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.success;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}
    >
      <Icon size={11} />
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

const PAGE_SIZE = 10;

export default function EmployeeLoginHistory() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("employee_id");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/user/${userId}`, { headers });
      setRecords(res.data.login_history || []);
    } catch (err) {
      console.error("EmployeeLoginHistory fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    let data = [...records];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          (r.ipaddress || "").includes(q) ||
          (r.browser || "").toLowerCase().includes(q) ||
          (r.os || "").toLowerCase().includes(q) ||
          (r.login_status || "").toLowerCase().includes(q)
      );
    }
    setFiltered(data);
    setPage(1);
  }, [records, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = {
    total: records.length,
    success: records.filter((r) => r.login_status === "success").length,
    failed: records.filter((r) => r.login_status === "failed").length,
    active: records.filter((r) => r.login_at && !r.logout_at).length,
  };

  const lastLogin = records.find((r) => r.login_at);

  return (
    <EmployeeDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <ShieldCheck size={24} className="text-blue-400" />
              My Login History
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track your login activity and active sessions
            </p>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Logins", value: stats.total, icon: Clock, color: "from-blue-600 to-cyan-600" },
            { label: "Successful", value: stats.success, icon: CheckCircle, color: "from-emerald-600 to-green-600" },
            { label: "Failed Attempts", value: stats.failed, icon: XCircle, color: "from-red-600 to-rose-600" },
            { label: "Active Sessions", value: stats.active, icon: Activity, color: "from-violet-600 to-purple-600" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Last Login Banner */}
        {lastLogin && (
          <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/20 border border-blue-500/20 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center shrink-0">
              <LogIn size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Last Login</p>
              <p className="text-sm text-white font-semibold">
                {formatDate(lastLogin.login_at)}
                {lastLogin.ipaddress && (
                  <span className="text-slate-400 font-normal ml-3">
                    from {lastLogin.ipaddress}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by IP, browser, OS, status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <RefreshCw size={28} className="animate-spin text-blue-400" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <Activity size={40} className="mb-3 opacity-40" />
              <p className="text-sm">No login history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {["#", "Login At", "Logout At", "Duration", "IP Address", "Browser / OS", "Device", "Location", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((rec, i) => (
                    <tr
                      key={rec.id}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                        i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                      }`}
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>

                      {/* Login At */}
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <LogIn size={12} className="text-blue-400" />
                          {formatDate(rec.login_at)}
                        </div>
                      </td>

                      {/* Logout At */}
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-300">
                        {rec.logout_at ? (
                          <div className="flex items-center gap-1.5">
                            <LogOut size={12} className="text-slate-400" />
                            {formatDate(rec.logout_at)}
                          </div>
                        ) : (
                          <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                        {duration(rec.login_at, rec.logout_at)}
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Globe size={12} className="text-slate-400 shrink-0" />
                          {rec.ipaddress || "—"}
                        </div>
                      </td>

                      {/* Browser / OS */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs">
                          <div className="flex items-center gap-1 text-slate-300">
                            <Monitor size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[80px]">{rec.browser || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                            <Smartphone size={11} className="shrink-0" />
                            <span className="truncate max-w-[80px]">{rec.os || "—"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Device Info */}
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400 max-w-[100px] truncate">
                        {rec.device_info || "—"}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                        {rec.lattitude && rec.longitude ? (
                          <div className="flex items-center gap-1">
                            <MapPin size={11} className="text-rose-400 shrink-0" />
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <StatusBadge status={rec.login_status} />
                          {rec.failure_reason && (
                            <p className="text-[10px] text-red-400 mt-0.5 max-w-[100px] truncate" title={rec.failure_reason}>
                              {rec.failure_reason}
                            </p>
                          )}
                        </div>
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
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && page > 3) p = page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition cursor-pointer ${
                      page === p
                        ? "bg-blue-600 text-white"
                        : "hover:bg-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </EmployeeDashboardLayout>
  );
}
