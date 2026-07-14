import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import logo from "../assets/logo.png";

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (!otpSent) return;

    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer, otpSent]);

  // SEND OTP
  const handleSendOtp = async () => {
    try {
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        return alert("Please fill all fields");
      }

      if (formData.password !== formData.confirmPassword) {
        return alert("Passwords do not match");
      }

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/send-otp",
        {
          company_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }
      );

      alert(res.data.message);
      setOtpSent(true);

      setOtpSent(true);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    try {
      if (!otp) {
        return alert("Please enter OTP");
      }

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          email: formData.email,
          otp,
        }
      );

      alert(res.data.message);

      setVerified(true);
      alert("Account Created Successfully");

      // ❌ removed auto navigation
      // navigate("/login");

    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  // const handleResendOtp = async () => {
  //   await handleSendOtp();

  //   setTimer(60);
  //   setCanResend(false);
  // };

  // const handleResendOtp = async () => {
  //   try {
  //     setLoading(true);

  //     await axios.post("http://localhost:5000/api/auth/resendOtp", {
  //       email,
  //     });

  //     setTimer(60);
  //     setCanResend(false);
  //     setOtp(""); // Clear old OTP
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleResendOtp = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/resendOtp",
        { email: formData.email }
      );

      console.log(res.data);

      setTimer(60);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-11 bg-[#f8fbff] border border-blue-100 pl-11 pr-4 text-sm outline-none " +
    "transition-all duration-200 ease-in-out " +
    "hover:border-blue-300 hover:bg-white hover:shadow-sm " +
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white";

  return (
    <div className="min-h-screen bg-[#f3f7ff] relative overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-150px] left-[-120px] w-[420px] h-[420px] bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-180px] right-[-120px] w-[420px] h-[420px] bg-indigo-400/20 rounded-full blur-3xl"></div>

        <div className="absolute inset-0 opacity-[0.04]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#2563eb_1px,transparent_1px),linear-gradient(to_bottom,#2563eb_1px,transparent_1px)] bg-[size:70px_70px]" />
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-white/70 backdrop-blur-xl border-b border-blue-100 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

          {/* ✅ CLICKABLE LOGO */}
          <img
            src={logo}
            alt="Zenova HR"
            onClick={() => navigate("/")}
            className="h-28 object-contain cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(37,99,235,0.35)]"
          />

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-black">Have a Zenova HR account?</span>
            <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              SIGN IN
            </a>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="min-h-screen flex items-center justify-center px-4 py-24 relative z-10">

        <div className="w-full max-w-5xl min-h-[760px] grid lg:grid-cols-[1fr_430px] overflow-hidden border border-white/60 shadow-[0_25px_80px_rgba(37,99,235,0.12)] bg-white/60 backdrop-blur-2xl">

          {/* LEFT SIDE */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#4f46e5] p-12 text-white overflow-hidden">

            <div className="absolute inset-0 opacity-[0.08]">
              <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative z-10 flex flex-col justify-center h-full">

              <div className="inline-flex w-fit items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 text-xs tracking-[3px] uppercase">
                <Sparkles size={14} />
                Zenova HR
              </div>

              <h1 className="mt-8 text-5xl font-black leading-tight">
                Modern HR<br />Management<br />Platform
              </h1>

              <p className="mt-6 text-blue-100 leading-8 max-w-md">
                Manage employees, attendance, payroll and recruitment.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white/80 backdrop-blur-2xl px-8 py-7 flex flex-col justify-center">

            <div className="flex justify-center">
              <img src={logo} alt="Zenova HR" className="h-36" />
            </div>

            <div className="text-center mt-1">
              <h2 className="text-3xl font-black">Create Account</h2>
              <p className="mt-2 text-sm text-gray-500">
                Start managing your HR operations
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="mt-7 space-y-4">

              {/* NAME */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Company Name" className={inputClass} />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                <input name="email" value={formData.email} onChange={handleChange} placeholder="Company Email" className={inputClass} />
              </div>

              {/* PHONE */}
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className={inputClass} />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Password"
                  className={inputClass}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className={inputClass}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* SEND OTP */}
              <button type="button" onClick={handleSendOtp} className="w-full h-11 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                {loading ? "Sending..." : otpSent ? "OTP Sent" : "Send Email OTP"}
              </button>

              {/* OTP */}
              {otpSent && (
                <div className="space-y-3">

                  {!canResend ? (
                    <>
                      <div className="relative">
                        <ShieldCheck
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                          size={16}
                        />
                        <input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter OTP"
                          className={inputClass}
                        />
                      </div>

                      <div className="text-center text-sm text-gray-600">
                        Resend OTP in <span className="font-semibold">{timer}s</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="w-full h-11 border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-red-500 mb-3">
                        OTP has expired.
                      </p>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="w-full h-11 border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}

                  {verified && (
                    <>
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle2 size={16} />
                        Email Verified Successfully
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="w-full h-11 bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}     