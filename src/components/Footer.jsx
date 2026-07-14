export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">

        {/* Column 1 - Brand */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            Zenova HR
          </h3>

          <p className="text-gray-400">
            A modern HR management platform helping companies
            manage employees, payroll and productivity.
          </p>
        </div>

        {/* Column 2 - Product */}
        <div>
          <h4 className="text-white font-semibold mb-4">
            Product
          </h4>

          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer">Employee Management</li>
            <li className="hover:text-white cursor-pointer">Attendance</li>
            <li className="hover:text-white cursor-pointer">Payroll</li>
            <li className="hover:text-white cursor-pointer">Recruitment</li>
          </ul>
        </div>

        {/* Column 3 - Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">
            Company
          </h4>

          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer">About</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
            <li className="hover:text-white cursor-pointer">Blog</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Column 4 - Support */}
        <div>
          <h4 className="text-white font-semibold mb-4">
            Support
          </h4>

          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer">Help Center</li>
            <li className="hover:text-white cursor-pointer">Documentation</li>
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">Terms</li>
          </ul>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="text-center text-gray-500 mt-12 border-t border-gray-800 pt-6">
        © 2026 Zenova HR. All rights reserved.
      </div>

    </footer>
  );
}