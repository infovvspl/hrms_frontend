import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import TabBar from "../components/company/TabBar";
import OrgTree from "../components/employee/OrgTree";
import EmployeeViewModal from "../components/employee/EmployeeViewModal";
import axios from "axios";

export default function EmployeeTree({ asTab }) {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/employees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data.employees || res.data || [];

      // Format employee data for consistent visualization
      setEmployees(data.map(emp => ({
        ...emp,
        name: emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
        status: emp.status || emp.employment_status || "Active",
        designation_name: emp.designation_title || emp.designation_name || "",
      })));
    } catch (err) {
      console.error("Error fetching employees in tree page:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/branch`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBranches(res.data.branches || res.data || []);
    } catch (err) {
      console.error("Error fetching branches in tree page:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
  }, []);

  const handleView = (employee) => {
    setSelectedEmployee(employee);
  };

  const filteredEmployees = selectedBranchId === "all"
    ? employees
    : employees.filter(emp => String(emp.branch_id) === String(selectedBranchId));

  const content = (
    <div className={asTab ? "pt-2 pb-6" : "min-h-screen bg-slate-100 pt-2 px-6 pb-6"}>
      <TabBar activeTab="employee-tree" />

      {loading ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-md text-center font-bold text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p>Loading Organizational Chart...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg relative overflow-hidden">
          <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />

          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Organizational Tree</h2>
              <p className="text-slate-500 text-xs font-semibold">
                Visualize reporting lines and structural hierarchy within your organization
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Branch:</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors shadow-sm cursor-pointer"
                >
                  <option value="all">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name || b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-100 rounded-xl px-4 py-2 border border-slate-200 text-xs font-black text-slate-600 shadow-inner">
                Total Staff: {filteredEmployees.length}
              </div>
            </div>
          </div>

          <OrgTree employees={filteredEmployees} onView={handleView} />
        </div>
      )}

      {/* View Profile Modal */}
      {selectedEmployee && (
        <EmployeeViewModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          employees={employees}
        />
      )}
    </div>
  );

  return asTab ? content : <DashboardLayout>{content}</DashboardLayout>;
}
