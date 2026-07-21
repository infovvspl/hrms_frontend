import { useState, useEffect } from "react";
import DynamicSidebar from "../components/sidebar/DynamicSidebar";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import axios from "axios";

export default function EmployeeDashboardLayout({ children, onDownloadReport }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("employee_sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("employee_sidebar_collapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  useEffect(() => {
    const fetchLatestEmployee = async () => {
      const token = localStorage.getItem("token");
      const employeeId = localStorage.getItem("employee_id");
      if (!token || !employeeId) return;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/employees/${employeeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const employeeData = res.data.employee || res.data || null;
        if (employeeData) {
          localStorage.setItem("employee", JSON.stringify(employeeData));
          window.dispatchEvent(new Event("employee-avatar-updated"));
        }
      } catch (error) {
        console.error("Error fetching latest employee data in layout:", error);
      }
    };

    fetchLatestEmployee();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <DynamicSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <DashboardNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
