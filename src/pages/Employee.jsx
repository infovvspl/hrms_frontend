import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaTimes } from "react-icons/fa";
import { formatEmployeeId } from "../utils/format";

import DashboardLayout from "../layouts/DashboardLayout";

import EmployeeStats from "../components/employee/EmployeeStats";
import { EmployeeActionBar } from "../components/employee/EmployeeFilters";
import EmployeeTable from "../components/employee/EmployeeTable";
import EmployeeModal from "../components/employee/EmployeeModal";
import EmployeeViewModal from "../components/employee/EmployeeViewModal";

const EMPLOYEE_API = "http://localhost:5000/api/employees";
const BRANCH_API = "http://localhost:5000/api/branch";
const DEPARTMENT_API = "http://localhost:5000/api/departments";
const DESIGNATION_API = "http://localhost:5000/api/designations";
const ROLE_API = "http://localhost:5000/api/roles";

export default function Employee() {
  const [employees, setEmployees] = useState([]);

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [status, setStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    newHires: 0,
  });

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // ===========================
  // FETCH EMPLOYEES
  // ===========================
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(EMPLOYEE_API, { headers });
      // The API might return { success: true, employees: [...] } or just raw array
      const data = res.data.employees || res.data || [];

      // Map properties for UI consistency
      const formattedData = data.map((emp) => ({
        ...emp,
        name: emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
        status: emp.status || emp.employment_status || "Active",
        address: emp.address || emp.present_address1 || "",
        designation_name: emp.designation_title || emp.designation_name || "",
      }));

      setEmployees(formattedData);

      setStats({
        total: formattedData.length,
        active: formattedData.filter((e) => e.status === "Active").length,
        onLeave: formattedData.filter((e) => e.status === "On Leave").length,
        newHires: formattedData.filter((e) => {
          const joinDateStr = e.doj || e.created_at;
          if (!joinDateStr) return false;

          const joinDate = new Date(joinDateStr);
          const today = new Date();
          const diff = (today - joinDate) / (1000 * 60 * 60 * 24);

          return diff <= 30;
        }).length,
      });
    } catch (error) {
      console.error("Fetch Employees Error:", error);
    }
  };

  // ===========================
  // FETCH DROPDOWNS (MASTERS)
  // ===========================
  const fetchMasters = async () => {
    try {
      const [branchRes, departmentRes, designationRes, roleRes] =
        await Promise.all([
          axios.get(BRANCH_API, { headers }).catch(() => ({ data: [] })),
          axios.get(DEPARTMENT_API, { headers }).catch(() => ({ data: [] })),
          axios.get(DESIGNATION_API, { headers }).catch(() => ({ data: [] })),
          axios.get(ROLE_API, { headers }).catch(() => ({ data: [] })),
        ]);

      setBranches(branchRes.data.branches || branchRes.data || []);
      setDepartments(departmentRes.data.departments || departmentRes.data || []);
      setDesignations(designationRes.data.designations || designationRes.data || []);
      setRoles(roleRes.data.roles || roleRes.data || []);
    } catch (error) {
      console.error("Fetch Masters Error:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchEmployees();
      await fetchMasters();
    };
    loadData();
  }, []);

  // ===========================
  // SAVE EMPLOYEE (CREATE / UPDATE)
  // ===========================
  const handleSaveEmployee = async (formData) => {
    try {
      const multipartHeaders = {
        ...headers,
        "Content-Type": "multipart/form-data",
      };

      if (editingEmployee) {
        // Edit logic
        await axios.put(`${EMPLOYEE_API}/${editingEmployee.id}`, formData, {
          headers: multipartHeaders,
        });
      } else {
        // Create logic
        await axios.post(EMPLOYEE_API, formData, {
          headers: multipartHeaders,
        });
      }

      setShowModal(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      console.error("Save Employee Error:", error);
      alert(error.response?.data?.message || "Failed to save employee record");
    }
  };

  // ===========================
  // DELETE EMPLOYEE
  // ===========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee record?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${EMPLOYEE_API}/${id}`, { headers });
      fetchEmployees();
    } catch (error) {
      console.error("Delete Employee Error:", error);
      alert(error.response?.data?.message || "Failed to delete employee");
    }
  };

  // ===========================
  // VIEW EMPLOYEE
  // ===========================
  const handleView = (employee) => {
    setSelectedEmployee(employee);
  };

  // ===========================
  // EDIT EMPLOYEE
  // ===========================
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  // ===========================
  // CSV EXPORT LOGIC
  // ===========================
  const handleExportCSV = () => {
    const csvHeaders = [
      "Employee ID",
      "Full Name",
      "Email Address",
      "Work Email",
      "Mobile Number",
      "Work Phone Number",
      "Branch",
      "Department",
      "Designation",
      "Role",
      "DOJ",
      "DOB",
      "Status",
      "Present Address",
      "Permanent Address"
    ];

    const rows = filteredEmployees.map((emp) => [
      formatEmployeeId(emp.company_name, emp.company_employee_id, emp.id),
      emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
      emp.email || "",
      emp.work_email || "",
      emp.mobile || "",
      emp.work_phone_number || "",
      emp.branch_name || "",
      emp.department_name || "",
      emp.designation_name || "",
      emp.role_name || "",
      emp.doj || "",
      emp.dob || "",
      emp.status || "",
      `${emp.present_address1 || ""} ${emp.present_address2 || ""} ${emp.present_city || ""} ${emp.present_state || ""} ${emp.present_country || ""}`.trim(),
      `${emp.permanent_address1 || ""} ${emp.permanent_address2 || ""} ${emp.permanent_city || ""} ${emp.permanent_state || ""} ${emp.permanent_country || ""}`.trim()
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [
        csvHeaders.join(","),
        ...rows.map((row) =>
          row
            .map((val) => {
              const str = String(val).replace(/"/g, '""');
              return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
            })
            .join(",")
        )
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Workforce_Export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===========================
  // FILTERS
  // ===========================
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      employee.name?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.work_email?.toLowerCase().includes(searchLower) ||
      employee.branch_name?.toLowerCase().includes(searchLower) ||
      employee.department_name?.toLowerCase().includes(searchLower) ||
      employee.designation_name?.toLowerCase().includes(searchLower) ||
      employee.mobile?.includes(search) ||
      employee.id?.toString().includes(search);

    const matchesDepartment =
      !selectedDepartment || String(employee.department_id) === String(selectedDepartment);

    const matchesBranch =
      !selectedBranch || String(employee.branch_id) === String(selectedBranch);

    const matchesStatus = !status || employee.status === status;

    return matchesSearch && matchesDepartment && matchesBranch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-2">

        {/* Stats */}
        <EmployeeStats {...stats} />
        {/* Search & Actions Bar (Below Stats) */}
        <EmployeeActionBar
          search={search}
          setSearch={setSearch}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          departments={departments}
          branches={branches}
          onAddClick={() => {
            setEditingEmployee(null);
            setShowModal(true);
          }}
          onExportClick={handleExportCSV}
          filteredCount={filteredEmployees.length}
          totalCount={employees.length}
        />

        {/* Table */}
        <EmployeeTable
          employees={filteredEmployees}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Add / Edit Modal */}
        {showModal && (
          <EmployeeModal
            employee={editingEmployee}
            onClose={handleCloseModal}
            onSubmit={handleSaveEmployee}
            branches={branches}
            departments={departments}
            designations={designations}
            roles={roles}
            employees={employees}
          />
        )}

        {/* View Modal */}
        {selectedEmployee && (
          <EmployeeViewModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            employees={employees}
          />
        )}
      </div>
    </DashboardLayout>
  );
}