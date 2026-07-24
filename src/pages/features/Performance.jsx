import { motion } from "framer-motion";
import { Target, MessageSquare, TrendingUp, Award, ArrowRight, Play, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Performance() {
  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Subtle top gradient band */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white pointer-events-none" />
        
        {/* Decorative circles */}
        <div className="absolute top-10 right-[-80px] w-[480px] h-[480px] rounded-full border border-blue-100/70 pointer-events-none" />
        <div className="absolute top-32 right-[-20px] w-[320px] h-[320px] rounded-full border border-blue-100/40 pointer-events-none" />
        
        {/* Dot grid */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left side text */}
            <div className="lg:w-1/2 z-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Performance Management
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 leading-[1.07] tracking-tight mb-6"
              >
                Empower your team to excel.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-slate-500 leading-relaxed max-w-lg mb-10"
              >
                Move beyond annual reviews. Set clear goals, conduct 360-degree feedback, and drive continuous growth with an intelligent performance tracking system.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 items-center"
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
                    View Pricing
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right side Image */}
            <motion.div
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.15 }}
              className="lg:w-1/2 w-full relative"
            >
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-16 bg-blue-200 blur-[50px] rounded-full opacity-60" />
              <div className="relative rounded-2xl shadow-[0_32px_80px_rgba(168,85,247,0.12),0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200/80 bg-white">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                   <span className="w-3 h-3 rounded-full bg-red-400" />
                   <span className="w-3 h-3 rounded-full bg-yellow-400" />
                   <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80" 
                  alt="Performance Dashboard" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CORE FEATURES GRID ── */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-5">Tools for continuous improvement</h2>
            <p className="text-lg text-slate-500 leading-relaxed">Align your team's objectives with company goals and provide the feedback they need to succeed.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
            {[
              { icon: Target, title: "OKRs & Goal Tracking", desc: "Set clear objectives and key results (OKRs) that cascade from the company level down to individuals." },
              { icon: MessageSquare, title: "360° Feedback", desc: "Collect comprehensive feedback from peers, managers, and direct reports for unbiased reviews." },
              { icon: TrendingUp, title: "Continuous Reviews", desc: "Shift from annual reviews to continuous check-ins and real-time performance tracking." },
              { icon: Award, title: "Recognition & Rewards", desc: "Celebrate milestones and achievements publicly to boost team morale and engagement." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={21} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── ALTERNATING BLOCKS ── */}
      <section className="py-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-32">
          
          {/* Block 1: Text Left, Image Right */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <motion.h2 {...fadeUp()} className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">Custom Review Cycles</motion.h2>
              <motion.p {...fadeUp(0.1)} className="text-lg text-slate-500 leading-relaxed mb-8">
                Design review cycles that fit your company's rhythm. Whether you do annual appraisals, quarterly check-ins, or project-based evaluations, Zenova adapts to your needs.
              </motion.p>
              <ul className="space-y-4">
                {[
                  "Customizable appraisal templates",
                  "Automated reminder notifications",
                  "Manager calibration workflows"
                ].map((text, i) => (
                  <motion.li key={i} {...fadeUp(0.2 + (i * 0.1))} className="flex items-center gap-3">
                    <CheckCircle className="text-blue-500 w-5 h-5 shrink-0" />
                    <span className="text-slate-700 font-medium">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div 
              {...fadeUp(0.3)}
              className="lg:w-1/2 relative"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-200/50 blur-[60px] rounded-full pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Colleagues in a review meeting" 
                className="relative rounded-[2rem] shadow-2xl border border-slate-200/60 object-cover w-full h-auto"
              />
            </motion.div>
          </div>

          {/* Block 2: Image Left, Text Right */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2">
              <motion.h2 {...fadeUp()} className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">Data-Driven Promotions</motion.h2>
              <motion.p {...fadeUp(0.1)} className="text-lg text-slate-500 leading-relaxed mb-8">
                Remove bias from your promotion and compensation decisions. Use historical performance data, goal completion rates, and peer feedback to identify your top performers.
              </motion.p>
              <ul className="space-y-4">
                {[
                  "9-box grid talent mapping",
                  "Historical performance trends",
                  "Compensation recommendation engine"
                ].map((text, i) => (
                  <motion.li key={i} {...fadeUp(0.2 + (i * 0.1))} className="flex items-center gap-3">
                    <CheckCircle className="text-blue-500 w-5 h-5 shrink-0" />
                    <span className="text-slate-700 font-medium">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div 
              {...fadeUp(0.3)}
              className="lg:w-1/2 relative"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-200/50 blur-[60px] rounded-full pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Analyzing team performance" 
                className="relative rounded-[2rem] shadow-2xl border border-slate-200/60 object-cover w-full h-auto"
              />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative overflow-hidden bg-white py-24 border-t border-slate-100">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative">
          <motion.h2 {...fadeUp()} className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Unlock your team's potential.
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="text-xl text-slate-500 mb-10">
            Build a culture of continuous feedback, recognition, and high performance.
          </motion.p>
          <motion.div {...fadeUp(0.2)}>
            <Link to="/demo-form" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-blue-200">
              Get Started Now <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
      
    </div>
  );
}
