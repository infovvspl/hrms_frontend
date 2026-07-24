import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Users, TrendingUp, Clock, Shield } from "lucide-react";
import heroImg from "../assets/img.png";

const stats = [
  { icon: Users, value: "50K+", label: "Employees Managed" },
  { icon: TrendingUp, value: "98%", label: "Client Retention" },
  { icon: Clock, value: "10x", label: "Faster Payroll" },
  { icon: Shield, value: "99.9%", label: "Uptime Guarantee" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-0">

      {/* Subtle top gradient band */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white pointer-events-none" />

      {/* Decorative circles */}
      <div className="absolute top-10 right-[-80px] w-[480px] h-[480px] rounded-full border border-blue-100/70 pointer-events-none" />
      <div className="absolute top-32 right-[-20px] w-[320px] h-[320px] rounded-full border border-indigo-100/50 pointer-events-none" />
      <div className="absolute -bottom-20 left-[-60px] w-[360px] h-[360px] rounded-full border border-slate-100 pointer-events-none" />

      {/* Dot grid top-right */}
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-96px)]">

          {/* ── LEFT ── */}
          <div className="py-16 lg:py-0">

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.07] tracking-tight"
            >
              Manage Your{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-blue-600">Workforce</span>
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 260 8"
                  fill="none"
                >
                  <path
                    d="M2 6 Q65 1 130 5 Q195 9 258 4"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              {" "}with Precision
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-7 text-lg text-slate-500 leading-relaxed max-w-lg"
            >
              One unified platform for employee management, payroll automation,
              attendance, recruitment, and performance — built for modern teams.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4 items-center"
            >
              <Link to="/demo-form">
                <button className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:scale-[1.02] transition-all duration-300">
                  Get Free Demo
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/pricing">
                <button className="group flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all duration-300">
                  <Play size={13} className="fill-slate-500 group-hover:fill-blue-500 transition-colors" />
                  Watch Demo
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 pt-8 border-t border-slate-100"
            >
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="text-2xl font-black text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT — Dashboard image ── */}
          <motion.div
            initial={{ opacity: 0, x: 48, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.15 }}
            className="relative hidden lg:flex justify-center items-end"
          >
            {/* Shadow base */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-16 bg-blue-100 blur-[40px] rounded-full" />

            {/* Browser chrome card */}
            <div className="relative bg-white rounded-t-[28px] border border-slate-200/80 shadow-[0_32px_80px_rgba(59,130,246,0.12),0_8px_32px_rgba(0,0,0,0.08)] w-full max-w-[640px] overflow-hidden">
              {/* Browser top bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 h-5 mx-3 rounded-md bg-white border border-slate-200 flex items-center px-3">
                  <span className="text-[10px] text-slate-400">app.zenovahr.com/dashboard</span>
                </div>
              </div>
              <img src={heroImg} alt="HRMS Dashboard" className="w-full object-cover" />
            </div>

            {/* Floating badge 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 -left-8 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Cost Reduction</p>
                <p className="text-[11px] text-slate-400">30% savings on HR ops</p>
              </div>
            </motion.div>

            {/* Floating badge 2 */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute top-32 -right-6 bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2"
            >
              <span className="text-base">⚡</span>
              <div>
                <p className="text-xs font-bold">Real-time Payroll</p>
                <p className="text-[11px] text-blue-200">Auto-processed every month</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}