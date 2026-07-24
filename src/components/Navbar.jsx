import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "./Logo";

const FEATURES_MENU = [
  ["Employee Management", "/employee-management"],
  ["Attendance Management", "/attendance-management"],
  ["Leave Management", "/leave-management"],
  ["Payroll Management", "/payroll-management"],
  ["Recruitment Management", "/recruitment-management"],
  ["Performance Management", "/performance-management"],
  ["Asset Management", "/asset-management"],
];

const COMPANY_MENU = [
  ["About Us", "/about"],
  ["Contact Us", "/contact"],
];

const NAV_LINKS = [
  ["Solutions", "/solutions"],
  ["Pricing", "/pricing"],
  ["Partners", "/partners"],
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const linkClass = "relative group text-slate-600 hover:text-blue-600 transition-colors text-[13.5px] font-semibold";
  const underline = "absolute left-0 -bottom-0.5 h-[2px] w-0 bg-blue-500 group-hover:w-full transition-all duration-300 rounded-full";

  return (
    <nav className="fixed top-0 left-0 w-full z-[9999] bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-16">

        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <div className="scale-[1.8] origin-left">
            <Logo />
          </div>
        </Link>

        {/* NAV — Desktop */}
        <ul className="hidden lg:flex items-center gap-8">
          <Link to="/" className={linkClass}>
            Home
            <span className={underline} />
          </Link>

          {/* Features dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-1 cursor-pointer text-slate-600 hover:text-blue-600 transition-colors text-[13.5px] font-semibold">
              Features
              <ChevronDown size={13} className="group-hover:rotate-180 transition-transform duration-200 mt-0.5" />
            </div>
            <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top scale-95 group-hover:scale-100">
              {FEATURES_MENU.map(([name, path], i) => (
                <Link
                  key={i}
                  to={path}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-sm font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 group-hover:bg-blue-400" />
                  {name}
                </Link>
              ))}
            </div>
          </div>

          {NAV_LINKS.map(([name, path]) => (
            <Link key={name} to={path} className={linkClass}>
              {name}
              <span className={underline} />
            </Link>
          ))}

          {/* Company dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-1 cursor-pointer text-slate-600 hover:text-blue-600 transition-colors text-[13.5px] font-semibold">
              Company
              <ChevronDown size={13} className="group-hover:rotate-180 transition-transform duration-200 mt-0.5" />
            </div>
            <div className="absolute top-full left-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top scale-95 group-hover:scale-100">
              {COMPANY_MENU.map(([name, path], i) => (
                <Link
                  key={i}
                  to={path}
                  className="block px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-sm font-medium"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </ul>

        {/* RIGHT BUTTONS */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login">
            <button className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 transition-all duration-200">
              Sign In
            </button>
          </Link>
          <Link to="/demo-form">
            <button className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 hover:shadow-blue-200 hover:scale-[1.02] transition-all duration-200">
              Free Demo
            </button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-5 flex flex-col gap-1">
          {[["Home", "/"], ["Solutions", "/solutions"], ["Pricing", "/pricing"], ["About", "/about"], ["Contact", "/contact"]].map(([name, path]) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-2 text-slate-700 font-semibold text-sm hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
            >
              {name}
            </Link>
          ))}
          <div className="border-t border-slate-100 mt-3 pt-4 flex flex-col gap-3">
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition">
                Sign In
              </button>
            </Link>
            <Link to="/demo-form" onClick={() => setMobileOpen(false)}>
              <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-100">
                Free Demo
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
