// Navbar.jsx

import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-[9999] bg-white/80 backdrop-blur-md border-b border-gray-200/40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-2">
        {/* LOGO */}
        <div className="flex items-center">
          <div className="scale-[2.0] origin-left">
            <Logo />
          </div>
        </div>

        {/* NAV LINKS */}
        <ul className="hidden lg:flex items-center gap-7 text-[14px] font-semibold text-gray-800">
          <Link
            to="/"
            className="relative group hover:text-blue-600 transition"
          >
            Home
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </Link>

          {/* FEATURES */}
          <div className="relative group">
            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition">
              Features <ChevronDown size={14} />
            </div>

            <div className="absolute top-10 left-0 w-64 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              {[
                ["Employee Management", "/employee-management"],
                ["Attendance Management", "/attendance-management"],
                ["Leave Management", "/leave-management"],
                ["Payroll Management", "/payroll-management"],
                ["Recruitment Management", "/recruitment-management"],
                ["Performance Management", "/performance-management"],
                ["Asset Management", "/asset-management"],
              ].map(([name, path], i) => (
                <Link
                  key={i}
                  to={path}
                  className="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-sm"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/solutions"
            className="relative group hover:text-blue-600 transition"
          >
            Solutions
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            to="/pricing"
            className="relative group hover:text-blue-600 transition"
          >
            Pricing
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            to="/partners"
            className="relative group hover:text-blue-600 transition"
          >
            Partners
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
          </Link>

          {/* COMPANY */}
          <div className="relative group">
            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition">
              Company <ChevronDown size={14} />
            </div>

            <div className="absolute top-10 left-0 w-52 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              {[
                ["About Us", "/about"],
                ["Contact Us", "/contact"],
              ].map(([name, path], i) => (
                <Link
                  key={i}
                  to={path}
                  className="block px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-sm"
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
            <button
              className="px-4 py-1.5 rounded-xl text-sm font-semibold 
    border border-gray-300 
    bg-white/70 backdrop-blur-md
    text-gray-700 hover:border-blue-500 hover:text-blue-600 transition"
            >
              Sign In
            </button>
          </Link>
          <Link to="/demo-form">
            <button
              className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white 
            bg-gradient-to-r from-[#2563EB] to-[#38BDF8]
            hover:scale-105 shadow-lg hover:shadow-blue-300/40 transition"
            >
              Free Demo
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
