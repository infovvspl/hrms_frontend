import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import logo from "../assets/logo.png";

export default function ForgotPassword() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#f4f7fb] px-4 relative overflow-hidden">

      {/* CARD */}
      <div className="w-full max-w-md bg-white border border-gray-300 shadow-xl p-8">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">

          <img
            src={logo}
            alt="Zenova HR"
            className="w-40 object-contain mb-2"
          />

          <h2 className="text-3xl font-bold text-[#111827]">
            Forgot Password
          </h2>

          <p className="text-gray-500 text-sm text-center mt-1">
            Enter your email to reset password
          </p>

        </div>

        {/* EMAIL */}
        <div className="relative mb-5">

          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

        {/* BUTTON */}
        <button className="w-full bg-[#2390ea] hover:bg-[#0d7de0] text-white py-3 text-sm font-semibold transition-all duration-300 hover:shadow-xl">
          Send Reset Link
        </button>

        {/* BACK */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 text-sm text-blue-600 mt-5 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

      </div>
    </div>
  );
}