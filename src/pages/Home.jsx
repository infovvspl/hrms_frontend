import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus, Minus, Users, Clock, CreditCard, BarChart3,
  UserPlus, Award, ChevronRight, Zap, CheckCircle,
  Globe, HeartHandshake, ShieldCheck, ArrowRight
} from "lucide-react";
import Hero from "../components/Hero";

const FEATURES = [
  {
    icon: Users,
    title: "Employee Management",
    path: "/employee-management",
    color: "blue",
    accent: "#3b82f6",
    lightBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-200",
    desc: "Centralized employee records, documents, and profiles for your entire workforce.",
    perks: ["Custom fields & org chart", "Document management", "Role-based access"],
  },
  {
    icon: Clock,
    title: "Attendance Tracking",
    path: "/attendance-management",
    color: "violet",
    accent: "#7c3aed",
    lightBg: "bg-violet-50",
    iconColor: "text-violet-600",
    borderHover: "hover:border-violet-200",
    desc: "Geo-fenced clock-ins, biometric integration, and intelligent shift management.",
    perks: ["GPS & biometric check-in", "Shift scheduling", "Live monitoring"],
  },
  {
    icon: CreditCard,
    title: "Payroll Automation",
    path: "/payroll-management",
    color: "emerald",
    accent: "#059669",
    lightBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-200",
    desc: "One-click payroll with auto-deductions, tax compliance and payslip generation.",
    perks: ["Auto tax & compliance", "Direct bank transfer", "Custom pay structures"],
  },
  {
    icon: UserPlus,
    title: "Recruitment",
    path: "/recruitment-management",
    color: "orange",
    accent: "#ea580c",
    lightBg: "bg-orange-50",
    iconColor: "text-orange-600",
    borderHover: "hover:border-orange-200",
    desc: "AI-assisted hiring pipeline from job posting to seamless onboarding.",
    perks: ["Job posting & pipeline", "Resume screening", "Offer letter automation"],
  },
  {
    icon: Award,
    title: "Performance Tracking",
    path: "/performance-management",
    color: "pink",
    accent: "#db2777",
    lightBg: "bg-pink-50",
    iconColor: "text-pink-600",
    borderHover: "hover:border-pink-200",
    desc: "Set OKRs, run 360° reviews, and recognize your top performers.",
    perks: ["OKR & KPI tracking", "360° review cycles", "Performance analytics"],
  },
  {
    icon: BarChart3,
    title: "HR Analytics",
    path: "/analytics-management",
    color: "sky",
    accent: "#0284c7",
    lightBg: "bg-sky-50",
    iconColor: "text-sky-600",
    borderHover: "hover:border-sky-200",
    desc: "Actionable workforce insights with real-time customizable dashboards.",
    perks: ["Real-time dashboards", "Custom reports", "Workforce heatmaps"],
  },
];

const WHY_US = [
  { icon: Zap, title: "Lightning Fast Setup", desc: "Get your entire HR system live in under 30 minutes — no IT team needed.", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: ShieldCheck, title: "Enterprise Security", desc: "SOC 2 Type II, GDPR compliant, end-to-end encrypted data at every layer.", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Globe, title: "Built for Scale", desc: "From 10 to 50,000 employees — our platform grows seamlessly with your company.", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: HeartHandshake, title: "24/7 Support", desc: "Human support, onboarding specialists, and a help center that actually helps.", color: "text-violet-500", bg: "bg-violet-50" },
];

const FAQS = [
  {
    question: "What is Zenova HRMS?",
    answer: "Zenova HRMS is a modern, cloud-based HR management platform that covers every HR workflow — employees, payroll, attendance, recruitment, leave, and performance analytics — in one beautiful, unified interface.",
  },
  {
    question: "Can I automate payroll entirely?",
    answer: "Yes. Zenova handles salary calculations, tax deductions, statutory compliance, payslip generation, and direct bank transfers automatically every pay cycle.",
  },
  {
    question: "Does Zenova support attendance tracking?",
    answer: "Absolutely. We support biometric integration, GPS geo-fencing, mobile check-ins, face recognition, and advanced shift management with real-time monitoring.",
  },
  {
    question: "Is it suitable for startups and enterprises?",
    answer: "Zenova is designed to scale. Startups can get started quickly, while enterprises get dedicated infrastructure, SSO, custom integrations, and white-glove onboarding.",
  },
  {
    question: "Is there a free trial or demo?",
    answer: "Yes — we offer a 14-day free trial with full access, and you can request a personalized live demo with one of our product specialists at any time.",
  },
];

