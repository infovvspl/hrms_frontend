import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Settings, Users, Shield, Map, CreditCard, UserPlus, CheckCircle } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Solutions() {
  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Subtle top gradient band */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white pointer-events-none" />

        {/* Decorative circles */}
        <div className="absolute top-10 right-[-80px] w-[480px] h-[480px] rounded-full border border-blue-100/70 pointer-events-none" />
        <div className="absolute top-32 right-[-20px] w-[320px] h-[320px] rounded-full border border-indigo-100/40 pointer-events-none" />

        {/* Dot grid */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Tailored Solutions
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 leading-[1.07] tracking-tight mb-6"
          >
            Built for your exact needs.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Whether you are a hyper-growth startup, an established enterprise, or a fully remote team, Zenova provides the precise tools to streamline your workforce.
          </motion.p>
        </div>
      </section>

      {/* ── ALTERNATING BLOCKS ── */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-32 relative z-10">

          {/* Solution 1: Startups */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <motion.div {...fadeUp()} className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 mb-6">
                <Users size={24} className="text-blue-600" />
              </motion.div>
              <motion.h2 {...fadeUp(0.1)} className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">Startup Automation Suite</motion.h2>
              <motion.p {...fadeUp(0.2)} className="text-lg text-slate-500 leading-relaxed mb-8">
                Focus on building your product, not drowning in HR paperwork. Automate onboarding, basic payroll, and time-offs so your startup can scale faster with zero administrative overhead.
              </motion.p>
              <ul className="space-y-4 mb-8">
                {[
                  "Self-serve employee onboarding",
                  "Automated startup payroll (PF, TDS)",
                  "Digital document locker"
                ].map((text, i) => (
                  <motion.li key={i} {...fadeUp(0.3 + (i * 0.1))} className="flex items-center gap-3">
                    <CheckCircle className="text-blue-500 w-5 h-5 shrink-0" />
                    <span className="text-slate-700 font-medium">{text}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.div {...fadeUp(0.6)}>
                <Link to="/demo-form" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Explore Startup Solutions <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
            <motion.div {...fadeUp(0.4)} className="lg:w-1/2 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-200/50 blur-[60px] rounded-full pointer-events-none" />
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Startup Team"
                className="relative rounded-[2rem] shadow-2xl border border-slate-200/60 object-cover w-full h-auto"
              />
            </motion.div>
          </div>

          {/* Solution 2: Enterprises */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2">
              <motion.div {...fadeUp()} className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 mb-6">
                <Shield size={24} className="text-blue-600" />
              </motion.div>
              <motion.h2 {...fadeUp(0.1)} className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">Enterprise Workforce Suite</motion.h2>
              <motion.p {...fadeUp(0.2)} className="text-lg text-slate-500 leading-relaxed mb-8">
                Manage thousands of employees with confidence. Benefit from SOC2 compliance, advanced organizational charts, predictive analytics, and granular role-based access control.
              </motion.p>
              <ul className="space-y-4 mb-8">
                {[
                  "Complex multi-level approval workflows",
                  "Cross-departmental performance tracking",
                  "API integrations with ERPs (SAP, Oracle)"
                ].map((text, i) => (
                  <motion.li key={i} {...fadeUp(0.3 + (i * 0.1))} className="flex items-center gap-3">
                    <CheckCircle className="text-blue-500 w-5 h-5 shrink-0" />
                    <span className="text-slate-700 font-medium">{text}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.div {...fadeUp(0.6)}>
                <Link to="/demo-form" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Explore Enterprise Solutions <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
            <motion.div {...fadeUp(0.4)} className="lg:w-1/2 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-200/50 blur-[60px] rounded-full pointer-events-none" />
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Enterprise Dashboard"
                className="relative rounded-[2rem] shadow-2xl border border-slate-200/60 object-cover w-full h-auto"
              />
            </motion.div>
          </div>

          {/* Solution 3: Remote Teams */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <motion.div {...fadeUp()} className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 mb-6">
                <Map size={24} className="text-blue-600" />
              </motion.div>
              <motion.h2 {...fadeUp(0.1)} className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">Remote & Field Operations</motion.h2>
              <motion.p {...fadeUp(0.2)} className="text-lg text-slate-500 leading-relaxed mb-8">
                Perfect for distributed workforces and field sales teams. Track remote employees effortlessly using geo-fenced GPS mobile attendance, IP restrictions, and real-time activity logs.
              </motion.p>
              <ul className="space-y-4 mb-8">
                {[
                  "Mobile-first attendance with selfies",
                  "Real-time GPS tracking for field staff",
                  "Automated shift and roster management"
                ].map((text, i) => (
                  <motion.li key={i} {...fadeUp(0.3 + (i * 0.1))} className="flex items-center gap-3">
                    <CheckCircle className="text-blue-500 w-5 h-5 shrink-0" />
                    <span className="text-slate-700 font-medium">{text}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.div {...fadeUp(0.6)}>
                <Link to="/demo-form" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Explore Remote Solutions <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
            <motion.div {...fadeUp(0.4)} className="lg:w-1/2 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-200/50 blur-[60px] rounded-full pointer-events-none" />
              <img
                src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Remote Worker"
                className="relative rounded-[2rem] shadow-2xl border border-slate-200/60 object-cover w-full h-auto"
              />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative overflow-hidden bg-slate-50 py-24 border-t border-slate-100">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative z-10">
          <motion.h2 {...fadeUp()} className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Not sure which setup fits?
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="text-xl text-slate-500 mb-10">
            Talk to our product specialists to find the perfect configuration for your organization.
          </motion.p>
          <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-4 items-center justify-center">
            <Link to="/demo-form">
              <button className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:scale-[1.02] transition-all duration-300">
                Talk to Sales
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/pricing">
              <button className="group flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all duration-300">
                <Play size={13} className="fill-slate-500 group-hover:fill-blue-500 transition-colors" />
                View Pricing
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}