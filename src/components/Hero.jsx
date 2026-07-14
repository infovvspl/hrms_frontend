// Hero.jsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "../assets/img.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#03152f] via-[#0b2d63] to-[#1877f2] text-white flex items-center pt-32 pb-20">

      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop')",
        }}
      ></div>

      {/* GLOW EFFECTS */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-400/20 blur-[140px] rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/20 blur-[140px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >

          {/* TAG */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-cyan-200 text-sm font-medium mb-8">

            ✦ Smart HRMS Platform

          </div>

          {/* TITLE */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">

            Smart HR
            <br />

            <span className="bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">

              Management

            </span>

          </h1>

          {/* DESCRIPTION */}
          <p className="mt-8 text-lg text-blue-100 leading-relaxed max-w-xl">

            Manage employees, payroll, attendance,
            recruitment, leave, and performance
            with one powerful cloud-based HRMS platform.

          </p>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-wrap gap-5">

            <Link to="/demo-form">

              <button className="px-8 py-4 rounded-2xl bg-white text-blue-900 font-bold shadow-2xl hover:scale-105 transition duration-300">

                Get A Demo

              </button>

            </Link>

            <Link to="/pricing">

              <button className="px-8 py-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition duration-300">

                View Pricing

              </button>

            </Link>

          </div>

        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="relative flex justify-center items-center"
        >

          {/* OUTER GLOW */}
          <div className="absolute w-[90%] h-[90%] bg-cyan-400/20 blur-[100px] rounded-full"></div>

          {/* TRANSPARENT IMAGE CARD */}
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">

            {/* MAIN IMAGE */}
            <img
              src={heroImg}
              alt="HRMS"
              className="w-full max-w-[650px] object-contain rounded-[28px] relative z-10"
            />

          </div>

        </motion.div>

      </div>

    </section>
  );
}