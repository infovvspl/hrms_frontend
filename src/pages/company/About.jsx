import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Eye, Zap, ArrowRight, Heart, Users, Globe } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function About() {
  const values = [
    { 
      icon: Target, 
      title: "Our Mission", 
      desc: "To drastically simplify workforce management by equipping HR teams with beautiful, automated, and intelligent software tools." 
    },
    { 
      icon: Eye, 
      title: "Our Vision", 
      desc: "To create frictionless workplaces globally, where administrative HR operations are entirely seamless and data-driven." 
    },
    { 
      icon: Heart, 
      title: "People First", 
      desc: "We build software for humans. Every feature we design is centered around improving the employee and employer experience." 
    },
  ];

  const stats = [
    { value: "2019", label: "Founded" },
    { value: "50K+", label: "Active Users" },
    { value: "99%", label: "Retention Rate" },
    { value: "24/7", label: "Expert Support" }
  ];

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Subtle top gradient band (Matched to Homepage) */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white pointer-events-none" />
        
        {/* Decorative circles (Matched to Homepage) */}
        <div className="absolute top-10 right-[-80px] w-[480px] h-[480px] rounded-full border border-blue-100/70 pointer-events-none" />
        <div className="absolute top-32 right-[-20px] w-[320px] h-[320px] rounded-full border border-indigo-100/50 pointer-events-none" />
        <div className="absolute -bottom-20 left-[-60px] w-[360px] h-[360px] rounded-full border border-slate-100 pointer-events-none" />
        
        {/* Dot grid (Matched to Homepage) */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 min-h-[calc(100vh-250px)]">
            
            {/* Left side text */}
            <div className="lg:w-1/2 z-10 py-10 lg:py-0">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Our Story
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 leading-[1.07] tracking-tight mb-6"
              >
                Simplifying HR for the modern workplace.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-slate-500 leading-relaxed max-w-lg mb-10"
              >
                Zenova HR was born out of frustration with legacy HR systems. We set out to build a platform that doesn't just digitize paperwork, but actually accelerates business growth through intelligent automation.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 items-center"
              >
                <Link to="/contact">
                  <button className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:scale-[1.02] transition-all duration-300">
                    Get in Touch
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <a href="#values">
                  <button className="group flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all duration-300">
                    Read Our Values
                  </button>
                </a>
              </motion.div>
            </div>

            {/* Right side Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.15 }}
              className="lg:w-1/2 w-full relative hidden md:block"
            >
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-16 bg-blue-200 blur-[50px] rounded-full opacity-60" />
              <div className="relative grid grid-cols-2 gap-4">
                <img 
                  src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Our Team" 
                  className="w-full h-[280px] object-cover rounded-[2rem] rounded-br-lg shadow-lg border border-slate-200/80 mt-12"
                />
                <img 
                  src="https://images.pexels.com/photos/1181605/pexels-photo-1181605.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Meeting" 
                  className="w-full h-[280px] object-cover rounded-[2rem] rounded-bl-lg shadow-lg border border-slate-200/80"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-12 border-t border-slate-100 bg-white">
         <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
               {stats.map((s, i) => (
                  <motion.div key={i} {...fadeUp(i * 0.1)}>
                     <div className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{s.value}</div>
                     <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{s.label}</div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ── VALUES / MISSION ── */}
      <section id="values" className="py-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold tracking-wide mb-5 shadow-sm">
              Our Principles
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-5">Built on strong values.</h2>
            <p className="text-lg text-slate-500 leading-relaxed">We combine world-class engineering, deep HR expertise, and an unwavering commitment to our users.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((feature, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={26} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA BANNER (Matched to Homepage) ── */}
      <section className="py-20 px-6 bg-white">
        <motion.div
          {...fadeUp()}
          className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-10 py-16 text-center shadow-2xl shadow-blue-200/60"
        >
          {/* Decorative circles */}
          <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/8 pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full bg-white/6 pointer-events-none" />

          {/* Dot grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest mb-6">
              Join Our Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Ready to transform your workplace?
            </h2>
            <p className="text-white/75 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of modern teams who trust Zenova to manage their operations efficiently and securely.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/demo-form">
                <button className="px-8 py-4 rounded-xl bg-white text-blue-700 font-black text-sm hover:scale-[1.03] transition-all shadow-xl hover:shadow-2xl">
                  Get Started Now →
                </button>
              </Link>
              <Link to="/pricing">
                <button className="px-8 py-4 rounded-xl border border-white/25 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all backdrop-blur">
                  View Pricing Plans
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
