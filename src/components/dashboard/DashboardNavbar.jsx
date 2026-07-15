import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Settings, Bell, ChevronDown, User, Calendar, LogOut, X, Clock, Layout, MapPin, Megaphone, Check } from "lucide-react";
import axios from "axios";
import { getEmployeeAvatarSrc } from "../../utils/companyLogo";
export default function DashboardNavbar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({});
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [greeting, setGreeting] = useState("Hello");

  // Search and Notifications States
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Incoming Notification Toast State
  const [toast, setToast] = useState(null);

  // Notifications State (with dynamic categories and read statuses)
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Casual Leave request approved by Rahim Uddin.", time: "10 min ago", unread: true, category: "leave" },
    { id: 2, text: "June 2026 payslip has been successfully generated.", time: "2 hours ago", unread: true, category: "payroll" },
    { id: 3, text: "Geofence match: Punched in Bangalore Tech Park HQ.", time: "4 hours ago", unread: false, category: "punch" },
    { id: 4, text: "HR: Code of conduct training must be completed today.", time: "1 day ago", unread: true, category: "action" },
    { id: 5, text: "System maintenance scheduled for Sunday 2:00 AM.", time: "2 days ago", unread: false, category: "system" }
  ]);

  // Notifications Filter Category State
  const [activeFilter, setActiveFilter] = useState("all");

  // Search Modules Configuration
  const modules = [
    { name: "Dashboard", desc: "View employee stats and charts", path: "/employee/dashboard", icon: "Layout" },
    { name: "My Profile", desc: "View personal profile details", path: "/employee/profile", icon: "User" },
    { name: "Leave Management", desc: "Apply and track leaves", path: "/employee/leave", icon: "Calendar" },
    { name: "Attendance Tracker", desc: "Log attendance and history", path: "/employee/attendance", icon: "Clock" },
    { name: "Holiday Calendar", desc: "View scheduled holidays", path: "/holiday/calendar", icon: "Calendar" }
  ];

  const filteredModules = searchQuery.trim() 
    ? modules.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    const loadEmployee = () => {
      try {
        const storedEmployee = JSON.parse(localStorage.getItem("employee") || "{}") || {};
        setEmployee(storedEmployee);
      } catch (error) {
        console.error("Error reading employee from localStorage:", error);
      }
    };

    loadEmployee();
    
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    window.addEventListener("employee-avatar-updated", loadEmployee);
    return () => window.removeEventListener("employee-avatar-updated", loadEmployee);
  }, []);

  // Trigger a premium incoming toast notification 5 seconds after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setToast({
        id: 99,
        text: "Incoming Notice: Company-wide Townhall meeting scheduled.",
        time: "Just now",
        category: "system"
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowProfileDropdown(false);
      setShowSearchDropdown(false);
      setShowNotificationsDropdown(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const employeeName = employee?.first_name
    ? `${employee.first_name} ${employee.last_name || ""}`.trim()
    : "Employee";
  const employeeRole = employee?.role_name || "Employee";

  // Dynamic titles based on pathname
  let title = "Dashboard";
  let subtitle = `${greeting}, ${employeeName} 👋`;

  if (location.pathname.includes("/profile")) {
    title = "My Profile";
    subtitle = "View and manage your personal details";
  } else if (location.pathname.includes("/leave")) {
    title = "Leave Management";
    subtitle = "Apply for leaves and track your requests";
  } else if (location.pathname.includes("/attendance")) {
    title = "Attendance Tracker";
    subtitle = "Log your attendance and view shift history";
  }

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

  // Get Custom color styling, borders, and icons for each notification category
  const getCategoryStyles = (category) => {
    switch (category) {
      case "leave":
        return {
          icon: <Calendar size={13} />,
          iconBg: "bg-emerald-50 text-emerald-650 border border-emerald-100",
          border: "border-l-4 border-l-emerald-500",
          bg: "bg-emerald-50/10 hover:bg-emerald-50/20"
        };
      case "payroll":
        return {
          icon: <Clock size={13} />,
          iconBg: "bg-amber-55 text-amber-600 border border-amber-100",
          border: "border-l-4 border-l-amber-500",
          bg: "bg-amber-50/10 hover:bg-amber-50/20"
        };
      case "punch":
        return {
          icon: <MapPin size={13} />,
          iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-100",
          border: "border-l-4 border-l-cyan-500",
          bg: "bg-cyan-50/10 hover:bg-cyan-50/20"
        };
      case "action":
        return {
          icon: <Layout size={13} />,
          iconBg: "bg-rose-50 text-rose-650 border border-rose-100",
          border: "border-l-4 border-l-rose-500",
          bg: "bg-rose-50/10 hover:bg-rose-50/20"
        };
      case "system":
        return {
          icon: <Megaphone size={13} />,
          iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
          border: "border-l-4 border-l-purple-500",
          bg: "bg-purple-50/10 hover:bg-purple-50/20"
        };
      default:
        return {
          icon: <Bell size={13} />,
          iconBg: "bg-slate-50 text-slate-600 border border-slate-100",
          border: "border-l-4 border-l-slate-400",
          bg: "bg-slate-50/10 hover:bg-slate-50/20"
        };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return n.unread;
    return n.category === activeFilter;
  });

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/90 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-all duration-300">
      {/* Left side: Title & Greeting */}
      <div className="flex items-center gap-4">
        <div className="space-y-0.5">
          <h1 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-slate-400 text-[11px] font-bold tracking-wide uppercase">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Search, Settings, Notification, Profile */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative min-w-[200px] md:min-w-[280px] hidden sm:block group" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search modules, logs..."
            className="w-full text-xs font-semibold text-slate-600 bg-slate-50/70 border border-slate-200/60 rounded-xl pl-4 pr-10 py-2.5 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300 shadow-inner"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-650 transition-colors duration-300" size={14} />

          {/* Search Suggestions Dropdown */}
          {showSearchDropdown && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn max-h-[300px] overflow-y-auto">
              <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                Search Results ({filteredModules.length})
              </div>
              {filteredModules.length > 0 ? (
                filteredModules.map((m, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchDropdown(false);
                      navigate(m.path);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      {m.icon === "Layout" && <Layout size={14} />}
                      {m.icon === "User" && <User size={14} />}
                      {m.icon === "Calendar" && <Calendar size={14} />}
                      {m.icon === "Clock" && <Clock size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">{m.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{m.desc}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs text-slate-400 font-semibold">
                  No matching modules found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings Icon */}
        <button className="p-2.5 text-slate-400 hover:text-indigo-655 hover:bg-slate-50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative">
          <Settings size={16} />
        </button>

        {/* Notification Icon */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setShowNotificationsDropdown(!showNotificationsDropdown);
              setShowProfileDropdown(false);
              setShowSearchDropdown(false);
            }}
            className={`relative p-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${showNotificationsDropdown ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"}`}
          >
            <Bell size={16} />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-indigo-600 text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse">
                {notifications.filter(n => n.unread).length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Tray */}
          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100/90 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn overflow-hidden">
              {/* Tray Header */}
              <div className="px-4 py-2 border-b border-slate-55 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800">Notifications</span>
                {notifications.filter(n => n.unread).length > 0 && (
                  <button
                    onClick={() => {
                      setNotifications(notifications.map(n => ({ ...n, unread: false })));
                    }}
                    className="text-[10px] text-indigo-600 hover:text-indigo-855 font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Tray Filters */}
              <div className="px-4 py-2 border-b border-slate-50 flex gap-1.5 overflow-x-auto scrollbar-none scroll-smooth">
                {[
                  { id: "all", label: "All", color: "bg-slate-100 text-slate-700 border border-slate-200" },
                  { id: "unread", label: "Inbox", color: "bg-indigo-50 text-indigo-650 border border-indigo-100" },
                  { id: "leave", label: "Leave", color: "bg-emerald-50 text-emerald-650 border border-emerald-100" },
                  { id: "payroll", label: "Payroll", color: "bg-amber-50 text-amber-600 border border-amber-100" },
                  { id: "punch", label: "Punch", color: "bg-cyan-50 text-cyan-600 border border-cyan-100" }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setActiveFilter(pill.id)}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-black transition cursor-pointer select-none whitespace-nowrap ${
                      activeFilter === pill.id 
                        ? pill.color + " ring-1 ring-indigo-500/20" 
                        : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-100"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Tray List */}
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50 scrollbar-thin">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => {
                    const style = getCategoryStyles(n.category);
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item));
                        }}
                        className={`p-3 text-xs text-left cursor-pointer transition-all flex items-start gap-3 ${style.border} ${style.bg} ${n.unread ? "bg-slate-50/50" : ""}`}
                      >
                        {/* Custom Category Icon Circle */}
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
                          {style.icon}
                        </div>

                        {/* Text and Time */}
                        <div className="flex-1 space-y-0.5 min-w-0">
                          <p className={`text-[11px] text-slate-700 leading-normal ${n.unread ? "text-slate-900 font-extrabold" : "font-semibold"}`}>
                            {n.text}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            {n.time}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifications(notifications.filter(item => item.id !== n.id));
                          }}
                          className="text-slate-350 hover:text-rose-500 font-black p-0.5 transition shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400 font-semibold flex flex-col items-center justify-center gap-2">
                    <Bell size={24} className="text-slate-350" />
                    <span>No notifications found in this list</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-[1px] bg-slate-200/80" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotificationsDropdown(false);
              setShowSearchDropdown(false);
            }}
            className="flex items-center gap-2.5 hover:bg-slate-50/80 px-2 py-1.5 rounded-xl transition-all duration-300 cursor-pointer text-left focus:outline-none"
          >
            {/* Initial Circle or Avatar with Online Indicator */}
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-505 to-cyan-505 bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0 border border-white/20 overflow-hidden">
                {employee?.image ? (
                  <img src={getEmployeeAvatarSrc(employee.image)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  employee?.first_name ? `${employee.first_name[0]}${employee.last_name ? employee.last_name[0] : ""}`.toUpperCase() : "EE"
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
            </div>
            
            <div className="hidden md:block min-w-0">
              <p className="text-xs font-black text-slate-800 leading-tight">
                {employeeName}
              </p>
              <p className="text-[10px] text-indigo-505 font-bold uppercase tracking-wider mt-0.5">
                {employeeRole}
              </p>
            </div>

            <ChevronDown size={14} className={`text-slate-400 hidden md:block transition-transform duration-300 ${showProfileDropdown ? "rotate-180 text-indigo-650" : ""}`} />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2.5 w-52 bg-white border border-slate-100/90 rounded-2xl shadow-xl py-1.5 z-50 animate-fadeIn animate-duration-150" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{employeeName}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{employee?.work_email || employee?.email || "No Email"}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  window.location.href = "/employee/profile";
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors duration-150 flex items-center gap-2"
              >
                <User size={13} className="text-slate-400" />
                <span>My Profile</span>
              </button>

              <div className="border-t border-slate-100 my-1.5" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-colors duration-150 flex items-center gap-2"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Toast Alert Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] max-w-sm w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.15)] border-2 border-indigo-500/20 p-4 flex gap-3.5 animate-slideIn">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0 border border-indigo-100">
            <Bell size={18} className="animate-bounce text-indigo-600" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-black text-slate-800 leading-tight">Incoming Notification</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-normal">{toast.text}</p>
          </div>
          <button 
            onClick={() => {
              // Add to list and close toast
              setNotifications(prev => [
                { id: Date.now(), text: toast.text, time: "Just now", unread: true, category: "system" },
                ...prev
              ]);
              setToast(null);
            }} 
            className="text-slate-400 hover:text-indigo-650 shrink-0 self-start p-0.5 transition cursor-pointer"
          >
            <Check size={14} className="text-emerald-500 hover:text-emerald-700" />
          </button>
        </div>
      )}

      {/* Custom Styles for slide-in Toast & Scrollbar tricks */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </header>
  );
}
