import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";

import hrmsImage from "../assets/hrms.png";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    const savedPassword = localStorage.getItem("remembered_password");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: String(position.coords.latitude),
            longitude: String(position.coords.longitude)
          });
        },
        (error) => {
          console.warn("Geolocation permission or error:", error.message);
        }
      );
    }
  }, []);

  // ================= AUTO REDIRECT IF ALREADY LOGGED IN =================
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const company = localStorage.getItem("company");

  //   if (token && company) {
  //     navigate("/dashboard", { replace: true });
  //   }
  // }, []);

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";

    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    else if (ua.includes("Trident") || ua.includes("MSIE")) browser = "Internet Explorer";
    else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "MacOS";
    else if (ua.includes("X11") || ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("like Mac OS")) os = "iOS";

    return { browser, os, device_info: ua };
  };

  // ================= LOGIN HANDLER =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaValue) {
      setError("Please verify Google reCAPTCHA");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/auth/login`,
        {
          email: email,
          password,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      );

      // ================= VALIDATE RESPONSE =================
      if (!response.data || !response.data.token) {
        setError("Invalid login response from server");
        return;
      }

      // ================= SAVE DATA =================
      const { token, role, company, employee } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "company");

      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
        localStorage.setItem("remembered_password", password);
      } else {
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_password");
      }

      if (role === "employee") {
        localStorage.setItem("employee", JSON.stringify(employee));
        localStorage.setItem("company_id", employee.company_id);
        localStorage.setItem("employee_id", employee.id);
      } else {
        localStorage.setItem("company", JSON.stringify(company));
        localStorage.setItem("company_id", company.id);
      }

      // ================= LOG HISTORY =================
      try {
        const { browser, os, device_info } = getDeviceInfo();
        const historyRes = await axios.post(`${import.meta.env.VITE_SERVER_ADDRESS}/api/login-history`, {
          user_id: role === "employee" ? employee.id : null,
          ipaddress: "Unknown",
          device_info,
          os,
          browser,
          longitude: coords.longitude,
          lattitude: coords.latitude,
          login_status: "success",
          session_id: token,
        });
        if (historyRes.data?.login_history?.id) {
          localStorage.setItem("login_session_id", historyRes.data.login_history.id);
        }
      } catch (histErr) {
        console.error("Failed to log history:", histErr);
      }

      if (role === "employee") {
        navigate("/employee/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Redirecting to Google...");
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center px-4 relative bg-[#f4f7fb]">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#dbeafe_1px,transparent_1px),linear-gradient(to_bottom,#dbeafe_1px,transparent_1px)] bg-[size:60px_60px] opacity-30"></div>
      </div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-5xl bg-white border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.12)] flex overflow-hidden rounded-2xl">
        {/* LEFT */}
        <div className="hidden lg:flex w-1/2 bg-[#f8fafc] border-r border-gray-200 flex-col items-center justify-center px-6 py-4">
          <div className="text-center mb-4">
            <h1 className="text-5xl font-extrabold text-[#0047a5]">HRMS</h1>
            <p className="text-[#556987] text-lg mt-1">
              Human Resource Management System
            </p>
          </div>

          <img
            src={hrmsImage}
            alt="HRMS"
            className="w-full max-w-sm object-contain hover:scale-105 transition duration-500"
          />
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm">
            {/* LOGO */}
            <div className="flex flex-col items-center mb-4">
              <img
                src={logo}
                alt="Zenova HR"
                className="w-44 object-contain mb-1"
              />
              <h2 className="text-4xl font-semibold text-[#111827] mb-1">
                Sign in
              </h2>
              <p className="text-gray-500 text-sm text-center">
                Welcome back! Please login to continue.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div className="relative mb-3">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 py-2.5 pl-10 text-sm rounded-md transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative mb-3">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 py-2.5 pl-10 pr-10 text-sm rounded-md transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* REMEMBER */}
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-blue-600 cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-blue-600 text-xs hover:text-blue-800 transition-colors duration-300"
              >
                Forgot Password?
              </Link>
            </div>

            {/* CAPTCHA */}
            <div className="mb-4 flex justify-center">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(value) => setCaptchaValue(value)}
              />
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              onClick={handleLogin}
              className="w-full bg-[#2390ea] text-white py-2.5 text-sm font-semibold rounded-md transition-all duration-300 hover:bg-[#1678d4] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* GOOGLE LOGIN */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full border border-gray-300 py-2.5 flex items-center justify-center gap-3 rounded-md mt-3 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
            >
              <span className="text-sm font-medium text-gray-700">
                Continue with Google
              </span>
            </button>

            {/* SIGNUP */}
            <p className="text-center text-sm text-gray-500 mt-3">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-700 font-semibold hover:text-blue-900 transition-colors duration-300"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
