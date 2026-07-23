import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { getCompanyInitial, getCompanyLogoSrc, getEmployeeAvatarSrc } from "../../utils/companyLogo";

import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  UserMinus,
  Clock,
  Calendar,
  CalendarDays,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  History,
  Package,
  Plane,
  Folder,
  Laptop,
  User
} from "lucide-react";

export default function DynamicSidebar({ collapsed: propCollapsed, setCollapsed: propSetCollapsed }) {
  const [localCollapsed, setLocalCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const collapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;
  const setCollapsed = propSetCollapsed !== undefined ? propSetCollapsed : setLocalCollapsed;

  const role = localStorage.getItem("role") || "company";
  const token = localStorage.getItem("token");

  const location = useLocation();

  const [permissions, setPermissions] = useState(new Set());
  const [loadingPerms, setLoadingPerms] = useState(role === "employee");

  const [expandedMenu, setExpandedMenu] = useState(null);

  const [company, setCompany] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("company") || "{}");
    } catch {
      return {};
    }
  });

  const [employee, setEmployee] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("employee") || "{}");
    } catch {
      return {};
    }
  });

  // Fetch data on load
  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!token || role !== "employee") return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/permissions/my-permissions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPermissions(new Set(res.data.permissions || []));
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setLoadingPerms(false);
      }
    };
    fetchPermissions();

    const fetchCompany = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/company/me`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const fetchedCompany = res.data.company || {};
        setCompany(fetchedCompany);
        localStorage.setItem("company", JSON.stringify(fetchedCompany));
      } catch (error) {
        console.error("Sidebar company fetch error:", error);
      }
    };
    fetchCompany();
  }, [token, role]);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      try {
        const storedEmployee = JSON.parse(localStorage.getItem("employee") || "{}");
        setEmployee(storedEmployee);
      } catch (error) {
        console.error("Error reading employee avatar:", error);
      }
    };
    window.addEventListener("employee-avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("employee-avatar-updated", handleAvatarUpdate);
  }, []);

  const handleLogout = async () => {
    try {
      const loginSessionId = localStorage.getItem("login_session_id");
      if (token) {
        if (loginSessionId) {
          try {
            await axios.put(
              `${import.meta.env.VITE_SERVER_ADDRESS}/api/login-history/${loginSessionId}/logout`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (histErr) { }
        }
        await axios.post(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const companyLogoSrc = getCompanyLogoSrc(company);
  const companyName = company.company_name || "HRMS";
  const companySubtitle =
    company.company_type_name ||
    company.company_type?.company_type_name ||
    company.company_type ||
    "Workforce Platform";

  const employeeName = employee?.first_name
    ? `${employee.first_name} ${employee.last_name || ""}`.trim()
    : "Employee";


  const menuConfig = [
    // ----------------------------------------------------
    // DASHBOARDS
    // ----------------------------------------------------
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      requiredRole: "company"
    },
    {
      label: "My Dashboard",
      icon: LayoutDashboard,
      path: "/employee/dashboard",
      requiredRole: "employee",
      requiredPermission: "My Dashboard View"
    },
    // ----------------------------------------------------
    // EMPLOYEE SELF-SERVICE (Personal Modules)
    // ----------------------------------------------------
    {
      label: "My Profile",
      icon: User,
      path: "/employee/profile",
      requiredRole: "employee",
      requiredPermission: "My Profile View"
    },
    {
      label: "My Attendance",
      icon: Clock,
      path: "/employee/attendance",
      requiredRole: "employee",
      requiredPermission: "My Attendance View"
    },
    {
      label: "My Leaves",
      icon: Calendar,
      id: "my_leaves",
      requiredRole: "employee",
      subItems: [
        { label: "Overview", path: "/employee/leave", requiredPermission: "My Leaves View" },
        { label: "Apply Leave", path: "/employee/leave/apply", requiredPermission: "Apply Leave" },
        { label: "Leave History", path: "/employee/leave/history", requiredPermission: "My Leave History" }
      ]
    },
    {
      label: "My Payroll",
      icon: CreditCard,
      path: "/employee/payroll",
      requiredRole: "employee",
      requiredPermission: "My Payroll View"
    },
    {
      label: "My Assets",
      icon: Laptop,
      path: "/employee/assets",
      requiredRole: "employee",
      requiredPermission: "My Assets View"
    },
    {
      label: "My Travel",
      icon: Plane,
      path: "/employee/travel",
      requiredRole: "employee",
      requiredPermission: "My Travel View"
    },
    {
      label: "My Documents",
      icon: Folder,
      path: "/employee/documents",
      requiredRole: "employee",
      requiredPermission: "My Documents View"
    },
    {
      label: "My Login History",
      icon: History,
      path: "/employee/login-history",
      requiredRole: "employee",
      requiredPermission: "My Login History View"
    },
    {
      label: "Resignation",
      icon: UserMinus,
      path: "/employee/resignation",
      requiredRole: "employee",
      requiredPermission: "Resignation Apply"
    },
    // ----------------------------------------------------
    // COMPANY SETUP
    // ----------------------------------------------------
    {
      label: "Company",
      icon: Building2,
      id: "company",
      requiredRole: "company",
      subItems: [
        { label: "Company Profile", path: "/company" },
        { label: "Branch", path: "/branch" },
        { label: "Role", path: "/role" },
        { label: "Designation", path: "/designation" },
        { label: "Department", path: "/department" },
        { label: "Permissions", path: "/permissions" }
      ]
    },
    // ----------------------------------------------------
    // ADMINISTRATION (Requires Permissions)
    // ----------------------------------------------------
    {
      label: "Employees",
      icon: Users,
      id: "employees",
      subItems: [
        { label: "All Employees", path: "/employees", requiredPermission: "Employee List View" },
        { label: "Offer Letters", path: "/offer-letters", requiredPermission: "Offer Letters Admin" },
        { label: "Experience Letters", path: "/experience-letters", requiredPermission: "Experience Letters Admin" },
        { label: "Relieving Letters", path: "/relieving-letters", requiredPermission: "Relieving Letters Admin" },
        { label: "Warning Letters", path: "/warning-letters", requiredPermission: "Warning Letters Admin" },
        { label: "Termination Letters", path: "/termination-letters", requiredPermission: "Termination Letters Admin" }
      ]
    },
    {
      label: "Attendance",
      icon: Clock,
      id: "attendance_admin",
      subItems: [
        { label: "Admin Dashboard", path: "/attendance", requiredPermission: "Attendance Admin Dashboard" },
        { label: "Daily Tracking", path: "/daily-tracking", requiredPermission: "Daily Tracking Admin" },
        { label: "Shifts", path: "/shift", requiredPermission: "Shifts Admin" }
      ]
    },
    {
      label: "Holidays",
      icon: Calendar,
      id: "holiday_admin",
      subItems: [
        { label: "Manage Holidays", path: "/holiday", requiredPermission: "Holidays Admin" },
        { label: "Calendar", path: "/holiday/calendar", requiredPermission: "Holiday Calendar View" }
      ]
    },
    {
      label: "Leave Admin",
      icon: CalendarDays,
      id: "leave_admin",
      subItems: [
        { label: "Admin Dashboard", path: "/leave-dashboard", requiredPermission: "Leave Admin Dashboard" },
        { label: "Leave Requests", path: "/leave-requests", requiredPermission: "Leave Requests Admin" },
        { label: "Leave Types", path: "/leave-types", requiredPermission: "Leave Types Admin" }
      ]
    },
    {
      label: "Payroll Admin",
      icon: CreditCard,
      id: "payroll_admin",
      subItems: [
        { label: "Admin Dashboard", path: "/payroll", requiredPermission: "Payroll Admin Dashboard" },
        { label: "Salary Details", path: "/payroll/salary-details", requiredPermission: "Salary Details Admin" },
        { label: "Payslips", path: "/payroll/payslip", requiredPermission: "Payslips Admin" }
      ]
    },
    {
      label: "Recruitment",
      icon: UserPlus,
      id: "recruitment",
      subItems: [
        { label: "Resume Analyser", path: "/resume-analyser", requiredPermission: "Resume Analyser" },
        { label: "Interview Scheduler", path: "/interview-scheduler", requiredPermission: "Interview Scheduler" }
      ]
    },
    {
      label: "Asset Admin",
      icon: Package,
      path: "/assets",
      requiredPermission: "Assets Admin"
    },
    {
      label: "Travel Admin",
      icon: Plane,
      path: "/travel",
      requiredPermission: "Travel Admin"
    },
    {
      label: "Login History Logs",
      icon: History,
      path: "/login-history",
      requiredPermission: "Company Login History"
    },
  ];


  // Helper to determine if an item is active
  const isItemActive = (item) => {
    if (item.path && location.pathname === item.path) return true;
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.path);
    }
    return false;
  };

  // Expand logic
  useEffect(() => {
    if (collapsed) {
      setExpandedMenu(null);
      return;
    }
    const activeItem = menuConfig.find(item => isItemActive(item) && item.subItems);
    if (activeItem) {
      setExpandedMenu(activeItem.id);
    } else {
      setExpandedMenu(null);
    }
  }, [location.pathname, collapsed]);

  const menuClass = (isActive) => {
    const showActive = isActive && expandedMenu === null;
    return `flex items-center ${collapsed ? "w-10 h-10 justify-center p-0" : "justify-between gap-3 px-3 py-3"
      } rounded-xl transition-all duration-300 group ${showActive
        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
        : "text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white"
      }`;
  };

  const getParentClass = (isActive, isExpanded) => {
    if (collapsed) {
      return `flex items-center w-10 h-10 justify-center p-0 rounded-xl transition-all duration-300 group ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
          : "text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white"
      }`;
    }

    if (isExpanded) {
      return `flex items-center w-full justify-between gap-3 px-3 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
          : "text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white"
      }`;
    }

    return `flex items-center w-full justify-between gap-3 px-3 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
        : "text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white"
    }`;
  };

  const subMenuLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${isActive
      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
      : "text-slate-400 hover:text-white hover:bg-white/5"
    }`;

  // Filter items based on Role and Permissions
  const filteredMenu = menuConfig
    .map(item => {
      // First, filter the subItems if they exist
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter(sub => {
          if (sub.requiredRole && sub.requiredRole !== role) return false;
          if (sub.requiredPermission) {
            if (role === "company") return true;
            if (loadingPerms) return false;
            return permissions.has(sub.requiredPermission);
          }
          return true;
        });
        return { ...item, subItems: filteredSubItems };
      }
      return item;
    })
    .filter(item => {
      // Filter the parent item
      if (item.requiredRole && item.requiredRole !== role) {
        return false;
      }
      if (item.requiredPermission) {
        if (role === "company") return true;
        if (loadingPerms) return false;
        if (!permissions.has(item.requiredPermission)) return false;
      }
      // If it's a dropdown, only show it if there is at least one visible subItem
      if (item.subItems && item.subItems.length === 0) {
        return false;
      }
      return true;
    });

  return (
    <div
      className={`relative h-screen sticky top-0 flex flex-col bg-[#0b1220] text-white transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      <div className="p-4 border-b border-white/10">
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
                <h1 className="font-semibold text-lg truncate">{companyName}</h1>
                <p className="text-xs text-slate-400 truncate">{companySubtitle}</p>
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

      {/* Menu */}
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredMenu.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);

          if (item.subItems && item.subItems.length > 0) {
            const mainPath = item.subItems[0].path;
            const dropdownSubItems = item.subItems.slice(1);

            return (
              <div key={item.id || index}>
                <NavLink
                  to={mainPath}
                  onClick={() => {
                    if (!collapsed) {
                      setExpandedMenu(item.id);
                    }
                  }}
                  className={getParentClass(isActive, expandedMenu === item.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={18} />
                    {!collapsed && <span className="truncate text-sm">{item.label}</span>}
                  </div>

                  {!collapsed && dropdownSubItems.length > 0 && (
                    <span className="text-slate-400 group-hover:text-white transition duration-150">
                      {expandedMenu === item.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </NavLink>

                {expandedMenu === item.id && !collapsed && dropdownSubItems.length > 0 && (
                  <div className="ml-10 mt-1 flex flex-col gap-1 text-sm">
                    {dropdownSubItems.map(sub => (
                      <NavLink key={sub.path} to={sub.path} className={subMenuLinkClass}>
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink key={item.path || index} to={item.path} className={({ isActive }) => menuClass(isActive)}>
              <div className="flex items-center gap-3 min-w-0">
                <Icon size={18} />
                {!collapsed && <span className="truncate text-sm">{item.label}</span>}
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Employee Info & Logout (If employee) or just Logout (If company) */}
      <div className="mt-auto border-t border-white/10 bg-[#080d17]">
        {role === "employee" && (
          <div className={`p-3 pb-1 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
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
        )}

        <button
          className={`w-full flex items-center ${collapsed ? "justify-center py-4" : "gap-3 px-4 py-4"
            } text-slate-300 hover:bg-white/5 hover:text-white transition-all`}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          {!collapsed && (
            <span className="text-sm font-medium cursor-pointer">
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
