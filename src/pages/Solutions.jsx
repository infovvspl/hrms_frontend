import { motion } from "framer-motion";

export default function Solutions() {
  const solutions = [
    {
      title: "HR Command Center",
      icon: "https://img.icons8.com/fluency/48/manager.png",
      image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Centralize HR operations like payroll, attendance, performance, and employee data."
    },
    {
      title: "Startup Automation Suite",
      icon: "https://cdn-icons-png.flaticon.com/512/1087/1087927.png",
      image: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Automate onboarding, payroll, and HR workflows so startups can scale faster."
    },
    {
      title: "Enterprise Workforce Suite",
      icon: "https://img.icons8.com/fluency/48/company.png",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Manage large teams with compliance, analytics, and role-based access control."
    },
    {
      title: "Remote Workforce Control",
      icon: "https://img.icons8.com/fluency/48/work-from-home.png",
      image: "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Track remote employees using GPS attendance and real-time activity logs."
    },
    {
      title: "Payroll Automation",
      icon: "https://img.icons8.com/fluency/48/money.png",
      image: "https://images.pexels.com/photos/4386374/pexels-photo-4386374.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Automate salary processing, tax deductions, and payslip generation."
    },
    {
      title: "Recruitment System",
      icon: "https://img.icons8.com/fluency/48/recruitment.png",
      image: "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Manage hiring from job posting to candidate selection in one pipeline."
    }
  ];

  return (
    <section className="min-h-screen bg-[#F7FAFF] py-24">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Solutions for Every Business
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A complete HRMS platform designed for startups, enterprises, and remote teams.
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {solutions.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
            >

              {/* IMAGE (FIXED HEIGHT + OBJECT FIT = NO BLANK ISSUES) */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-56 w-full object-cover"
                  loading="lazy"
                />

                {/* ICON BADGE */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-2 rounded-full shadow flex items-center gap-2">
                  <img src={item.icon} className="w-6 h-6" />
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-6">

                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {item.desc}
                </p>

                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition">
                  Explore Solution
                </button>

              </div>

            </motion.div>
          ))}

        </div>

        {/* CTA */}
        <div className="mt-24 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-3xl p-14 text-center shadow-xl">

          <h2 className="text-3xl font-bold mb-4">
            Upgrade Your HR System Today
          </h2>

          <p className="mb-6 text-white/80">
            Automate HR operations and scale your workforce efficiently.
          </p>

          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold">
            Get Started Free
          </button>

        </div>

      </div>
    </section>
  );
}