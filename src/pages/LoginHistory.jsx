import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";
import { Search, Info, ShieldCheck } from "lucide-react";

export default function LoginHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/auth/login-history`,
          { headers }
        );
        setHistory(res.data.loginHistory || []);
      } catch (error) {
        console.error("fetchHistory error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  const filteredHistory = history.filter((log) => {
    // Determine the actor name
    const actorName = log.first_name 
      ? `${log.first_name} ${log.last_name || ""}`.trim()
      : "Company Admin";
    const email = log.user_email || log.company_email || "";
    const employeeCode = log.company_employee_id || "";

    const matchesSearch = 
      actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipaddress && log.ipaddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.os && log.os.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.browser && log.browser.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === "All" || 
      (statusFilter === "Success" && log.login_status === "Success") ||
      (statusFilter === "Failed" && log.login_status === "Failed");

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                Security Portal
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
                Authentication Audit Trail
              </h1>
              <p className="text-slate-300 text-xs font-semibold">
                Monitor and review successful and failed login attempts for employees and company admin.
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search by actor, email, code, IP, browser..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-808 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
              <p className="text-slate-400 text-xs mt-3 font-semibold">Retrieving authentication records...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-slate-800 font-extrabold text-sm">No Authentication Records Found</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto font-medium">
                  There are no registered login attempts matching the current filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Actor / User</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Type / Role</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Timeline</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Access Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((log) => {
                    const isCompany = !log.user_id;
                    const actorName = !isCompany
                      ? `${log.first_name} ${log.last_name || ""}`.trim()
                      : "Company Admin";
                    const actorEmail = log.user_email || log.company_email || "N/A";
                    const employeeCode = log.company_employee_id || "ADMIN";

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                              isCompany
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}>
                              {actorName.split(" ").map(w => w[0]).join("").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-808 text-slate-800 text-xs">{actorName}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{actorEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
                            isCompany
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200/50"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                          }`}>
                            {isCompany ? "Company Admin" : `Employee (${employeeCode})`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">
                              Logged In: <span className="font-semibold text-slate-500">{new Date(log.login_at).toLocaleString()}</span>
                            </p>
                            {log.login_status === "Success" && (
                              <p className="text-[10px] font-semibold text-slate-400">
                                Logged Out: <span className="text-slate-500 font-bold">{log.logout_at ? new Date(log.logout_at).toLocaleString() : "Active Session"}</span>
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {log.login_status === "Success" ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/40 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl">
                              Success
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="bg-rose-50 text-rose-700 border border-rose-200/40 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl">
                                Failed
                              </span>
                              {log.failure_reason && (
                                <p className="text-[9px] text-rose-500 font-bold flex items-center gap-1">
                                  <Info size={10} /> {log.failure_reason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                          <div className="space-y-0.5">
                            <p className="text-slate-700 font-bold">IP: <span className="font-semibold text-slate-500">{log.ipaddress || "Unknown"}</span></p>
                            <p className="text-[10px] text-slate-400">
                              {log.os || "Unknown OS"} • {log.browser || "Unknown Browser"} ({log.device_info || "Desktop"})
                            </p>
                            {(log.lattitude || log.longitude) && (
                              <p className="text-[9px] text-slate-400 font-semibold italic">
                                Lat/Lon: {parseFloat(log.lattitude).toFixed(4)}, {parseFloat(log.longitude).toFixed(4)}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
