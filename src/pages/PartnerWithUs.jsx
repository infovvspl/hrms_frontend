import React from "react";
import { motion } from "framer-motion";
import { Handshake, TrendingUp, ShieldCheck, ArrowRight, Network, Rocket, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function PartnerWithUs() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Generous Revenue Share",
      description: "Earn recurring commissions for every successful referral. The more you bring in, the higher your margins."
    },
    {
      icon: ShieldCheck,
      title: "Dedicated Partner Support",
      description: "Get priority access to our support engineers and a dedicated partner success manager."
    },
    {
      icon: Handshake,
      title: "Co-Marketing Opportunities",
      description: "Amplify your brand through joint webinars, case studies, and featured placements on our platform."
    },
    {
      icon: Rocket,
      title: "Early Access to Features",
      description: "Stay ahead of the curve. Partners get exclusive beta access to our newest HR modules before the public."
    }
  ];

  const partnerTypes = [
    {
      icon: Network,
      title: "Integration Partners",
      desc: "Connect your software with our HRMS API to offer a seamless experience to mutual customers.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Handshake,
      title: "Agency & Resellers",
      desc: "Add our HRMS to your portfolio and resell it to your clients with attractive profit margins.",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: Globe,
      title: "Affiliate Partners",
      desc: "Promote us on your blog, channel, or network and earn a straightforward commission per signup.",
      color: "from-sky-500 to-blue-600"
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-white pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Subtle top gradient band */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white pointer-events-none" />

        {/* Decorative circles */}
        <div className="absolute top-10 right-[-80px] w-[480px] h-[480px] rounded-full border border-blue-100/70 pointer-events-none" />
        <div className="absolute top-32 right-[-20px] w-[320px] h-[320px] rounded-full border border-indigo-100/50 pointer-events-none" />
        
        {/* Dot grid */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-blue-100/80 shadow-sm text-blue-600 text-xs font-bold tracking-widest uppercase mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Partner Program
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-[4rem] font-black text-slate-900 leading-[1.1] tracking-tight mb-8 max-w-4xl mx-auto"
          >
            Let's grow together.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Join our Partner Ecosystem.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-12 font-medium"
          >
            Partner with the fastest-growing HRMS platform. Unlock new revenue streams, co-marketing opportunities, and provide ultimate value to your clients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/contact" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2">
              Apply Now <ArrowRight size={18} />
            </Link>
            <a href="#partner-types" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-300">
              Explore Partner Types
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── BENEFITS SECTION ── */}
      <section className="py-24 relative z-10 bg-white">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Why partner with us?</h2>
            <p className="text-lg text-slate-500">We treat our partners like our own team. Enjoy industry-leading benefits designed for your success.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i} 
                {...fadeUp(i * 0.1)}
                className="bg-[#FAFBFF] border border-slate-100 rounded-3xl p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNER TYPES SECTION ── */}
      <section id="partner-types" className="py-24 relative bg-slate-900 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Ways to Partner</h2>
            <p className="text-lg text-slate-400">Choose the model that best fits your business model and audience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type, i) => (
              <motion.div 
                key={i}
                {...fadeUp(i * 0.15)}
                className="bg-slate-800/50 border border-slate-700 rounded-[2rem] p-8 backdrop-blur-sm hover:border-slate-500 transition-colors"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{type.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{type.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="py-32 relative bg-white overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-blue-50/50 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp()} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-8 border border-blue-100">
            <Handshake size={28} className="text-blue-600" />
          </motion.div>
          <motion.h2 {...fadeUp(0.1)} className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">Ready to build the future of HR?</motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-xl text-slate-500 mb-10 font-medium">
            Join hundreds of forward-thinking agencies, affiliates, and software vendors already growing with us.
          </motion.p>
          <motion.div {...fadeUp(0.3)}>
            <Link to="/contact" className="inline-flex items-center gap-2 px-9 py-4 bg-blue-600 text-white font-bold rounded-xl hover:scale-105 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300">
              Apply to Partner Program <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}