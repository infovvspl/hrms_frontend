import { useEffect, useState, useRef } from "react";
import { FaPlus, FaEye, FaEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import DashboardLayout from "../layouts/DashboardLayout";
import DesignationModal from "../components/company/DesignationModal";
import TabBar from "../components/company/TabBar";
import axios from "axios";

const API = "http://localhost:5000/api/designations";

export default function Designation({ asTab }) {
  const [designations, setDesignations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewDesignation, setViewDesignation] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const tableWrapRef = useRef(null);
  const headerRef = useRef(null);
  const [overlayTop, setOverlayTop] = useState(140);
  const [overlayLeft, setOverlayLeft] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
  });

  const token = localStorage.getItem("token");

  // ================= GET ALL =================
  const fetchDesignations = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDesignations(res.data.designations);
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
          setDesignations(res.data.designations);
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

  // compute overlay position for empty state
  useEffect(() => {
    function updateOverlay() {
      const wrap = tableWrapRef.current;
      const header = headerRef.current;
      if (!wrap || !header) return;
      const wrapRect = wrap.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const headerBottomRel = headerRect.bottom - wrapRect.top;
      const overlayApproxH = 160;
      const bodyHeight = wrapRect.height - headerRect.height;
      const top = headerBottomRel + (bodyHeight / 2) - (overlayApproxH / 2);
      const overlayWidth = 96; // w-24
      const left = (wrap.scrollLeft || 0) + (wrap.clientWidth / 2) - (overlayWidth / 2);
      setOverlayTop(Math.round(top));
      setOverlayLeft(Math.round(left));
    }
    updateOverlay();
    window.addEventListener('resize', updateOverlay);
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateOverlay);
      if (tableWrapRef.current) ro.observe(tableWrapRef.current);
    }
    const wrapEl = tableWrapRef.current;
    if (wrapEl) wrapEl.addEventListener('scroll', updateOverlay, { passive: true });
    return () => {
      window.removeEventListener('resize', updateOverlay);
      if (wrapEl) wrapEl.removeEventListener('scroll', updateOverlay);
      if (ro) {
        try { ro.disconnect(); } catch { /* ignore */ }
      }
    };
  }, [designations.length]);

  // center the table horizontally when there are no designations
  useEffect(() => {
    if (designations.length === 0 && tableWrapRef.current) {
      const el = tableWrapRef.current;
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    }
  }, [designations.length]);

  // autofocus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [searchOpen]);

  // ================= RESET FORM =================
  const resetForm = () => {
    setFormData({ title: "" });
    setEditId(null);
  };

  const filteredDesignations = designations.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (d.title && d.title.toLowerCase().includes(q));
  });

  // ================= SAVE (CREATE / UPDATE) =================
  const handleSubmit = async () => {
    try {
      if (!formData.title) {
        alert("Title required");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // UPDATE
      if (editId) {
        await axios.put(`${API}/${editId}`, formData, config);
      }
      // CREATE
      else {
        await axios.post(API, formData, config);
      }

      fetchDesignations();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= EDIT =================
  const handleEdit = (designation) => {
    setFormData(designation);
    setEditId(designation.id);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this designation?")) return;

    try {
      await axios.delete(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchDesignations();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= CONTENT =================
  const content = (
    <div className="min-h-screen bg-slate-100 pt-2 px-6 pb-6">
      <TabBar activeTab="designation" />
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
                  placeholder="Search Designation..."
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
          <span className="text-sm">Add Designation</span>
        </button>
      </div>

      {/* TABLE */}
      <div className="relative bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">Designation List</h2>
            <p className="text-slate-300 text-sm">Manage all designation records</p>
          </div>

          <div className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium">Total: {filteredDesignations.length}</div>
        </div>

        <div className={`relative overflow-x-auto ${designations.length === 0 ? 'min-h-[360px]' : 'min-h-0'}`} ref={tableWrapRef}>
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200" ref={headerRef}>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">TITLE</th>
                <th className="px-8 py-5 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredDesignations.map((designation) => (
                <tr key={designation.id} className="border-b border-slate-200 bg-white hover:bg-slate-50 transition">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white flex items-center justify-center font-bold">{designation.title?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-semibold text-slate-800">{designation.title}</p>
                        <p className="text-xs text-slate-500">Designation</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setViewDesignation(designation)} className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"><FaEye className="mx-auto"/></button>
                      <button onClick={() => handleEdit(designation)} className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white"><FaEdit className="mx-auto"/></button>
                      <button onClick={() => handleDelete(designation.id)} className="w-10 h-10 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"><FaTrash className="mx-auto"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDesignations.length === 0 && (
            <div className="absolute z-20 pointer-events-none" style={{ top: overlayTop, left: overlayLeft, transform: 'translateX(-50%)', transition: 'left 220ms ease, top 220ms ease' }}>
              <div className="flex justify-center">
                <div className="text-center pointer-events-auto">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl mx-auto shadow-sm">💼</div>
                  <h3 className="font-semibold text-slate-700 mt-4">No Designations Found</h3>
                  <p className="text-slate-500 text-sm">Add your first designation to get started.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <DesignationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editIndex={editId}
        refreshData={fetchDesignations}
        editingId={editId}
      />

      {/* VIEW MODAL */}
      {viewDesignation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] p-5 relative">
              <h2 className="text-white text-2xl font-bold">
                Designation Details
              </h2>

              <button
                onClick={() => setViewDesignation(null)}
                className="absolute right-5 top-5 h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 hover:bg-red-500 hover:rotate-90"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p>
                <strong>Title:</strong> {viewDesignation.title}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return asTab ? content : <DashboardLayout>{content}</DashboardLayout>;
}
