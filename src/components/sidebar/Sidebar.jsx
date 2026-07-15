import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getCompanyInitial, getCompanyLogoSrc } from "../../utils/companyLogo";

import {
  LayoutDashboard,
  Building2,
  Users,
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
} from "lucide-react";

export default function Sidebar({ collapsed: propCollapsed, setCollapsed: propSetCollapsed }) {
  const [localCollapsed, setLocalCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const collapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;
  const setCollapsed = propSetCollapsed !== undefined ? propSetCollapsed : setLocalCollapsed;

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  const location = useLocation();
  const navigate = useNavigate();

  const companyRoutes = [
    "/company",
    "/branch",
    "/role",
    "/designation",
    "/department",
  ];

  const employeeRoutes = [
    "/employees",
    "/offer-letters",
    "/experience-letters",
    "/relieving-letters",
    "/warning-letters",
    "/termination-letters",
  ];

  const attendanceRoutes = [
    "/attendance",
    "/daily-tracking",
    "/shift",
  ];

  const holidayRoutes = [
    "/holiday",
    "/holiday/calendar",
  ];

  const leaveRoutes = [
    "/leave-dashboard",
    "/leave-requests",
    "/leave-types",
  ];

  const payrollRoutes = [
    "/payroll",
    "/payroll/salary-details",
    "/payroll/payslip",
  ];

  const [expandedMenu, setExpandedMenu] = useState(() => {
    const isCollapsed = propCollapsed !== undefined ? propCollapsed : (localStorage.getItem("sidebar_collapsed") === "true");
    if (isCollapsed) return null;

    const path = window.location.pathname;
    if (companyRoutes.includes(path)) return "company";
    if (employeeRoutes.includes(path)) return "employees";
    if (attendanceRoutes.includes(path)) return "attendance";
    if (holidayRoutes.includes(path)) return "holiday";
    if (leaveRoutes.includes(path)) return "leave";
    if (payrollRoutes.includes(path)) return "payroll";
    return null;
  });

  const [company, setCompany] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("company") || "{}");
    } catch {
      return {};
    }
  });

  const isCompanyActive = companyRoutes.includes(location.pathname);
  const isEmployeesActive = employeeRoutes.includes(location.pathname);
  const isAttendanceActive = attendanceRoutes.includes(location.pathname);
  const isHolidayActive = holidayRoutes.includes(location.pathname);
  const isLeaveActive = leaveRoutes.includes(location.pathname);
  const isPayrollActive = payrollRoutes.includes(location.pathname);
  const companyLogoSrc = getCompanyLogoSrc(company);
  const companyName = company.company_name || "HRMS";
  const companySubtitle =
    company.company_type_name ||
    company.company_type?.company_type_name ||
    company.company_type ||
    "Workforce Platform";

  useEffect(() => {
    const syncCompany = () => {
      try {
        setCompany(JSON.parse(localStorage.getItem("company") || "{}"));
      } catch {
        setCompany({});
      }
    };

    const fetchCompany = async () => {
      const token = localStorage.getItem("token");
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

    syncCompany();
    fetchCompany();
    window.addEventListener("storage", syncCompany);
    window.addEventListener("company-updated", syncCompany);

    return () => {
      window.removeEventListener("storage", syncCompany);
      window.removeEventListener("company-updated", syncCompany);
    };
  }, []);

  useEffect(() => {
    if (collapsed) {
      setExpandedMenu(null);
      return;
    }
    const path = location.pathname;
    if (companyRoutes.includes(path)) setExpandedMenu("company");
    else if (employeeRoutes.includes(path)) setExpandedMenu("employees");
    else if (attendanceRoutes.includes(path)) setExpandedMenu("attendance");
    else if (holidayRoutes.includes(path)) setExpandedMenu("holiday");
    else if (leaveRoutes.includes(path)) setExpandedMenu("leave");
    else if (payrollRoutes.includes(path)) setExpandedMenu("payroll");
    else setExpandedMenu(null);
  }, [location.pathname, collapsed]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
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
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    localStorage.removeItem("_grecaptcha");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const menuClass = ({ isActive }) => {
    const showActive = isActive && expandedMenu === null;
    return `flex items-center ${
      collapsed ? "w-10 h-10 justify-center p-0" : "justify-between gap-3 px-3 py-3"
    } rounded-xl transition-all duration-300 group ${
      showActive
        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
        : "text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white"
    }`;
  };

  const getParentClass = (isActive) => {
    return `flex items-center ${
      collapsed ? "w-10 h-10 justify-center p-0" : "w-full justify-between gap-3 px-3 py-3"
    } rounded-xl transition-all duration-300 group cursor-pointer ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
        : "text-slate-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white"
    }`;
  };

  const subMenuLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    }`;

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
        {/* Dashboard */}
        <NavLink to="/dashboard" className={menuClass}>
          <div className="flex items-center gap-3 min-w-0">
            <LayoutDashboard size={18} />
            {!collapsed && <span className="truncate">Dashboard</span>}
          </div>
        </NavLink>

        {/* Company */}
        <div>
          <button
            onClick={() => {
              if (!collapsed) {
                setExpandedMenu(prev => prev === "company" ? null : "company");
              }
              navigate("/company");
            }}
            className={getParentClass(isCompanyActive)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Building2 size={18} />
              {!collapsed && <span className="truncate">Company</span>}
            </div>

            {!collapsed && (
              <span className="text-slate-400 group-hover:text-white transition duration-150">
                {expandedMenu === "company" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>

          {expandedMenu === "company" && !collapsed && (
            <div className="ml-10 mt-1 flex flex-col gap-1 text-sm">
              <NavLink to="/branch" className={subMenuLinkClass}>Branch</NavLink>
              <NavLink to="/role" className={subMenuLinkClass}>Role</NavLink>
              <NavLink to="/designation" className={subMenuLinkClass}>Designation</NavLink>
              <NavLink to="/department" className={subMenuLinkClass}>Department</NavLink>
            </div>
          )}
        </div>

        {/* Employees */}
        <div>
          <button
            onClick={() => {
              if (!collapsed) {
                setExpandedMenu(prev => prev === "employees" ? null : "employees");
              }
              navigate("/employees");
            }}
            className={getParentClass(isEmployeesActive)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Users size={18} />
              {!collapsed && <span className="truncate">Employees</span>}
            </div>

            {!collapsed && (
              <span className="text-slate-400 group-hover:text-white transition duration-150">
                {expandedMenu === "employees" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>

          {expandedMenu === "employees" && !collapsed && (
            <div className="ml-10 mt-1 flex flex-col gap-1 text-sm">
              <NavLink to="/offer-letters" className={subMenuLinkClass}>Offer Letter</NavLink>
              <NavLink to="/experience-letters" className={subMenuLinkClass}>Experience Letter</NavLink>
              <NavLink to="/relieving-letters" className={subMenuLinkClass}>Relieving Letter</NavLink>
              <NavLink to="/warning-letters" className={subMenuLinkClass}>Warning Letter</NavLink>
              <NavLink to="/termination-letters" className={subMenuLinkClass}>Termination Letter</NavLink>
            </div>
          )}
        </div>

        {/* Attendance */}
        <div>
          <button
            onClick={() => {
              if (!collapsed) {
                setExpandedMenu(prev => prev === "attendance" ? null : "attendance");
              }
              navigate("/attendance");
            }}
            className={getParentClass(isAttendanceActive)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Clock size={18} />
              {!collapsed && <span className="truncate">Attendance</span>}
            </div>

            {!collapsed && (
              <span className="text-slate-400 group-hover:text-white transition duration-150">
                {expandedMenu === "attendance" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>

          {expandedMenu === "attendance" && !collapsed && (
            <div className="ml-10 mt-1 flex flex-col gap-1 text-sm">
              <NavLink to="/daily-tracking" className={subMenuLinkClass}>Daily Tracking</NavLink>
              <NavLink to="/shift" className={subMenuLinkClass}>Shifts</NavLink>
            </div>
          )}
        </div>

        {/* Holiday */}
        <div>
          <button
            onClick={() => {
              if (!collapsed) {
                setExpandedMenu(prev => prev === "holiday" ? null : "holiday");
              }
              navigate("/holiday");
            }}
            className={getParentClass(isHolidayActive)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Calendar size={18} />
              {!collapsed && <span className="truncate">Holiday</span>}
            </div>

            {!collapsed && (
              <span className="text-slate-400 group-hover:text-white transition duration-150">
                {expandedMenu === "holiday" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>

          {expandedMenu === "holiday" && !collapsed && (
            <div className="ml-10 mt-1 flex flex-col gap-1 text-sm">
              <NavLink to="/holiday/calendar" className={subMenuLinkClass}>Holiday Calendar</NavLink>
            </div>
          )}
        </div>

        {/* Leave */}
        <div>
          <button
            onClick={() => {
              if (!collapsed) {
                setExpandedMenu(prev => prev === "leave" ? null : "leave");
              }
              navigate("/leave-dashboard");
            }}
            className={getParentClass(isLeaveActive)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <CalendarDays size={18} />
              {!collapsed && <span className="truncate">Leave</span>}
            </div>

            {!collapsed && (
              <span className="text-slate-400 group-hover:text-white transition duration-150">
                {expandedMenu === "leave" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>

          {expandedMenu === "leave" && !collapsed && (
            <div className="ml-10 mt-1 flex flex-col gap-1 text-sm">
              <NavLink to="/leave-requests" className={subMenuLinkClass}>Leave Requests</NavLink>
              <NavLink to="/leave-types" className={subMenuLinkClass}>Leave Types</NavLink>
            </div>
          )}
        </div>

        {/* Payroll */}
        <div>
          <button
            onClick={() => {
              if (!collapsed) {
                setExpandedMenu(prev => prev === "payroll" ? null : "payroll");
              }
              navigate("/payroll");
            }}
            className={getParentClass(isPayrollActive)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <CreditCard size={18} />
              {!collapsed && <span className="truncate">Payroll</span>}
            </div>

            {!collapsed && (
              <span className="text-slate-400 group-hover:text-white transition duration-150">
                {expandedMenu === "payroll" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>

          {expandedMenu === "payroll" && !collapsed && (
            <div className="ml-10 mt-1 flex flex-col gap-1 text-sm">
              <NavLink to="/payroll/salary-details" className={subMenuLinkClass}>Salary Details</NavLink>
              <NavLink to="/payroll/payslip" className={subMenuLinkClass}>Payslips</NavLink>
            </div>
          )}
        </div>



        <NavLink to="/reports" className={menuClass}>
          <div className="flex items-center gap-3 min-w-0">
            <BarChart3 size={18} />
            {!collapsed && <span className="truncate">Reports</span>}
          </div>
          {!collapsed && <ChevronRight size={14} className="text-slate-400 group-hover:text-white transition duration-150" />}
        </NavLink>
      </div>

      <div className="mt-auto border-t border-white/10">
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
