import { useState, useEffect } from "react";
import DynamicSidebar from "../components/sidebar/DynamicSidebar";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <DynamicSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}