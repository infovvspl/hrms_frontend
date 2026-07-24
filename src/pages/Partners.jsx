import { motion } from "framer-motion";
import { Users, Handshake, Globe, Rocket, ArrowRight, CheckCircle, Network, TrendingUp, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Partner() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Generous Revenue Share",
      desc: "Earn high recurring commissions for every successful referral. The more you bring in, the higher your margins.",
    },
    {
      icon: ShieldCheck,
      title: "Dedicated Partner Support",
      desc: "Get priority access to our support engineers and a dedicated partner success manager for your team.",
    },
    {
      icon: Network,
      title: "Co-Marketing Opportunities",
      desc: "Amplify your brand through joint webinars, case studies, and featured placements on our platform.",
    },
    {
      icon: Rocket,
      title: "Early Access to Features",
      desc: "Stay ahead of the curve. Partners get exclusive beta access to our newest HR modules before the public.",
    },
  ];

  const programs = [
    {
      title: "Technology Partner",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      desc: "Integrate your software with the Zenova HR ecosystem via our open APIs to offer a seamless experience to mutual customers.",
    },
    {
      title: "Implementation Partner",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      desc: "Help companies configure and implement our HR solutions effectively, adding your consulting value to the platform.",
    },
    {
      title: "Referral Partner",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Promote us to your network and earn a straightforward, lucrative recurring commission on closed sales.",
    },
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
                Partner Ecosystem
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 leading-[1.07] tracking-tight mb-6"
              >
                Let's grow together.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-slate-500 leading-relaxed max-w-lg mb-10"
              >
                Partner with the fastest-growing HRMS platform. Unlock new revenue streams, co-marketing opportunities, and provide ultimate value to your clients.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 items-center"
              >
                <Link to="/contact">
                  <button className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:scale-[1.02] transition-all duration-300">
                    Apply to Partner
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <a href="#programs">
                  <button className="group flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all duration-300">
                    View Programs
                  </button>
                </a>
              </motion.div>
            </div>

            {/* Right side Image */}
            <motion.div
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.15 }}
              className="lg:w-1/2 w-full relative hidden md:block"
            >
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-16 bg-blue-200 blur-[50px] rounded-full opacity-60" />
              <div className="relative rounded-2xl shadow-[0_32px_80px_rgba(59,130,246,0.12),0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200/80 bg-white p-2">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80" 
                  alt="Partnership" 
                  className="w-full h-[500px] object-cover rounded-xl"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── WHY PARTNER ── */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-5">Why Partner With Us?</h2>
            <p className="text-lg text-slate-500 leading-relaxed">We treat our partners like our own team. Enjoy industry-leading benefits designed specifically for your success.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
            {benefits.map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <item.icon size={21} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section id="programs" className="py-24 bg-slate-50 border-y border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-20">
          
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide mb-5">
              Partnership Models
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-5">Ways to Partner</h2>
            <p className="text-lg text-slate-500 leading-relaxed">Choose the partnership model that best fits your business goals and audience.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((p, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 overflow-hidden transition-all duration-300 relative"
              >
                <div className="relative">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                     <h3 className="text-2xl font-bold text-white shadow-sm">{p.title}</h3>
                  </div>
                </div>

                <div className="p-7">
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 h-[60px]">{p.desc}</p>
                  
                  <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Apply for this program <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
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
              Join The Ecosystem
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Ready to grow together?
            </h2>
            <p className="text-white/75 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join hundreds of forward-thinking agencies, affiliates, and software vendors already growing with us.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <button className="px-8 py-4 rounded-xl bg-white text-blue-700 font-black text-sm hover:scale-[1.03] transition-all shadow-xl hover:shadow-2xl">
                  Apply For Partnership →
                </button>
              </Link>
              <a href="#programs">
                <button className="px-8 py-4 rounded-xl border border-white/25 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all backdrop-blur">
                  View Programs
                </button>
              </a>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
