import { Link } from "react-router-dom";

const LINKS = {
  Product: [
    ["Employee Management", "/employee-management"],
    ["Attendance", "/attendance-management"],
    ["Payroll", "/payroll-management"],
    ["Recruitment", "/recruitment-management"],
    ["Performance", "/performance-management"],
  ],
  Company: [
    ["About Us", "/about"],
    ["Careers", "/careers"],
    ["Blog", "/blog"],
    ["Contact", "/contact"],
  ],
  Support: [
    ["Help Center", "/help"],
    ["Documentation", "/docs"],
    ["Privacy Policy", "/privacy"],
    ["Terms of Service", "/terms"],
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 grid md:grid-cols-5 gap-12">

        {/* Brand */}
        <div className="md:col-span-2">
          <h3 className="text-xl font-black text-white mb-3">
            Zenova{" "}
            <span className="text-blue-400">HR</span>
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
            A modern cloud-based HRMS empowering teams of all sizes to manage employees, payroll, and productivity — beautifully.
          </p>
          {/* CTA */}
          <Link to="/demo-form">
            <button className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all shadow-md shadow-blue-900/30">
              Get Free Demo →
            </button>
          </Link>
        </div>

        {/* Links */}
        {Object.entries(LINKS).map(([section, links]) => (
          <div key={section}>
            <h4 className="text-white font-bold text-xs mb-5 uppercase tracking-widest">{section}</h4>
            <ul className="space-y-3">
              {links.map(([name, path]) => (
                <li key={name}>
                  <Link to={path} className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>© 2026 Zenova HR. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <span className="text-red-500 mx-0.5">♥</span> for modern HR teams
          </span>
        </div>
      </div>
    </footer>
  );
}