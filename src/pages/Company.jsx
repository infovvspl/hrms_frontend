import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import CompanyModal from "../components/company/CompanyModal";
import { useLocation } from "react-router-dom";

import { useNavigate } from "react-router-dom";

//const navigate = useNavigate();
import {
  Eye,
  Pencil,
  Building2,
  GitBranch,
  ShieldCheck,
  BadgeCheck,
  LayoutGrid,
  Network,
} from "lucide-react";

// ─── Import the other pages ────────────────────────────────────────────────────
import Branch from "../pages/Branch";
import Role from "../pages/Role";
import Designation from "../pages/Designation";
import Department from "../pages/Department";
import EmployeeTree from "../pages/EmployeeTree";
import { getCompanyInitial, getCompanyLogoSrc } from "../utils/companyLogo";

// ─── TAB CONFIG ────────────────────────────────────────────────────────────────
const TABS = [
  { key: "company", label: "Company", icon: Building2 },
  { key: "branch", label: "Branch", icon: GitBranch },
  { key: "role", label: "Role", icon: ShieldCheck },
  { key: "designation", label: "Designation", icon: BadgeCheck },
  { key: "department", label: "Department", icon: LayoutGrid },
  { key: "employee-tree", label: "Org Tree", icon: Network },
];

const getCompanyTypeLabel = (company = {}) =>
  company.company_type_name ||
  company.company_type?.company_type_name ||
  company.company_type?.name ||
  (typeof company.company_type === "string" ? company.company_type : "") ||
  "Registered Company";

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function Company() {
  //const [activeTab, setActiveTab] = useState("company");

  const location = useLocation();

  const activeTab =
    location.pathname === "/branch"
      ? "branch"
      : location.pathname === "/role"
        ? "role"
        : location.pathname === "/designation"
          ? "designation"
          : location.pathname === "/department"
            ? "department"
            : location.pathname === "/employee-tree"
              ? "employee-tree"
              : "company";

  // Company state
  const [openCompany, setOpenCompany] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [viewCompany, setViewCompany] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch Company ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/company/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        // log response to help debug missing fields after refresh
        console.log("Fetch Company Response:", res.data);

        // Normalize sector field: backend might return different keys
        const company = res.data.company || {};
        const sector = company.sector ?? company.sector_name ?? company.company_sector ?? (company.sector && company.sector.name) ?? "";

        const normalizedCompany = { ...company, sector };
        setCompanyData(normalizedCompany);
        localStorage.setItem("company", JSON.stringify(normalizedCompany));
        window.dispatchEvent(new Event("company-updated"));
      } catch (err) {
        console.error("Fetch Company Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);


  // ── Update Company ─────────────────────────────────────────────────────────────
  const handleSaveCompany = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const hasFiles = updatedData.logoFile instanceof File || updatedData.stampFile instanceof File;

      const payload = hasFiles ? new FormData() : { ...updatedData };

      if (hasFiles) {
        Object.entries(updatedData).forEach(([key, value]) => {
          if (
            ["logoFile", "logo", "stampFile", "stamp"].includes(key) ||
            value === undefined ||
            value === null
          ) {
            return;
          }
          payload.append(key, value);
        });

        if (updatedData.logoFile instanceof File) {
          payload.append("logo", updatedData.logoFile);
        }
        if (updatedData.stampFile instanceof File) {
          payload.append("stamp", updatedData.stampFile);
        }
      } else {
        delete payload.logoFile;
        delete payload.stampFile;
      }

      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/company/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(hasFiles ? { "Content-Type": "multipart/form-data" } : {}),
          },
        },
      );
      // update UI immediately: merge server response with submitted fields
      const serverCompany = res?.data?.company || {};
      const localUpdatedData = { ...updatedData };
      delete localUpdatedData.logoFile;
      delete localUpdatedData.stampFile;

      const mergedCompany = { ...(companyData || {}), ...serverCompany, ...localUpdatedData };
      setCompanyData(mergedCompany);
      localStorage.setItem("company", JSON.stringify(mergedCompany));
      window.dispatchEvent(new Event("company-updated"));
      setOpenCompany(false);
      setEditCompany(null);
      alert("Company updated successfully");
    } catch (error) {
      console.error("Update Error:", error);
      alert(error?.response?.data?.message || "Failed to update company");
    }
  };

  // ── Non-company tabs: render the page component directly (no DashboardLayout wrapper)
  // We pass asTab=true so each page knows to skip its own DashboardLayout
  if (activeTab === "branch") {
    return (
      <DashboardLayout>
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Branch asTab />
      </DashboardLayout>
    );
  }

  if (activeTab === "role") {
    return (
      <DashboardLayout>
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Role asTab />
      </DashboardLayout>
    );
  }

  if (activeTab === "designation") {
    return (
      <DashboardLayout>
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Designation asTab />
      </DashboardLayout>
    );
  }

  if (activeTab === "department") {
    return (
      <DashboardLayout>
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Department asTab />
      </DashboardLayout>
    );
  }

  if (activeTab === "employee-tree") {
    return (
      <DashboardLayout>
        <EmployeeTree asTab />
      </DashboardLayout>
    );
  }

  // ── Default: Company tab ────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <TabBar activeTab={activeTab} />

      {loading ? (
        <div className="p-10 text-center">Loading...</div>
      ) : !companyData ? (
        <div className="p-10 text-center text-red-500">No company found</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-600 to-violet-600" />

          <div className="p-8">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center font-bold text-2xl overflow-hidden">
                  {getCompanyLogoSrc(companyData) ? (
                    <img
                      src={getCompanyLogoSrc(companyData)}
                      alt={`${companyData.company_name || "Company"} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getCompanyInitial(companyData)
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {companyData.company_name}
                  </h2>
                  <p className="text-slate-500">{getCompanyTypeLabel(companyData)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setViewCompany(companyData)}
                  className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => {
                    setEditCompany(companyData);
                    setOpenCompany(true);
                  }}
                  className="h-11 w-11 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center"
                >
                  <Pencil size={18} />
                </button>
              </div>
            </div>

            {/* Details Card */}
            <div className="py-5" >
              <div className="divide-y divide-slate-100">
                {[
                  { label: "Email Address", value: companyData.email },
                  {
                    label: "Login Type",
                    value: companyData.login_type
                      ? companyData.login_type.charAt(0).toUpperCase() + companyData.login_type.slice(1)
                      : "Email",
                  },
                  { label: "Phone Number", value: companyData.phone },
                  { label: "Sector", value: companyData.sector || "Not Added" },
                  {
                    label: "GST Number",
                    value: companyData.gst_no || "Not Added",
                  },
                  {
                    label: "CIN Number",
                    value: companyData.cin_number || "Not Added",
                  },
                  {
                    label: "Registration Number",
                    value: companyData.registration_number || "Not Added",
                  },
                  {
                    label: "Address Line 1",
                    value: companyData.address1 || "Not Added",
                  },
                  {
                    label: "Address Line 2",
                    value: companyData.address2 || "Not Added",
                  },
                  { label: "City", value: companyData.city || "Not Added" },
                  { label: "State", value: companyData.state || "Not Added" },
                  {
                    label: "Pincode",
                    value: companyData.pincode || "Not Added",
                  },
                  {
                    label: "Country",
                    value: companyData.country || "Not Added",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="group relative grid md:grid-cols-[220px_1fr] px-8 py-6 overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-violet-50/80 hover:pl-12 hover:shadow-[0_8px_25px_rgba(99,102,241,0.12)]"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent" />
                    <div className="absolute left-0 top-0 h-full w-0 group-hover:w-2 bg-gradient-to-b transition-all duration-300" />
                    <p className="relative text-sm font-medium text-slate-500 group-hover:text-indigo-700 transition-colors duration-300">
                      {label}
                    </p>
                    <p className="relative text-slate-900 font-semibold break-all group-hover:text-slate-950 transition-colors duration-300">
                      {value}
                    </p>
                  </div>
                ))}

                {/* Stamp row */}
                <div className="group relative grid md:grid-cols-[220px_1fr] px-8 py-6 overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-violet-50/80 hover:pl-12 hover:shadow-[0_8px_25px_rgba(99,102,241,0.12)]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent" />
                  <div className="absolute left-0 top-0 h-full w-0 group-hover:w-2 bg-gradient" />
                  <p className="relative text-sm font-medium text-slate-500 group-hover:text-indigo-700 transition-colors duration-300">
                    Company Stamp
                  </p>
                  <div className="relative">
                    {companyData.stamp ? (
                      <img
                        src={`http://localhost:5000/${companyData.stamp}`}
                        alt="Company Stamp"
                        className="h-20 w-20 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
                      />
                    ) : (
                      <p className="relative text-slate-900 font-semibold group-hover:text-slate-950 transition-colors duration-300">Not Added</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Edit Modal */}
      <CompanyModal
        key={`${openCompany}-${editCompany?.id ?? "new"}`}
        open={openCompany}
        onClose={() => {
          setOpenCompany(false);
          setEditCompany(null);
        }}
        onSave={handleSaveCompany}
        editData={editCompany}
      />

      {/* View Modal */}
      {viewCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 py-5 text-white">
              <button
                onClick={() => setViewCompany(null)}
                className="absolute right-5 top-5 h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 hover:bg-red-500 hover:rotate-90"
              >
                ✕
              </button>
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white border-4 border-white/30 overflow-hidden">
                  {getCompanyLogoSrc(viewCompany) ? (
                    <img
                      src={getCompanyLogoSrc(viewCompany)}
                      alt={`${viewCompany.company_name || "Company"} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getCompanyInitial(viewCompany)
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    {viewCompany.company_name}
                  </h2>
                  <p className="text-indigo-100">Company Profile Details</p>
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: "Logo",
                    value: getCompanyLogoSrc(viewCompany) ? "Uploaded" : "No Logo Uploaded",
                    color: "hover:border-blue-400",
                  },
                  {
                    label: "Stamp",
                    value: viewCompany.stamp ? "Uploaded" : "No Stamp Uploaded",
                    color: "hover:border-teal-400",
                    isStamp: true,
                  },
                  {
                    label: "Email",
                    value: viewCompany.email,
                    color: "hover:border-indigo-400",
                  },
                  {
                    label: "Login Type",
                    value: viewCompany.login_type
                      ? viewCompany.login_type.charAt(0).toUpperCase() + viewCompany.login_type.slice(1)
                      : "Email",
                    color: "hover:border-teal-400",
                  },
                  {
                    label: "Phone",
                    value: viewCompany.phone,
                    color: "hover:border-green-400",
                  },
                  {
                    label: "Sector",
                    value: viewCompany.sector || "No Data",
                    color: "hover:border-yellow-400",
                  },
                  {
                    label: "GST Number",
                    value: viewCompany.gst_no,
                    color: "hover:border-purple-400",
                  },
                  {
                    label: "CIN Number",
                    value: viewCompany.cin_number,
                    color: "hover:border-pink-400",
                  },
                  {
                    label: "Registration Number",
                    value: viewCompany.registration_number,
                    color: "hover:border-cyan-400",
                  },
                  {
                    label: "Address Line 1",
                    value: viewCompany.address1 || "No Address Available",
                    color: "hover:border-rose-500 hover:bg-rose-50",
                  },
                  {
                    label: "Address Line 2",
                    value: viewCompany.address2 || "No Address Available",
                    color: "hover:border-rose-500 hover:bg-rose-50",
                  },
                  {
                    label: "City",
                    value: viewCompany.city || "No Address Available",
                    color: "hover:border-rose-500 hover:bg-rose-50",
                  },
                  {
                    label: "State",
                    value: viewCompany.state || "No Address Available",
                    color: "hover:border-rose-500 hover:bg-rose-50",
                  },
                  {
                    label: "Pincode",
                    value: viewCompany.pincode || "No Address Available",
                    color: "hover:border-rose-500 hover:bg-rose-50",
                  },
                  {
                    label: "Country",
                    value: viewCompany.country || "No Address Available",
                    color: "hover:border-rose-500 hover:bg-rose-50",
                  },
                ].map(({ label, value, color, isStamp }) => (
                  <div
                    key={label}
                    className={`rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 ${color} hover:shadow-lg`}
                  >
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      {label}
                    </p>
                    {isStamp && viewCompany.stamp ? (
                      <img
                        src={`http://localhost:5000/${viewCompany.stamp}`}
                        alt="Company Stamp"
                        className="mt-2 h-16 w-16 object-contain rounded border border-slate-200 bg-white p-1"
                      />
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-slate-800 break-all">
                        {value || "N/A"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-8 py-5">
              <button
                onClick={() => setViewCompany(null)}
                className="rounded-xl border border-slate-300 px-5 py-2 font-medium text-slate-700 transition-all hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ─── TAB BAR extracted as a reusable component ─────────────────────────────────
function TabBar({ activeTab }) {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-2 mb-7 shadow-xl overflow-hidden relative">
      <div className="absolute right-0 top-0 h-full w-64 bg-white/5 blur-3xl pointer-events-none" />
      <div className="relative z-10 flex items-center gap-1 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              //onClick={() => setActiveTab(key)}
              onClick={() => navigate(
                key === "company" ? "/company" : `/${key}`
              )}
              className={`
                flex items-center gap-2 px-5 py-2 rounded-2xl font-semibold text-sm transition-all duration-200 flex-1 justify-center
                ${active
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
