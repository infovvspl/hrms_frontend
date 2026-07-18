import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getCompanyInitial, getCompanyLogoSrc, getEmployeeAvatarSrc } from "../../utils/companyLogo";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserMinus,
  Clock,
  Calendar,
  CreditCard,
  TrendingUp,
  Coins,
  Laptop,
  Folder,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  ChevronDown,
  LogOut,
  History,
} from "lucide-react";

export default function EmployeeSidebar({ collapsed: propCollapsed, setCollapsed: propSetCollapsed }) {
  const [localCollapsed, setLocalCollapsed] = useState(() => {
    return localStorage.getItem("employee_sidebar_collapsed") === "true";
  });
  const collapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;
  const setCollapsed = propSetCollapsed !== undefined ? propSetCollapsed : setLocalCollapsed;

  useEffect(() => {
    localStorage.setItem("employee_sidebar_collapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  const [employee, setEmployee] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("employee") || "{}") || {};
    } catch {
      return {};
    }
  });

  const [company, setCompany] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("company") || "{}") || {};
    } catch {
      return {};
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const leaveRoutes = [
    "/employee/leave",
    "/employee/leave/apply",
    "/employee/leave/history",
  ];

  const [expandedMenu, setExpandedMenu] = useState(() => {
    const isCollapsed = propCollapsed !== undefined ? propCollapsed : (localStorage.getItem("employee_sidebar_collapsed") === "true");
    if (isCollapsed) return null;

    const path = window.location.pathname;
    if (leaveRoutes.includes(path)) return "leave";
    return null;
  });

  useEffect(() => {
    if (collapsed) {
      setExpandedMenu(null);
      return;
    }
    const path = location.pathname;
    if (leaveRoutes.includes(path)) setExpandedMenu("leave");
    else setExpandedMenu(null);
  }, [location.pathname, collapsed]);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/company/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedCompany = res.data.company || {};
        setCompany(fetchedCompany);
        localStorage.setItem("company", JSON.stringify(fetchedCompany));
      } catch (error) {
        console.error("EmployeeSidebar company fetch error:", error);
      }
    };

    fetchCompany();
  }, [token]);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      try {
        const storedEmployee = JSON.parse(localStorage.getItem("employee") || "{}") || {};
        setEmployee(storedEmployee);
      } catch (error) {
        console.error("Error reading employee from localStorage in sidebar:", error);
      }
    };

    window.addEventListener("employee-avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("employee-avatar-updated", handleAvatarUpdate);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const loginSessionId = localStorage.getItem("login_session_id");

      if (token) {
        if (loginSessionId) {
          try {
            await axios.put(
              `${import.meta.env.VITE_SERVER_ADDRESS}/api/login-history/${loginSessionId}/logout`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (histErr) {
            console.error("Logout history update error:", histErr);
          }
        }

        await axios.post(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("employee");
    localStorage.removeItem("company");
    localStorage.removeItem("company_id");
    localStorage.removeItem("employee_id");
    localStorage.removeItem("login_session_id");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const employeeName = employee?.first_name
    ? `${employee.first_name} ${employee.last_name || ""}`.trim()
    : "Employee";

  const companyLogoSrc = getCompanyLogoSrc(company);
  const companyName = company?.company_name || "HRMS";
  const companySubtitle =
    company?.company_type_name ||
    company?.company_type?.company_type_name ||
    company?.company_type ||
    "Workforce Platform";

  const menuClass = ({ isActive }) => {
    const showActive = isActive && expandedMenu === null;
    return `flex items-center ${collapsed ? "w-10 h-10 justify-center p-0" : "justify-between gap-3 px-3 py-3"
      } rounded-xl transition-all duration-300 group ${showActive
        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
        : "text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white"
      }`;
  };

  const getParentClass = (isActive) => {
    return `flex items-center ${collapsed ? "w-10 h-10 justify-center p-0" : "w-full justify-between gap-3 px-3 py-3"
      } rounded-xl transition-all duration-300 group cursor-pointer ${isActive
        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
        : "text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white"
      }`;
  };

  const subMenuLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${isActive
      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
      : "text-slate-400 hover:text-white hover:bg-white/5"
    }`;

  // Complete list of menu items reverted back to exactly match screenshot names
  const menuItems = [
    { name: "Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
    { name: "Employee Management", path: "/employee/profile", icon: Users },
    { name: "Recruitment", path: "#recruitment", icon: UserPlus },
    { name: "Attendance", path: "/employee/attendance", icon: Clock },
    { name: "Payroll", path: "/employee/payroll", icon: CreditCard },
    { name: "Performance", path: "#performance", icon: TrendingUp },
    { name: "Loan & Advance", path: "#loan", icon: Coins },
    { name: "Asset Management", path: "/employee/assets", icon: Laptop },
    { name: "Document Management", path: "/employee/documents", icon: Folder },
    { name: "Login History", path: "/employee/login-history", icon: History },
    { name: "Resignation", path: "/employee/resignation", icon: UserMinus },
    { name: "Reports & Analytics", path: "#reports", icon: BarChart3 },
    { name: "Settings", path: "#settings", icon: Settings },
    { name: "System Administration", path: "#admin", icon: ShieldCheck },
  ];


  return (
    <div
      className={`relative h-screen sticky top-0 flex flex-col bg-[#0b1220] text-white transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Header with Logo and Collapse Toggle */}
      <div className="p-4 border-b border-white/10 shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg overflow-hidden shrink-0 cursor-pointer hover:opacity-90"
              title="Expand Sidebar"
            >
              {companyLogoSrc ? (
                <img
                  src={companyLogoSrc}
                  alt={`${companyName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {getCompanyInitial(company)}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="text-slate-400 hover:text-white transition duration-150 p-1 cursor-pointer"
              title="Expand Sidebar"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                {companyLogoSrc ? (
                  <img
                    src={companyLogoSrc}
                    alt={`${companyName} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {getCompanyInitial(company)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm truncate">{companyName}</h1>
                <p className="text-[10px] text-slate-400 truncate">{companySubtitle}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-slate-400 hover:text-white transition duration-150 p-1 cursor-pointer shrink-0"
              title="Collapse Sidebar"
            >
              <ChevronsLeft size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Menu List */}
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isMock = item.path.startsWith("#");

          const isAfterAttendance = item.name === "Payroll";

          return (
            <div key={item.name} className="space-y-1.5">
              {isAfterAttendance && (
                <div>
                  <button
                    onClick={() => {
                      if (!collapsed) {
                        setExpandedMenu(prev => prev === "leave" ? null : "leave");
                      }
                      navigate("/employee/leave");
                    }}
                    className={getParentClass(leaveRoutes.includes(location.pathname))}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Calendar size={18} />
                      {!collapsed && <span className="truncate">Leave Management</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-slate-400 group-hover:text-white transition duration-150">
                        {expandedMenu === "leave" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    )}
                  </button>

                  {expandedMenu === "leave" && !collapsed && (
                    <div className="ml-10 mt-1 flex flex-col gap-1 text-sm">
                      <NavLink to="/employee/leave/apply" className={subMenuLinkClass}>Apply Leave</NavLink>
                      <NavLink to="/employee/leave/history" className={subMenuLinkClass}>Leave History</NavLink>
                    </div>
                  )}
                </div>
              )}

              {isMock ? (
                <button
                  onClick={() => alert(`${item.name} module is currently limited to Administrators.`)}
                  className={`flex items-center ${collapsed ? "w-10 h-10 justify-center p-0" : "w-full justify-between gap-3 px-3 py-3"} rounded-xl text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white transition-all duration-300 group cursor-pointer`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={18} className="text-slate-300 group-hover:text-white transition-colors" />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!collapsed && <ChevronRight size={14} className="text-slate-400 group-hover:text-white transition duration-150 animate-fadeIn" />}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => menuClass({ isActive })}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={18} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!collapsed && item.name !== "Dashboard" && (
                    <ChevronRight
                      size={14}
                      className="text-slate-400 group-hover:text-white transition duration-150 animate-fadeIn"
                    />
                  )}
                </NavLink>
              )}
            </div>
          );
        })}
      </div>

      {/* Employee Info & Logout */}
      <div className="mt-auto border-t border-white/10 p-3 space-y-2 shrink-0 bg-[#080d17]">
        {/* Employee Profile Summary */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-indigo-400/20 overflow-hidden">
            {employee?.image ? (
              <img
                src={getEmployeeAvatarSrc(employee.image)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              employee?.first_name ? `${employee.first_name[0]}${employee.last_name ? employee.last_name[0] : ""}`.toUpperCase() : "EE"
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{employeeName}</p>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">
                {employee?.role_name || "Employee"}
              </p>
            </div>
          )}
        </div>
        
        <button
          className={`w-full flex items-center ${collapsed ? "justify-center py-3" : "gap-3 px-4 py-3"} mt-1 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer`}
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} />
          {!collapsed && (
            <span className="text-sm font-medium">
              Logout
            </span>
          )}
        </button>

      </div>

      {/* Custom Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}
