import { useEffect, useState, useRef } from "react";
import { FaPlus, FaEye, FaEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import DashboardLayout from "../layouts/DashboardLayout";
import DepartmentModal from "../components/company/DepartmentModal";
import TabBar from "../components/company/TabBar";
import axios from "axios";

const API = "http://localhost:5000/api/departments";

export default function Department({ asTab }) {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewDepartment, setViewDepartment] = useState(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    department_name: "",
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const token = localStorage.getItem("token");

  // ================= GET ALL =================
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDepartments(res.data.departments);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const res = await axios.get(API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ignore) {
          setDepartments(res.data.departments);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      department_name: "",
    });
    setEditId(null);
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      if (!formData.department_name.trim()) {
        alert("Department Name is required");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editId) {
        await axios.put(`${API}/${editId}`, formData, config);
      } else {
        await axios.post(API, formData, config);
      }

      fetchDepartments();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= EDIT =================
  const handleEdit = (department) => {
    setFormData({
      department_name: department.department_name,
    });

    setEditId(department.id);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;

    try {
      await axios.delete(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchDepartments();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= CONTENT =================
  const filteredDepartments = departments.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (d.department_name && d.department_name.toLowerCase().includes(q));
  });

  const content = (
    <div className="min-h-screen bg-slate-100 pt-2 px-6 pb-6">
      <TabBar activeTab="department" />
      <div className="flex items-center justify-end mb-4 -mt-6 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="h-11 w-11 rounded-xl bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
            aria-label="Toggle search"
          >
            <FaSearch />
          </button>

          <div className={`relative transition-all duration-200 ${searchOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
            <div className="absolute inset-0 flex items-center">
              <div className="flex items-center w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Department..."
                  className="w-full bg-white/90 text-slate-800 placeholder-slate-400 px-4 py-2 rounded-xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="-ml-10 mr-2 p-1 rounded-full bg-white/80 text-slate-600 hover:bg-slate-100"
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="h-11 bg-gradient-to-r from-[#0b163d] to-[#20287d] hover:scale-105 duration-300 text-white px-4 rounded-xl shadow-lg flex items-center gap-2"
        >
          <FaPlus />
          <span className="text-sm">Add Department</span>
        </button>
      </div>

      {/* Department List Card */}
      <div className="relative bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-4 py-3 flex justify-between items-center">
          <div>
            <h2 className="text-white text-xl font-bold">Department List</h2>
            <p className="text-slate-300 text-sm">Manage all department records</p>
          </div>

          <div className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium">Total: {filteredDepartments.length}</div>
        </div>

        <div className={`relative overflow-x-auto ${filteredDepartments.length === 0 ? 'min-h-[360px]' : 'min-h-0'}`}>
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">DEPARTMENT NAME</th>
                <th className="px-8 py-5 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="2" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">🏛️</div>
                      <h3 className="font-semibold text-slate-700">No Departments Found</h3>
                      <p className="text-slate-500 text-sm">Add your first department to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((department) => (
                  <tr key={department.id} className="border-b border-slate-200 bg-white hover:bg-slate-50 transition">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white flex items-center justify-center font-bold">{department.department_name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-semibold text-slate-800">{department.department_name}</p>
                          <p className="text-xs text-slate-500">Department</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-3">
                        <button title="View Department" onClick={() => setViewDepartment(department)} className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"><FaEye className="mx-auto" /></button>
                        <button title="Edit Department" onClick={() => handleEdit(department)} className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white transition-all duration-300"><FaEdit className="mx-auto" /></button>
                        <button title="Delete Department" onClick={() => handleDelete(department.id)} className="w-10 h-10 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"><FaTrash className="mx-auto" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>

      {/* MODAL */}
      <DepartmentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        editIndex={editId}
        refreshData={fetchDepartments}
        editingId={editId}
      />

      {/* VIEW MODAL */}
      {viewDepartment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] p-5 relative">
              <h2 className="text-white text-2xl font-bold">
                Department Details
              </h2>

              <button
                onClick={() => setViewDepartment(null)}
                className="absolute right-5 top-5 h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 hover:bg-red-500 hover:rotate-90"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-lg">
                <strong>Department Name:</strong>{" "}
                {viewDepartment.department_name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return asTab ? content : <DashboardLayout>{content}</DashboardLayout>;
}
