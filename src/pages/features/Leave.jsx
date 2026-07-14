import { motion } from "framer-motion";

export default function Leave() {
  return (
    <div className="min-h-screen bg-[#F7FAFF] py-24 relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-pink-300/30 blur-3xl rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-indigo-300/30 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

        {/* LEFT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex justify-center"
        >
          {/* GLOW */}
          <div className="absolute w-[85%] h-[85%] bg-pink-400/20 blur-[120px] rounded-full" />

          {/* IMAGE CARD */}
          <div className="relative bg-white border border-gray-100 shadow-2xl rounded-[30px] p-4 w-full max-w-md">

            <img
              src="https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=80"
              alt="Leave Management"
              className="rounded-2xl w-full h-[360px] object-cover"
            />

            {/* TAG */}
            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow">
              📅 HR Workflow
            </div>
          </div>
        </motion.div>

        {/* RIGHT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          {/* BADGE */}
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-pink-50 text-pink-700 text-sm font-semibold border border-pink-100">
            ⚡ Smart Leave System
          </span>

          {/* TITLE */}
          <h1 className="text-5xl font-extrabold text-gray-900 mt-6 leading-tight">
            Leave Management System
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-5 text-lg text-gray-600 leading-relaxed">
            Streamline leave requests with automated approvals, real-time balance tracking,
            and transparent HR workflows.
          </p>

          {/* FEATURE CARDS */}
          <div className="mt-10 space-y-4">

            {[
              { text: "Online leave application system", icon: "📝" },
              { text: "Auto approval workflows", icon: "⚙️" },
              { text: "Real-time leave balance", icon: "📊" },
              { text: "Detailed HR reports", icon: "📅" },
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

      </div>
    </div>
  );
}