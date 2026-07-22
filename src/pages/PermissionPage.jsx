import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSpinner,
  FaUserShield,
  FaCheck,
  FaLock,
  FaInfoCircle,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";
import {
  LayoutDashboard,
  Users,
  Clock,
  DollarSign,
  CalendarOff,
  Package,
  BriefcaseBusiness,
  Plane,
  History,
  FileText,
  ToggleRight,
  ToggleLeft,
  CheckCircle2,
  Calendar,
  CreditCard,
  Folder,
  UserMinus,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import TabBar from "../components/company/TabBar";

const BASE = import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Module Config ────────────────────────────────────────────────────────────
// Maps backend permission names to UI module metadata
const MODULE_CONFIG = [
  // CORE / DASHBOARD
  { name: "Dashboard View", icon: LayoutDashboard, color: "indigo", gradient: "from-indigo-500 to-violet-500", bgLight: "bg-indigo-50", border: "border-indigo-200", desc: "Access the main company dashboard.", category: "Core" },
  { name: "My Dashboard View", icon: LayoutDashboard, color: "indigo", gradient: "from-indigo-400 to-violet-400", bgLight: "bg-indigo-50", border: "border-indigo-200", desc: "Access employee personal dashboard.", category: "Self Service" },
  
  // SELF SERVICE
  { name: "My Profile View", icon: Users, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own profile details.", category: "Self Service" },
  { name: "Update My Profile", icon: Users, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Ability to edit and update own profile details.", category: "Self Service" },
  { name: "My Attendance View", icon: Clock, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own attendance records.", category: "Self Service" },
  { name: "My Leaves View", icon: Calendar, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own leave overview.", category: "Self Service" },
  { name: "Apply Leave", icon: Calendar, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Ability to apply for leave.", category: "Self Service" },
  { name: "My Leave History", icon: Calendar, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own leave history.", category: "Self Service" },
  { name: "My Payroll View", icon: CreditCard, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own payroll and payslips.", category: "Self Service" },
  { name: "My Assets View", icon: Package, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own assigned assets.", category: "Self Service" },
  { name: "My Travel View", icon: Plane, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own travel requests.", category: "Self Service" },
  { name: "Travel Reimbursement", icon: Plane, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own travel requests and submit reimbursement expenses.", category: "Self Service" },
  { name: "My Documents View", icon: Folder, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own documents.", category: "Self Service" },
  { name: "My Login History View", icon: History, color: "blue", gradient: "from-blue-400 to-cyan-400", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Access own login history.", category: "Self Service" },
  { name: "Resignation Apply", icon: UserMinus, color: "red", gradient: "from-red-400 to-orange-400", bgLight: "bg-red-50", border: "border-red-200", desc: "Ability to apply for resignation.", category: "Self Service" },

  // EMPLOYEES ADMIN
  { name: "Employee List View", icon: Users, color: "blue", gradient: "from-blue-500 to-cyan-500", bgLight: "bg-blue-50", border: "border-blue-200", desc: "View all employees.", category: "HR" },
  { name: "Offer Letters Admin", icon: Folder, color: "blue", gradient: "from-blue-500 to-cyan-500", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Manage offer letters.", category: "HR" },
  { name: "Experience Letters Admin", icon: Folder, color: "blue", gradient: "from-blue-500 to-cyan-500", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Manage experience letters.", category: "HR" },
  { name: "Relieving Letters Admin", icon: Folder, color: "blue", gradient: "from-blue-500 to-cyan-500", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Manage relieving letters.", category: "HR" },
  { name: "Warning Letters Admin", icon: Folder, color: "blue", gradient: "from-blue-500 to-cyan-500", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Manage warning letters.", category: "HR" },
  { name: "Termination Letters Admin", icon: Folder, color: "blue", gradient: "from-blue-500 to-cyan-500", bgLight: "bg-blue-50", border: "border-blue-200", desc: "Manage termination letters.", category: "HR" },

  // ATTENDANCE ADMIN
  { name: "Attendance Admin Dashboard", icon: Clock, color: "teal", gradient: "from-teal-500 to-emerald-500", bgLight: "bg-teal-50", border: "border-teal-200", desc: "View attendance admin dashboard.", category: "Attendance" },
  { name: "Daily Tracking Admin", icon: Clock, color: "teal", gradient: "from-teal-500 to-emerald-500", bgLight: "bg-teal-50", border: "border-teal-200", desc: "Manage daily tracking of employees.", category: "Attendance" },
  { name: "Shifts Admin", icon: Clock, color: "teal", gradient: "from-teal-500 to-emerald-500", bgLight: "bg-teal-50", border: "border-teal-200", desc: "Manage company shifts.", category: "Attendance" },

  // LEAVE ADMIN
  { name: "Leave Admin Dashboard", icon: Calendar, color: "orange", gradient: "from-orange-500 to-amber-500", bgLight: "bg-orange-50", border: "border-orange-200", desc: "View leave admin dashboard.", category: "Leaves" },
  { name: "Leave Requests Admin", icon: Calendar, color: "orange", gradient: "from-orange-500 to-amber-500", bgLight: "bg-orange-50", border: "border-orange-200", desc: "Manage employee leave requests.", category: "Leaves" },
  { name: "Leave Types Admin", icon: Calendar, color: "orange", gradient: "from-orange-500 to-amber-500", bgLight: "bg-orange-50", border: "border-orange-200", desc: "Manage leave types configuration.", category: "Leaves" },
  { name: "Holidays Admin", icon: Calendar, color: "orange", gradient: "from-orange-500 to-amber-500", bgLight: "bg-orange-50", border: "border-orange-200", desc: "Manage company holidays.", category: "Leaves" },
  { name: "Holiday Calendar View", icon: Calendar, color: "orange", gradient: "from-orange-500 to-amber-500", bgLight: "bg-orange-50", border: "border-orange-200", desc: "View holiday calendar.", category: "Leaves" },

  // PAYROLL ADMIN
  { name: "Payroll Admin Dashboard", icon: CreditCard, color: "purple", gradient: "from-purple-500 to-fuchsia-500", bgLight: "bg-purple-50", border: "border-purple-200", desc: "View payroll admin dashboard.", category: "Finance" },
  { name: "Salary Details Admin", icon: CreditCard, color: "purple", gradient: "from-purple-500 to-fuchsia-500", bgLight: "bg-purple-50", border: "border-purple-200", desc: "Manage employee salary details.", category: "Finance" },
  { name: "Payslips Admin", icon: CreditCard, color: "purple", gradient: "from-purple-500 to-fuchsia-500", bgLight: "bg-purple-50", border: "border-purple-200", desc: "Manage and generate payslips.", category: "Finance" },

  // RECRUITMENT ADMIN
  { name: "Resume Analyser", icon: BriefcaseBusiness, color: "rose", gradient: "from-rose-500 to-pink-500", bgLight: "bg-rose-50", border: "border-rose-200", desc: "Use resume analyser tool.", category: "Recruitment" },
  { name: "Interview Scheduler", icon: BriefcaseBusiness, color: "rose", gradient: "from-rose-500 to-pink-500", bgLight: "bg-rose-50", border: "border-rose-200", desc: "Schedule and manage interviews.", category: "Recruitment" },

  // OTHER ADMIN
  { name: "Assets Admin", icon: Package, color: "slate", gradient: "from-slate-500 to-zinc-500", bgLight: "bg-slate-50", border: "border-slate-200", desc: "Manage company assets.", category: "Operations" },
  { name: "Travel Admin", icon: Plane, color: "slate", gradient: "from-slate-500 to-zinc-500", bgLight: "bg-slate-50", border: "border-slate-200", desc: "Manage travel requests.", category: "Operations" },
  { name: "Company Login History", icon: History, color: "slate", gradient: "from-slate-500 to-zinc-500", bgLight: "bg-slate-50", border: "border-slate-200", desc: "View company-wide login history.", category: "Security" },
];

// Group order for display
const CATEGORY_ORDER = [
  "Core",
  "Self Service",
  "HR",
  "Attendance",
  "Leaves",
  "Finance",
  "Recruitment",
  "Operations",
  "Security"
];

// ─── Toggle Switch Component ──────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, disabled = false, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-indigo-600",
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    rose: "bg-rose-600",
    purple: "bg-purple-600",
    sky: "bg-sky-600",
    cyan: "bg-cyan-600",
    slate: "bg-slate-600",
    violet: "bg-violet-600",
  };

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${checked ? colorMap[color] || colorMap.indigo : "bg-slate-200"}`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? "translate-x-6" : "translate-x-0.5"
          }`}
      />
    </button>
  );
}

// ─── Permission Module Card ───────────────────────────────────────────────────
function PermissionCard({ permission, config, isEnabled, onToggle, disabled }) {
  const Icon = config?.icon || FileText;
  const color = config?.color || "indigo";
  const gradient = config?.gradient || "from-indigo-500 to-violet-500";
  const bgLight = config?.bgLight || "bg-indigo-50";
  const borderColor = isEnabled ? config?.border || "border-indigo-200" : "border-slate-200";

  return (
    <div
      onClick={() => !disabled && onToggle(permission.id)}
      className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none overflow-hidden ${isEnabled
          ? `${borderColor} ${bgLight} shadow-sm`
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }`}
    >
      {/* Active glow accent */}
      {isEnabled && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 pointer-events-none`}
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        {/* Icon + Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gradient} shadow-sm`}
          >
            <Icon size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-extrabold text-xs truncate ${isEnabled ? "text-slate-800" : "text-slate-700"}`}>
              {permission.name}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-medium line-clamp-2">
              {config?.desc || permission.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div className="shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch
            checked={isEnabled}
            onChange={() => onToggle(permission.id)}
            disabled={disabled}
            color={color}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({ category, permissions, permsByName, rolePermissions, onToggle, disabled }) {
  const allEnabled = permissions.every((p) => rolePermissions.has(p.id));
  const someEnabled = permissions.some((p) => rolePermissions.has(p.id));

  const handleToggleAll = (e) => {
    e.stopPropagation();
    if (allEnabled) {
      permissions.forEach((p) => {
        if (rolePermissions.has(p.id)) onToggle(p.id);
      });
    } else {
      permissions.forEach((p) => {
        if (!rolePermissions.has(p.id)) onToggle(p.id);
      });
    }
  };

  return (
    <div className="mb-6">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</span>
          <span className="text-[9px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">
            {permissions.length} module{permissions.length !== 1 ? "s" : ""}
          </span>
          {someEnabled && !allEnabled && (
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Partial
            </span>
          )}
          {allEnabled && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              All On
            </span>
          )}
        </div>
        <button
          onClick={handleToggleAll}
          disabled={disabled}
          className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 hover:underline disabled:opacity-40 transition cursor-pointer"
        >
          {allEnabled ? "Disable All" : "Enable All"}
        </button>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {permissions.map((p) => {
          const cfg = MODULE_CONFIG.find((m) => m.name === p.name);
          return (
            <PermissionCard
              key={p.id}
              permission={p}
              config={cfg}
              isEnabled={rolePermissions.has(p.id)}
              onToggle={onToggle}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main PermissionPage ──────────────────────────────────────────────────────
export default function PermissionPage({ asTab }) {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState(new Set());

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ── Fetch Roles ──
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await axios.get(`${BASE}/api/roles`, { headers: getHeaders() });
      const fetchedRoles = res.data.roles || [];
      setRoles(fetchedRoles);
      if (fetchedRoles.length > 0) setSelectedRole(fetchedRoles[0]);
    } catch (e) {
      console.error("Error fetching roles:", e);
    } finally {
      setLoadingRoles(false);
    }
  };

  // ── Fetch All Permissions ──
  const fetchAllPermissions = async () => {
    try {
      const res = await axios.get(`${BASE}/api/permissions`, { headers: getHeaders() });
      setPermissions(res.data.permissions || []);
    } catch (e) {
      console.error("Error fetching all permissions:", e);
    }
  };

  // ── Fetch Permissions for Selected Role ──
  const fetchRolePermissions = async (roleId) => {
    if (!roleId) return;
    try {
      setLoadingPerms(true);
      const res = await axios.get(`${BASE}/api/permissions/role/${roleId}`, {
        headers: getHeaders(),
      });
      setRolePermissions(new Set(res.data.permissions || []));
    } catch (e) {
      console.error("Error fetching role permissions:", e);
    } finally {
      setLoadingPerms(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) fetchRolePermissions(selectedRole.id);
  }, [selectedRole]);

  // ── Toggle Permission ──
  const handleTogglePermission = (permId) => {
    setRolePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  // ── Select / Deselect All ──
  const handleSelectAll = () => {
    setRolePermissions(new Set(permissions.map((p) => p.id)));
  };

  const handleDeselectAll = () => {
    setRolePermissions(new Set());
  };

  // ── Save Permissions ──
  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      setSuccessMsg("");
      await axios.post(
        `${BASE}/api/permissions/role/${selectedRole.id}`,
        { permission_ids: Array.from(rolePermissions) },
        { headers: getHeaders() }
      );
      setSuccessMsg(`Permissions for "${selectedRole.role_name}" updated successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      console.error("Error saving role permissions:", e);
      alert(e.response?.data?.message || "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  // ── Group permissions by category ──
  const groupedPermissions = () => {
    const grouped = {};
    permissions.forEach((p) => {
      const cfg = MODULE_CONFIG.find((m) => m.name === p.name);
      const cat = cfg?.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });
    return grouped;
  };

  const grouped = groupedPermissions();
  const enabledCount = rolePermissions.size;
  const totalCount = permissions.length;
  const allEnabled = enabledCount === totalCount && totalCount > 0;

  const content = (
    <div className="min-h-screen bg-slate-100 pt-2 px-6 pb-6">
      <TabBar activeTab="permissions" />

      {/* Success Toast */}
      {successMsg && (
        <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold rounded-2xl flex items-center gap-2 shadow-sm animate-pulse-once">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* ── Left column: Roles ── */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FaUserShield className="text-indigo-600" size={16} />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Company Roles</h2>
          </div>

          {loadingRoles ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-blue-600" />
            </div>
          ) : roles.length === 0 ? (
            <p className="text-xs text-slate-500 text-center font-bold">No roles found.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {roles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRole(r);
                      setSuccessMsg("");
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center justify-between cursor-pointer border ${isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80"
                      }`}
                  >
                    <span className="truncate">{r.role_name}</span>
                    {isSelected && <FaCheck size={9} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right column: Permissions ── */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col min-h-[400px]">
          {selectedRole ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
                <div className="flex-1">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Configure Permissions:{" "}
                    <span className="text-indigo-600">{selectedRole.role_name}</span>
                  </h3>
                  <p className="text-slate-500 text-[11px] font-semibold mt-1">
                    Toggle which feature modules this role can access across the platform.
                  </p>

                  {/* Permission summary bar */}
                  {!loadingPerms && totalCount > 0 && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${(enabledCount / totalCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 shrink-0">
                        {enabledCount}/{totalCount} modules
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={allEnabled ? handleDeselectAll : handleSelectAll}
                    disabled={loadingPerms || saving}
                    className="px-3 py-2 text-[10px] font-black text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {allEnabled ? (
                      <>
                        <ToggleLeft size={12} /> Disable All
                      </>
                    ) : (
                      <>
                        <ToggleRight size={12} /> Enable All
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving || loadingPerms}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black shadow-md shadow-indigo-100 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" size={10} /> Saving...
                      </>
                    ) : (
                      <>
                        <FaLock size={9} /> Save Permissions
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading state */}
              {loadingPerms ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <FaSpinner className="animate-spin text-indigo-600" size={24} />
                </div>
              ) : permissions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 text-xs font-bold gap-2">
                  <FaInfoCircle size={24} />
                  <span>No permissions defined in system.</span>
                </div>
              ) : (
                /* Grouped Permission Modules */
                <div>
                  {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((cat) => (
                    <CategorySection
                      key={cat}
                      category={cat}
                      permissions={grouped[cat]}
                      rolePermissions={rolePermissions}
                      onToggle={handleTogglePermission}
                      disabled={saving}
                    />
                  ))}
                  {/* Any uncategorised permissions */}
                  {grouped["Other"]?.length > 0 && (
                    <CategorySection
                      key="Other"
                      category="Other"
                      permissions={grouped["Other"]}
                      rolePermissions={rolePermissions}
                      onToggle={handleTogglePermission}
                      disabled={saving}
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-500 text-xs font-bold gap-2">
              <FaShieldAlt size={32} className="text-slate-300" />
              <span>Please select a company role to configure access.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return asTab ? content : <DashboardLayout>{content}</DashboardLayout>;
}
