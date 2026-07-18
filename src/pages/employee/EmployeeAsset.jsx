import { useEffect, useState } from "react";
import axios from "axios";
import { FaTimes, FaBox, FaSearch, FaCalendarAlt } from "react-icons/fa";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";

const BASE = import.meta.env.VITE_SERVER_ADDRESS;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─────────────────────────────────────────────────────────────
// ASSET CARD
// ─────────────────────────────────────────────────────────────
function AssetCard({ item }) {
  const initials = item.asset_name?.charAt(0).toUpperCase() || "A";
  const assignDate = item.assign_date
    ? new Date(item.assign_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Card header */}
      <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-5 py-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-xl shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-base leading-tight truncate">{item.asset_name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30">
            Assigned
          </span>
        </div>
      </div>

      {/* Card body — only assign date */}
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
          <FaCalendarAlt size={14} />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Assign Date</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">{assignDate}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function EmployeeAsset() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMyAssets = async () => {
      try {
        const res = await axios.get(`${BASE}/api/assets/assign/me`, {
          headers: getHeaders(),
        });
        setAssets(res.data.assets || []);
      } catch (e) {
        console.error("Error fetching my assets:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAssets();
  }, []);

  const filtered = assets.filter((a) => {
    if (!search) return true;
    return a.asset_name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <EmployeeDashboardLayout>
      <div className="min-h-screen bg-slate-100 pb-8">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">My Assets</h1>
          <p className="text-slate-500 text-sm mt-1">Assets currently assigned to you</p>
        </div>

        {/* ── Stat card ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 mb-6 max-w-xs">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-md">
            <FaBox />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{assets.length}</p>
            <p className="text-slate-400 text-sm">Assets Assigned</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          /* ── Empty State ── */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-6 py-4">
              <h2 className="text-white font-bold text-lg">Assigned Assets</h2>
            </div>
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl mb-4 shadow-sm">
                📦
              </div>
              <h3 className="font-semibold text-slate-700 text-lg">No Assets Assigned</h3>
              <p className="text-slate-400 text-sm mt-1">You have no assets assigned to you yet.</p>
              <p className="text-slate-400 text-sm">Contact your HR or admin for assistance.</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Search + Count ── */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex-1 max-w-sm">
                <FaSearch className="text-slate-400" size={13} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                    <FaTimes size={11} />
                  </button>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm text-sm text-slate-600 font-medium whitespace-nowrap">
                {filtered.length} of {assets.length} asset{assets.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* ── Cards Grid ── */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-semibold text-slate-700">No results for "{search}"</p>
                <p className="text-slate-400 text-sm mt-1">Try a different search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((item) => (
                  <AssetCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </EmployeeDashboardLayout>
  );
}
