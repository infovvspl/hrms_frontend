import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaShieldAlt,
  FaCheck,
  FaSpinner,
  FaUserShield,
  FaLock,
  FaInfoCircle,
} from "react-icons/fa";
import DashboardLayout from "../layouts/DashboardLayout";
import TabBar from "../components/company/TabBar";

const BASE = import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function PermissionPage({ asTab }) {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState(new Set());

  // Loaders & feedback
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ── Fetch Roles ──
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await axios.get(`${BASE}/api/roles`, {
        headers: getHeaders(),
      });
      const fetchedRoles = res.data.roles || [];
      setRoles(fetchedRoles);
      if (fetchedRoles.length > 0) {
        setSelectedRole(fetchedRoles[0]);
      }
    } catch (e) {
      console.error("Error fetching roles:", e);
    } finally {
      setLoadingRoles(false);
    }
  };

  // ── Fetch All Permissions ──
  const fetchAllPermissions = async () => {
    try {
      const res = await axios.get(`${BASE}/api/permissions`, {
        headers: getHeaders(),
      });
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
    if (selectedRole) {
      fetchRolePermissions(selectedRole.id);
    }
  }, [selectedRole]);

  // ── Toggle Permission Checkbox ──
  const handleTogglePermission = (permId) => {
    setRolePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  // ── Save Permissions Mappings ──
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

  const content = (
    <div className="min-h-screen bg-slate-100 pt-2 px-6 pb-6">
      <TabBar activeTab="permissions" />

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold rounded-2xl flex items-center gap-2 shadow-sm">
          <FaCheck /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* ── Left column: Roles list ── */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FaUserShield className="text-indigo-655 text-indigo-600" size={16} />
            <h2 className="text-xs font-black text-slate-850 uppercase tracking-wider">Company Roles</h2>
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
                    className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black transition flex items-center justify-between cursor-pointer border ${
                      isSelected
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

        {/* ── Right column: Permissions mapping ── */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col min-h-[400px]">
          {selectedRole ? (
            <>
              {/* Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">
                    Configure Permissions: <span className="text-indigo-600 font-black">{selectedRole.role_name}</span>
                  </h3>
                  <p className="text-slate-550 text-[11px] font-semibold mt-0.5">
                    Select what pages and management modules are accessible by this role
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || loadingPerms}
                  className="self-start sm:self-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <FaLock size={10} /> Save Permissions
                    </>
                  )}
                </button>
              </div>

              {/* Loading state for role permissions */}
              {loadingPerms ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <FaSpinner className="animate-spin text-blue-600" size={24} />
                </div>
              ) : permissions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 text-xs font-bold gap-2">
                  <FaInfoCircle size={24} />
                  <span>No permissions defined in system.</span>
                </div>
              ) : (
                /* Permissions list */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {permissions.map((p) => {
                    const isChecked = rolePermissions.has(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleTogglePermission(p.id)}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-355 bg-white"
                        }`}>
                          {isChecked && <FaCheck size={8} />}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-xs">{p.name}</p>
                          <p className="text-[10px] text-slate-600 mt-1 leading-normal font-semibold">
                            {p.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
