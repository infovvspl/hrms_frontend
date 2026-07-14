import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPlus, FaEye, FaEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import DashboardLayout from "../layouts/DashboardLayout";
import RoleModal from "../components/company/RoleModal";
import TabBar from "../components/company/TabBar";

export default function Role({ asTab }) {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewRole, setViewRole] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const tableWrapRef = useRef(null);
  const headerRef = useRef(null);
  const [overlayTop, setOverlayTop] = useState(140);
  const [overlayLeft, setOverlayLeft] = useState(0);
  const overlayShiftX = 0;

  const [formData, setFormData] = useState({
    id: "",
    role_name: "",
  });

  const token = localStorage.getItem("token");

  // ================= GET ALL ROLES =================
  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRoles(res.data.roles);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/roles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ignore) {
          setRoles(res.data.roles);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [token]);

  // compute overlay position for empty state
  useEffect(() => {
    function updateOverlay() {
      const wrap = tableWrapRef.current;
      const header = headerRef.current;
      if (!wrap || !header) return;
      const wrapRect = wrap.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const headerBottomRel = headerRect.bottom - wrapRect.top;
      const overlayApproxH = 140;
      const bodyHeight = wrapRect.height - headerRect.height;
      const top = headerBottomRel + (bodyHeight / 2) - (overlayApproxH / 2);
      const centerX = (wrap.scrollLeft || 0) + (wrap.clientWidth / 2) + overlayShiftX;
      setOverlayTop(Math.round(top));
      setOverlayLeft(Math.round(centerX));
    }
    updateOverlay();
    window.addEventListener('resize', updateOverlay);
    const wrapEl = tableWrapRef.current;
    if (wrapEl) wrapEl.addEventListener('scroll', updateOverlay, { passive: true });
    return () => {
      window.removeEventListener('resize', updateOverlay);
      if (wrapEl) wrapEl.removeEventListener('scroll', updateOverlay);
    };
  }, [roles.length]);

  const resetForm = () => {
    setFormData({
      id: "",
      role_name: "",
    });

    setEditIndex(null);
  };
  const handleSave = async () => {
    try {
      if (!formData.role_name.trim()) {
        alert("Role Name is required");
        return;
      }

      const token = localStorage.getItem("token");

      if (editIndex === null) {
        await axios.post(
          "http://localhost:5000/api/roles",
          {
            role_name: formData.role_name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        await axios.put(
          `http://localhost:5000/api/roles/${formData.id}`,
          {
            role_name: formData.role_name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      await fetchRoles();

      resetForm();

      setShowModal(false);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (role) => {
    setFormData({
      id: role.id,
      role_name: role.role_name,
    });

    setEditIndex(role.id);

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this role?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchRoles();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const filteredRoles = roles.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (r.role_name && r.role_name.toLowerCase().includes(q));
  });

  const content = (
    <div className="min-h-screen bg-slate-100 pt-2 px-6 pb-6">
      <TabBar activeTab="role" />
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
                  placeholder="Search Role..."
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
          <span className="text-sm">Add Role</span>
        </button>
      </div>

      <div className="relative bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">Role List</h2>
            <p className="text-slate-300 text-sm">Manage all role records</p>
          </div>
          <div className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium">
            Total: {filteredRoles.length}
          </div>
        </div>

        <div className={`relative overflow-x-auto ${roles.length === 0 ? 'min-h-[360px]' : 'min-h-0'}`} ref={tableWrapRef}>
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200" ref={headerRef}>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Role Name</th>
                <th className="px-8 py-5 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold">{role.role_name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-semibold text-slate-800">{role.role_name}</p>
                        <p className="text-xs text-slate-500">Role</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-3">
                      <button title="View Role" onClick={() => setViewRole(role)} className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"><FaEye className="mx-auto"/></button>
                      <button title="Edit Role" onClick={() => handleEdit(role)} className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white"><FaEdit className="mx-auto"/></button>
                      <button title="Delete Role" onClick={() => handleDelete(role.id)} className="w-10 h-10 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"><FaTrash className="mx-auto"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRoles.length === 0 && (
            <div className="absolute z-20 pointer-events-none" style={{ top: overlayTop, left: overlayLeft, transform: 'translateX(-50%)' }}>
              <div className="flex justify-center">
                <div className="text-center pointer-events-auto">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl mx-auto shadow-sm">👤</div>
                  <h3 className="font-semibold text-slate-700 mt-4">No Roles Found</h3>
                  <p className="text-slate-500 text-sm">Add your first role to get started.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <RoleModal open={showModal} onClose={() => setShowModal(false)} onSave={handleSave} formData={formData} setFormData={setFormData} editIndex={editIndex} />

      {viewRole && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] p-5">
              <h2 className="text-white text-2xl font-bold">Role Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <p>
                <strong>Role Name:</strong> {viewRole.role_name}
              </p>
              <button onClick={() => setViewRole(null)} className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return asTab ? content : <DashboardLayout>{content}</DashboardLayout>;
}
