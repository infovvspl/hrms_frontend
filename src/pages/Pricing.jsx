import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, ArrowRight, Sparkles, Building2, Users } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Basic",
      monthlyPrice: "₹59",
      annualPrice: "₹59",
      period: "pepm",
      description: "For businesses trying HRMS for the first time.",
      popular: false,
      icon: Users,
    },
    {
      name: "Professional",
      monthlyPrice: "₹79",
      annualPrice: "₹79",
      period: "pepm",
      description: "For growing companies that need full automation.",
      popular: true,
      icon: Sparkles,
    },
    {
      name: "Enterprise",
      monthlyPrice: "₹99",
      annualPrice: "₹99",
      period: "pepm",
      description: "For large organizations with complex workflows.",
      popular: false,
      icon: Building2,
    }
  ];

  const featureCategories = [
    {
      title: "Core HR & Employee Management",
      features: [
        { name: "Onboarding & Basic Info", basic: true, pro: true, ent: true },
        { name: "Document Storage & Vault", basic: true, pro: true, ent: true },
        { name: "Asset Management", basic: false, pro: true, ent: true },
        { name: "Advanced Role-Based Access Control", basic: false, pro: false, ent: true },
      ]
    },
    {
      title: "Time & Attendance",
      features: [
        { name: "Leave & Holiday Tracking", basic: true, pro: true, ent: true },
        { name: "Mobile App Attendance (Selfie)", basic: true, pro: true, ent: true },
        { name: "Biometric Device Integration", basic: false, pro: true, ent: true },
        { name: "GPS & Geo-Fencing Restrictions", basic: false, pro: true, ent: true },
        { name: "Shift & Overtime Management", basic: false, pro: true, ent: true },
      ]
    },
    {
      title: "Payroll Processing",
      features: [
        { name: "Salary Slips Generation", basic: true, pro: true, ent: true },
        { name: "One-Click Month-end Payroll", basic: false, pro: true, ent: true },
        { name: "Statutory Compliance (PF, ESI, TDS)", basic: false, pro: true, ent: true },
        { name: "Custom Allowances & Deductions", basic: false, pro: true, ent: true },
      ]
    },
    {
      title: "Premium Support",
      features: [
        { name: "Email & Chat Support", basic: true, pro: true, ent: true },
        { name: "Live Online Support Sessions", basic: "1 / month", pro: "1 / month", ent: "2 / month" },
        { name: "Dedicated Success Manager", basic: false, pro: false, ent: true },
      ]
    }
  ];

  return (
    <div className="bg-[#FAFBFF] min-h-screen font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Subtle mesh gradients matching home theme */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-50/80 via-white to-transparent pointer-events-none" />
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-indigo-50/60 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#64748b 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "linear-gradient(to bottom, white 20%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to bottom, white 20%, transparent 80%)"
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
            Pricing & Plans
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-[4rem] font-black text-slate-900 leading-[1.1] tracking-tight mb-8"
          >
            Transparent pricing.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Zero hidden fees.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-14 font-medium"
          >
            Experience the full power of Zenova HRMS. Choose the plan that perfectly aligns with your team's size and ambitions.
          </motion.p>

          {/* Premium Animated Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <span className={`text-sm font-bold transition-colors ${!isAnnual ? "text-slate-900" : "text-slate-400"}`}>Pay Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative flex items-center w-16 h-8 rounded-full bg-slate-200 p-1 transition-colors hover:bg-slate-300 focus:outline-none"
            >
              <motion.div
                className="w-6 h-6 rounded-full bg-white shadow-md"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 40 }}
                style={{ marginLeft: isAnnual ? "32px" : "0px" }}
              />
            </button>
            <span className={`text-sm font-bold flex items-center gap-2 transition-colors ${isAnnual ? "text-slate-900" : "text-slate-400"}`}>
              Pay Annually
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] uppercase tracking-wider font-bold">
                Save 20%
              </span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── PREMIUM STARTUP BANNER ── */}
      <section className="relative z-20 -mt-6 pb-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <motion.div 
            {...fadeUp()} 
            className="relative overflow-hidden bg-slate-900 rounded-3xl p-1 shadow-2xl shadow-blue-900/20"
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-30 blur-xl" />
            
            <div className="relative bg-slate-900 rounded-[1.4rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-700/50">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
              
              <div className="md:w-2/3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-5 border border-blue-500/30">
                  <Sparkles size={14} className="text-blue-400" /> Exclusive Startup Offer
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Get Started @ ₹590 <span className="text-xl font-semibold text-slate-400">/month</span></h3>
                <p className="text-slate-400 leading-relaxed text-lg font-medium">
                  Perfect for fast-moving startups. Includes up to 10 Employees, Mobile App, full Payroll & HR Management, and 50+ MIS Reports. 
                </p>
              </div>
              <div className="md:w-1/3 w-full flex justify-end relative z-10">
                <Link to="/demo-form" className="w-full text-center bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:scale-105 hover:bg-blue-50 transition-all duration-300 shadow-xl shadow-white/10">
                  Claim Offer Now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.15)}
                className={`relative bg-white rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? "border border-blue-500 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)] ring-1 ring-blue-500" 
                    : "border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/30">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.popular ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600'}`}>
                    <plan.icon size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                  </div>
                </div>
                
                <p className="text-slate-500 text-sm h-10 mb-8 font-medium leading-relaxed">{plan.description}</p>
                
                <div className="mb-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-500 font-semibold ml-1">/{plan.period}</span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-emerald-600 font-bold mt-3">
                      Billed annually
                    </p>
                  )}
                </div>

                <div className="mt-auto">
                  <button
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex justify-center items-center gap-2 group ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300"
                        : "bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Select Plan
                    <ArrowRight size={16} className={`transition-transform ${plan.popular ? "group-hover:translate-x-1" : ""}`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DETAILED BREAKDOWN TABLE ── */}
      <section className="py-32 bg-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Feature Comparison</h2>
            <p className="text-lg text-slate-500 font-medium">A detailed breakdown of everything included in our plans to help you make the right choice.</p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 shadow-[0_8px_40px_rgba(0,0,0,0.03)] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr>
                    <th className="p-8 w-2/5 sticky left-0 bg-white z-20 border-b border-slate-200">
                      <div className="text-xl font-black text-slate-900">Compare Plans</div>
                      <div className="text-sm text-slate-500 font-medium mt-1">Find the perfect features for your team</div>
                    </th>
                    <th className="p-8 w-1/5 text-center bg-white border-b border-slate-200 relative">
                      <div className="text-2xl font-black text-slate-900">Basic</div>
                      <div className="text-sm font-bold text-slate-500 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-full">₹59 <span className="font-medium">/pepm</span></div>
                    </th>
                    <th className="p-8 w-1/5 text-center relative bg-blue-50/50 border-b-2 border-blue-500 z-10">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-max">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                          Most Popular
                        </span>
                      </div>
                      <div className="text-2xl font-black text-blue-700">Professional</div>
                      <div className="text-sm font-bold text-blue-600 mt-2 bg-blue-100 inline-block px-3 py-1 rounded-full">₹79 <span className="font-medium">/pepm</span></div>
                    </th>
                    <th className="p-8 w-1/5 text-center bg-white border-b border-slate-200 relative">
                      <div className="text-2xl font-black text-slate-900">Enterprise</div>
                      <div className="text-sm font-bold text-slate-500 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-full">₹99 <span className="font-medium">/pepm</span></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureCategories.map((category, catIdx) => (
                    <React.Fragment key={catIdx}>
                      {/* Category Header */}
                      <tr>
                        <td colSpan={4} className="py-6 px-8 bg-slate-50/80 sticky left-0 z-10 border-b border-slate-100">
                          <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            {category.title}
                          </h4>
                        </td>
                      </tr>
                      {/* Features */}
                      {category.features.map((feature, idx) => (
                        <tr key={idx} className="border-b border-slate-100/60 hover:bg-slate-50/50 transition-colors group">
                          <td className="py-5 px-8 text-slate-600 font-semibold sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10">
                            {feature.name}
                          </td>
                          <td className="py-5 px-6 text-center">
                            {typeof feature.basic === "boolean" ? (
                              feature.basic ? (
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mx-auto ring-1 ring-emerald-100/50 shadow-sm">
                                  <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mx-auto ring-1 ring-slate-100">
                                  <Minus className="w-4 h-4 text-slate-300 stroke-[3]" />
                                </div>
                              )
                            ) : (
                              <span className="text-[13px] text-slate-700 font-bold bg-slate-100 px-3 py-1.5 rounded-full">{feature.basic}</span>
                            )}
                          </td>
                          <td className="py-5 px-6 text-center bg-blue-50/30 group-hover:bg-blue-50/60 transition-colors">
                            {typeof feature.pro === "boolean" ? (
                              feature.pro ? (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mx-auto ring-1 ring-blue-200 shadow-sm shadow-blue-200/50">
                                  <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-50/50 flex items-center justify-center mx-auto">
                                  <Minus className="w-4 h-4 text-blue-200 stroke-[3]" />
                                </div>
                              )
                            ) : (
                              <span className="text-[13px] text-blue-700 font-bold bg-blue-100 px-3 py-1.5 rounded-full shadow-sm">{feature.pro}</span>
                            )}
                          </td>
                          <td className="py-5 px-6 text-center">
                            {typeof feature.ent === "boolean" ? (
                              feature.ent ? (
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mx-auto ring-1 ring-indigo-100 shadow-sm">
                                  <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mx-auto ring-1 ring-slate-100">
                                  <Minus className="w-4 h-4 text-slate-300 stroke-[3]" />
                                </div>
                              )
                            ) : (
                              <span className="text-[13px] text-slate-700 font-bold bg-slate-100 px-3 py-1.5 rounded-full">{feature.ent}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE CTA ── */}
      <section className="py-24 bg-slate-900 relative overflow-hidden text-center rounded-t-[3rem] mt-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp()} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-8 border border-white/20 backdrop-blur-md">
            <Building2 size={28} className="text-white" />
          </motion.div>
          <motion.h2 {...fadeUp(0.1)} className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">Need a custom enterprise solution?</motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-xl text-slate-300 mb-10 font-medium">
            We offer custom pricing, strict SLA guarantees, and dedicated account management for large organizations exceeding 1,000 employees.
          </motion.p>
          <motion.div {...fadeUp(0.3)}>
            <Link to="/contact" className="inline-flex items-center gap-2 px-9 py-4 bg-white text-slate-900 font-bold rounded-xl hover:scale-105 hover:bg-blue-50 hover:shadow-xl transition-all duration-300">
              Contact Enterprise Sales <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
      
    </div>
  );
}
