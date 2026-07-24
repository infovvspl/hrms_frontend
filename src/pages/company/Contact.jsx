import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Send, Play } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Contact() {
  const contactDetails = [
    {
      icon: Phone,
      label: "Call Us",
      value: "+91 7894689818",
      sub: "Mon-Fri, 9am-6pm IST"
    },
    {
      icon: Mail,
      label: "Email Us",
      value: "support@zenovahr.com",
      sub: "We typically reply within 24 hours"
    },
    {
      icon: MapPin,
      label: "Visit Our Office",
      value: "Block-309/310, ODYSSA Business Center,\nRasulgarh, Bhubaneswar, 751010",
      sub: "Odisha, India"
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white pt-24 pb-16 lg:pt-32 lg:pb-12">
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

        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Contact Support & Sales
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 leading-[1.07] tracking-tight mb-6"
          >
            Get in touch with our team.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Whether you need a live demo, have a technical question, or want to explore enterprise partnership opportunities, we're here to help.
          </motion.p>
        </div>
      </section>

      {/* ── CONTACT FORM & INFO SPLIT ── */}
      <section className="pb-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Left: Contact Form */}
            <motion.div 
               {...fadeUp(0.2)}
               className="lg:w-7/12"
            >
               <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-8 md:p-10">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">Send us a message</h3>
                  
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700">First Name</label>
                           <input 
                              type="text" 
                              placeholder="John" 
                              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-slate-700">Last Name</label>
                           <input 
                              type="text" 
                              placeholder="Doe" 
                              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Work Email</label>
                        <input 
                           type="email" 
                           placeholder="john@company.com" 
                           className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Subject</label>
                        <select className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-600">
                           <option>General Inquiry</option>
                           <option>Request Demo</option>
                           <option>Technical Support</option>
                           <option>Partnership</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Message</label>
                        <textarea 
                           rows={4}
                           placeholder="How can we help you?" 
                           className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                        />
                     </div>

                     <button className="w-full group flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all duration-300">
                        Send Message
                        <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                     </button>
                  </form>
               </div>
            </motion.div>

            {/* Right: Contact Details & Map */}
            <motion.div 
               {...fadeUp(0.3)}
               className="lg:w-5/12 space-y-8"
            >
               {/* Contact Cards */}
               <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-8">
                  <div className="space-y-8">
                     {contactDetails.map((item, i) => (
                        <div key={i} className="flex gap-4">
                           <div className="w-12 h-12 shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                              <item.icon size={20} className="text-blue-600" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-400 mb-1">{item.label}</p>
                              <p className="text-base font-bold text-slate-900 whitespace-pre-line leading-relaxed mb-1">{item.value}</p>
                              <p className="text-sm text-slate-500">{item.sub}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Google Map */}
               <div className="bg-white rounded-[2rem] border border-slate-100 p-2 shadow-sm h-[300px] overflow-hidden relative">
                  {/* Embedded Map for Bhubaneswar */}
                  <iframe 
                     src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119743.53374953932!2d85.73693441951556!3d20.30087021966023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1909d2d5170aa5%3A0xfc580e2b68b33fa8!2sBhubaneswar%2C%20Odisha!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                     className="w-full h-full rounded-[1.5rem]"
                     style={{ border: 0 }} 
                     allowFullScreen="" 
                     loading="lazy" 
                     referrerPolicy="no-referrer-when-downgrade"
                     title="Odisha Office Location"
                  ></iframe>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CTA BANNER (Matched to Homepage) ── */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
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
              Expert Guidance
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              See Zenova in action.
            </h2>
            <p className="text-white/75 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Request a personalized walkthrough of our platform with a product expert. We'll show you exactly how Zenova fits your workflow.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/demo-form">
                <button className="px-8 py-4 rounded-xl bg-white text-blue-700 font-black text-sm hover:scale-[1.03] transition-all shadow-xl hover:shadow-2xl">
                  Request Free Demo →
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
