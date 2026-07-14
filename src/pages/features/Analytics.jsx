import { motion } from "framer-motion";

const analyticsFeatures = [
  {
    id: 1,
    text: "Real-time HR dashboards",
    icon: "📈",
  },
  {
    id: 2,
    text: "Attendance analytics",
    icon: "📅",
  },
  {
    id: 3,
    text: "Performance insights",
    icon: "🚀",
  },
  {
    id: 4,
    text: "Department-wise reports",
    icon: "🏢",
  },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-[#F7FAFF] py-24 relative overflow-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-cyan-300/30 blur-3xl rounded-full" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[420px] h-[420px] bg-indigo-300/30 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* BADGE */}
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-50 text-cyan-700 text-sm font-semibold border border-cyan-100">
            📊 Analytics Module
          </span>

          {/* TITLE */}
          <h1 className="text-5xl font-extrabold text-gray-900 mt-6 leading-tight">
            Advanced HR Analytics
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-5 text-lg text-gray-600 leading-relaxed">
            Gain powerful workforce insights with real-time dashboards, employee
            performance analytics, attendance reports, and smart HR metrics.
          </p>

          {/* FEATURE CARDS */}
          <div className="mt-10 space-y-4">
            {analyticsFeatures.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <span className="text-2xl">{item.icon}</span>

                <p className="text-gray-700 font-medium">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT DASHBOARD CARD */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative flex justify-center"
        >
          {/* GLOW */}
          <div className="absolute w-[85%] h-[85%] bg-cyan-400/20 blur-[120px] rounded-full" />

          {/* MAIN CARD */}
          <div className="relative bg-white border border-gray-100 shadow-2xl rounded-[30px] p-5 w-full max-w-md">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <span className="w-3 h-3 bg-red-400 rounded-full"></span>

                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>

                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              </div>

              <span className="text-xs text-gray-400">Analytics Dashboard</span>
            </div>

            {/* IMAGE */}
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
              alt="Analytics Dashboard"
              className="rounded-2xl w-full h-[320px] object-cover"
            />

            {/* STATS */}
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="bg-cyan-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Reports</p>

                <p className="font-bold text-cyan-700">248</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Employees</p>

                <p className="font-bold text-blue-700">540</p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Growth</p>

                <p className="font-bold text-indigo-700">+28%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
