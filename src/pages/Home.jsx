// Home.jsx

import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus } from "lucide-react";

import Hero from "../components/Hero";

export default function Home() {

  const navigate = useNavigate();

  const [openFAQ, setOpenFAQ] = useState(null);

  const features = [
    {
      title: "Employee Management",
      path: "/employee-management",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
      desc: "Manage employee records, documents and profiles in one centralized dashboard."
    },

    {
      title: "Attendance Tracking",
      path: "/attendance-management",
      img: "https://images.unsplash.com/photo-1581092335397-9583eb92d232",
      desc: "Track attendance using biometric, GPS and mobile check-ins."
    },

    {
      title: "Payroll Automation",
      path: "/payroll-management",
      img: "https://images.unsplash.com/photo-1554224155-1696413565d3",
      desc: "Automate salary processing with tax and compliance support."
    },

    {
      title: "Recruitment",
      path: "/recruitment-management",
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978",
      desc: "Hire and onboard employees faster with smart workflows."
    },

    {
      title: "Performance Tracking",
      path: "/performance-management",
      img: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
      desc: "Track employee goals, KPIs and team productivity."
    },

    {
      title: "HR Analytics",
      path: "/analytics-management",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      desc: "Get real-time HR insights with advanced analytics dashboards."
    }
  ];

  const faqs = [
    {
      question: "What is Zenova HRMS?",
      answer:
        "Zenova HRMS is a modern cloud-based HR management platform for managing employees, payroll, attendance, recruitment, and performance."
    },

    {
      question: "Can I manage payroll automatically?",
      answer:
        "Yes, Zenova automates salary calculations, deductions, compliance, and payroll reports."
    },

    {
      question: "Does Zenova support attendance tracking?",
      answer:
        "Yes, it supports biometric, GPS, mobile attendance, and shift tracking systems."
    },

    {
      question: "Is the platform suitable for startups?",
      answer:
        "Absolutely. Zenova HRMS is scalable for startups, SMEs, and enterprise organizations."
    },

    {
      question: "Can I get a free demo?",
      answer:
        "Yes, you can request a personalized free demo directly from the website."
    }
  ];

  return (
    <div className="bg-[#F5F9FF] min-h-screen overflow-hidden">

      {/* HERO */}
      <Hero />

      {/* FEATURES */}
      <section className="py-24 relative overflow-hidden">

        {/* BG EFFECT */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6">

          {/* HEADING */}
          <div className="text-center mb-16">

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-extrabold text-gray-900"
            >

              Everything Your HR Team Needs

            </motion.h2>

            <p className="mt-5 text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">

              Powerful HR tools designed for modern organizations
              to automate workflows and boost productivity.

            </p>

          </div>

          {/* FEATURE CARDS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

            {features.map((f, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl hover:shadow-2xl"
              >

                {/* IMAGE */}
                <div className="overflow-hidden">

                  <img
                    src={f.img}
                    alt={f.title}
                    className="h-56 w-full object-cover group-hover:scale-110 transition duration-500"
                  />

                </div>

                {/* CONTENT */}
                <div className="p-7">

                  <h3 className="text-2xl font-bold text-gray-900">

                    {f.title}

                  </h3>

                  <p className="text-gray-600 mt-4 leading-relaxed">

                    {f.desc}

                  </p>

                  {/* BUTTON */}
                  <button
                    onClick={() => navigate(f.path)}
                    className="mt-6 text-blue-700 font-semibold hover:translate-x-2 transition duration-300"
                  >

                    Learn More →

                  </button>

                </div>

              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">

        {/* BG EFFECT */}
        <div className="absolute top-10 right-0 w-80 h-80 bg-blue-100 blur-3xl rounded-full opacity-60"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">

          {/* HEADING */}
          <div className="text-center mb-16">

            <h2 className="text-5xl font-extrabold text-gray-900">

              Frequently Asked Questions

            </h2>

            <p className="mt-5 text-lg text-gray-600">

              Everything you need to know about Zenova HRMS.

            </p>

          </div>

          {/* FAQ ITEMS */}
          <div className="space-y-6">

            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-[#F8FBFF] border border-blue-100 rounded-3xl shadow-lg overflow-hidden"
              >

                {/* QUESTION */}
                <button
                  onClick={() =>
                    setOpenFAQ(openFAQ === index ? null : index)
                  }
                  className="w-full flex items-center justify-between px-8 py-6 text-left"
                >

                  <h3 className="text-lg md:text-xl font-bold text-gray-900">

                    {faq.question}

                  </h3>

                  <div className="text-blue-700">

                    {openFAQ === index ? (
                      <Minus size={24} />
                    ) : (
                      <Plus size={24} />
                    )}

                  </div>

                </button>

                {/* ANSWER */}
                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === index ? "auto" : 0,
                    opacity: openFAQ === index ? 1 : 0
                  }}
                  className="overflow-hidden"
                >

                  <p className="px-8 pb-6 text-gray-600 leading-relaxed">

                    {faq.answer}

                  </p>

                </motion.div>

              </motion.div>
            ))}

          </div>

        </div>

      </section>

    </div>
  );
}