const TRUSTED = ["Acme Corp", "Stark Industries", "Globex", "Umbrella Co.", "Initech", "Pied Piper"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">

      {/* ── HERO ── */}
      <Hero />

      {/* ── TRUSTED BY ── */}
      <section className="bg-slate-50 border-y border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-7">
            Trusted by growing teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {TRUSTED.map((name) => (
              <span key={name} className="text-slate-300 font-bold text-base tracking-tight select-none">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 bg-white relative overflow-hidden">
        {/* Soft background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/60 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Heading */}
          <motion.div {...fadeUp()} className="max-w-2xl mx-auto text-center mb-20">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide mb-5">
              Platform Features
            </span>
            <h2 className="text-4xl md:text-[2.75rem] font-black text-slate-900 leading-tight tracking-tight">
              Everything Your HR Team Will Ever Need
            </h2>
            <p className="mt-5 text-slate-500 text-lg leading-relaxed">
              Powerful, end-to-end tools so your team can stop context-switching and start executing.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.06)}
                whileHover={{ y: -6 }}
                onClick={() => navigate(f.path)}
                className={`group cursor-pointer bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-xl transition-all duration-300 ${f.borderHover} relative overflow-hidden`}
              >
                {/* Top accent strip */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${f.lightBg.replace("50", "500")} opacity-0 group-hover:opacity-100 transition-opacity`}
                  style={{ background: f.accent }} />

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${f.lightBg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={21} className={f.iconColor} />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2.5">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{f.desc}</p>

                <ul className="space-y-2 mb-6">
                  {f.perks.map((perk, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate-500 text-sm">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${f.iconColor} group-hover:gap-3 transition-all`}>
                  Learn more <ChevronRight size={14} />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ZENOVA ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Left */}
            <motion.div {...fadeUp()}>
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide mb-6">
                Why Teams Choose Zenova
              </span>
              <h2 className="text-4xl md:text-[2.6rem] font-black text-slate-900 leading-tight mb-5 tracking-tight">
                HR Infrastructure Built for Growth
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
                We obsess over reliability, speed, and simplicity so your HR team can focus on what actually matters — your people.
              </p>

              {/* Mini checklist */}
              <ul className="space-y-3 mb-10">
                {["No long-term contracts — cancel anytime", "Onboarding in under 30 minutes", "Free data migration from any existing HRMS", "SOC 2 certified & GDPR compliant"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <CheckCircle size={16} className="text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/demo-form">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 hover:shadow-lg transition-all duration-300">
                  Start Your Free Trial <ArrowRight size={15} />
                </button>
              </Link>
            </motion.div>

            {/* Right grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {WHY_US.map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.1)}
                  className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                    <item.icon size={18} className={item.color} />
                  </div>
                  <h4 className="text-slate-900 font-bold mb-2 text-sm">{item.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
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
              Limited time — 14 days free
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Ready to Modernize Your HR?
            </h2>
            <p className="text-white/75 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join 50,000+ employees already managed through Zenova. Full access, no credit card required.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/demo-form">
                <button className="px-8 py-4 rounded-xl bg-white text-blue-700 font-black text-sm hover:scale-[1.03] transition-all shadow-xl hover:shadow-2xl">
                  Get Started Free →
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

      {/* ── FAQ ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-widest mb-5">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Got Questions?
            </h2>
            <p className="mt-4 text-slate-500 text-lg">Everything you need to know about Zenova HRMS.</p>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.05)}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between px-7 py-5 text-left gap-4"
                >
                  <span className="text-base font-bold text-slate-900">{faq.question}</span>
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${openFAQ === i ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {openFAQ === i ? <Minus size={13} /> : <Plus size={13} />}
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {openFAQ === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-7 pb-6 text-slate-500 leading-relaxed text-sm border-t border-slate-50 pt-1">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}