import { motion } from "framer-motion";

export default function Employee() {
  return (
    <div className="min-h-screen bg-[#F7FAFF] py-24 relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-indigo-300/30 blur-3xl rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[420px] h-[420px] bg-cyan-300/30 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          {/* BADGE */}
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100">
            👨‍💼 Employee Module
          </span>

          {/* TITLE */}
          <h1 className="text-5xl font-extrabold text-gray-900 mt-6 leading-tight">
            Employee Management System
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-5 text-lg text-gray-600 leading-relaxed">
            Manage employee records, job details, salaries, documents,
            and workforce information from a single centralized platform.
          </p>

          {/* FEATURE CARDS */}
          <div className="mt-10 space-y-4">

            {[
              {
                text: "Employee profiles & personal details",
                icon: "👤",
              },
              {
                text: "Department & designation management",
                icon: "🏢",
              },
              {
                text: "Salary & payroll information",
                icon: "💰",
              },
              {
                text: "Employee document storage",
                icon: "📄",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-gray-700 font-medium">{item.text}</p>
              </motion.div>
            ))}

          </div>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative flex justify-center"
        >

          {/* GLOW */}
          <div className="absolute w-[90%] h-[90%] bg-indigo-400/20 blur-[120px] rounded-full" />

          {/* STACKED CARDS */}
          <div className="relative w-full max-w-md">

            {/* BACK CARD */}
            <div className="absolute top-6 left-6 w-full h-full bg-cyan-100 rounded-[30px] rotate-[-6deg]" />

            {/* MIDDLE CARD */}
            <div className="absolute top-3 left-3 w-full h-full bg-white border border-gray-100 rounded-[30px] rotate-[-3deg] shadow-lg" />

            {/* FRONT CARD */}
            <div className="relative bg-white border border-gray-100 shadow-2xl rounded-[30px] p-4">

              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Employee Management"
                className="rounded-2xl w-full h-[360px] object-cover"
              />

              {/* FLOATING LABEL */}
              <div className="absolute top-6 left-6 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow">
                👨‍💼 Employee Records
              </div>

              {/* FLOATING STATS */}
              <div className="absolute bottom-6 right-6 bg-white p-4 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold text-indigo-600">
                  500+
                </h3>
                <p className="text-sm text-gray-500">
                  Active Employees
                </p>
              </div>

            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
}