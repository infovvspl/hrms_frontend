import { useEffect, useState, useRef } from "react";
import { FaPlus, FaEye, FaEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import DashboardLayout from "../layouts/DashboardLayout";
import BranchModal from "../components/company/BranchModal";
import axios from "axios";
import TabBar from "../components/company/TabBar";

const API = "http://localhost:5000/api/branch";

export default function Branch({ asTab }) {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewBranch, setViewBranch] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    longitude: "",
    latitude: "",
  });

  const token = localStorage.getItem("token");

  // ================= GET ALL BRANCHES =================
  const fetchBranches = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(API, { headers });
      setBranches(res.data.branches || []);
    } catch (error) {
      console.error("fetchBranches error:", error);
      // show a friendly alert and keep UI stable
      if (error.response) {
        alert(`Failed to load branches: ${error.response.status} ${error.response.statusText}`);
      } else {
        alert("Failed to load branches. See console for details.");
      }
      setBranches([]);
    }
  };

  // load branches on mount (avoid calling setState synchronously inside effect)
  useEffect(() => {
    let mounted = true;

    const loadBranches = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(API, { headers });
        if (mounted) setBranches(res.data.branches || []);
      } catch (error) {
        console.error("fetchBranches error:", error);
        if (!mounted) return;
        if (error.response) {
          alert(`Failed to load branches: ${error.response.status} ${error.response.statusText}`);
        } else {
          alert("Failed to load branches. See console for details.");
        }
        setBranches([]);
      }
    };

    loadBranches();

    return () => {
      mounted = false;
    };
  }, [token]);

  // center the table horizontally when there are no branches
  const tableWrapRef = useRef(null);
  const headerRef = useRef(null);
  const [overlayTop, setOverlayTop] = useState(140);
  const [overlayLeft, setOverlayLeft] = useState(0);
  useEffect(() => {
    if (branches.length === 0 && tableWrapRef.current) {
      const el = tableWrapRef.current;
      // center horizontally
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    }
  }, [branches.length]);

  // compute overlay vertical position so it sits below header and centered in body
  useEffect(() => {
    function updateOverlay() {
      const wrap = tableWrapRef.current;
      const header = headerRef.current;
      if (!wrap || !header) return;
      const wrapRect = wrap.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const headerBottomRel = headerRect.bottom - wrapRect.top; // relative to wrap top
      const overlayApproxH = 160; // approximate overlay height (px)
      const bodyHeight = wrapRect.height - headerRect.height;
      // center overlay vertically within the table body (below header)
      const top = headerBottomRel + (bodyHeight / 2) - (overlayApproxH / 2);
      const overlayWidth = 96; // w-24 = 6rem = 96px
      // compute left relative to scroll to center in visible area
      const left = (wrap.scrollLeft || 0) + (wrap.clientWidth / 2) - (overlayWidth / 2);
      setOverlayTop(Math.round(top));
      setOverlayLeft(Math.round(left));
    }

    updateOverlay();
    window.addEventListener("resize", updateOverlay);
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateOverlay);
      if (tableWrapRef.current) ro.observe(tableWrapRef.current);
    }
    // also update when the table is scrolled horizontally
    const wrapEl = tableWrapRef.current;
    if (wrapEl) wrapEl.addEventListener('scroll', updateOverlay, { passive: true });
    return () => {
      window.removeEventListener("resize", updateOverlay);
      if (wrapEl) wrapEl.removeEventListener('scroll', updateOverlay);
      if (ro) {
        try { ro.disconnect(); } catch { /* ignore ResizeObserver disconnect errors */ }
      }
    };
  }, [branches.length]);

  // autofocus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [searchOpen]);

  // ================= RESET FORM =================
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      longitude: "",
      latitude: "",
    });
    setEditId(null);
  };

  // ================= SAVE (CREATE / UPDATE) =================
  const handleSubmit = async () => {
    console.log("Sending Data:", formData);
    try {
      if (!formData.name || !formData.email) {
        alert("Please fill required fields: name and email are required.");
        return;
      }
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      let res;
      if (editId) {
        res = await axios.put(`${API}/${editId}`, formData, config);
      } else {
        res = await axios.post(API, formData, config);
      }

      console.log("save branch response:", res?.status, res?.data);
      if (res && (res.status === 200 || res.status === 201)) {
        // refresh list and close modal
        await fetchBranches();
        resetForm();
        setShowModal(false);
      } else {
        alert("Failed to save branch. See console for details.");
      }
    } catch (error) {
      console.error("handleSubmit error:", error);
      if (error.response) {
        alert(`Save failed: ${error.response.status} ${error.response.data?.message || error.response.statusText}`);
      } else {
        alert("Save failed. See console for details.");
      }
    }
  };

  // ================= EDIT =================
  const handleEdit = (branch) => {
    setFormData(branch);
    setEditId(branch.id);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete Branch?")) return;

    try {
      await axios.delete(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchBranches();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= CONTENT (no layout wrapper) =================
  const filteredBranches = branches.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.phone && b.phone.toLowerCase().includes(q))
    );
  });
  const content = (
    <div className="min-h-screen bg-slate-100 pt-2 px-6 pb-6">
      <TabBar activeTab="branch" />
      {/* ===== ADD BUTTON (UNCHANGED) ===== */}
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
                  placeholder="Search Branch..."
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
          <span className="text-sm">Add Branch</span>
        </button>
      </div>

      {/* ===== TABLE (UNCHANGED UI) ===== */}
      <div className="relative bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">Branch List</h2>
            <p className="text-slate-300 text-sm">Manage all branch records</p>
          </div>
          <div className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium">
            Total: {filteredBranches.length}
          </div>
        </div>

        <div
          className={`relative overflow-x-auto ${branches.length === 0 ? 'min-h-[360px]' : 'min-h-0'}`}
          ref={tableWrapRef}
        >
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200" ref={headerRef}>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap sticky left-0 z-30 bg-white shadow-sm border-r border-slate-100">
                  Branch Name
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  Email
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  Phone
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  Address Line 1
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  Address Line 2
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  City
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  State
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  Country
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  Pincode
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  Longitude
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                  Latitude
                </th>
                <th className="px-8 py-5 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
                {filteredBranches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 group"
                  >
                            <td className="px-8 py-6 sticky left-0 z-20 bg-white shadow-sm border-r border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold">
                          {branch.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {branch.name}
                          </p>
                          <p className="text-xs text-slate-500">Branch</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-600">{branch.email}</td>
                    <td className="px-8 py-6 text-slate-600">{branch.phone}</td>
                    <td className="px-8 py-6 text-slate-600">{branch.address1 || "-"}</td>
                    <td className="px-8 py-6 text-slate-600">{branch.address2 || "-"}</td>
                    <td className="px-8 py-6 text-slate-600">{branch.city || "-"}</td>
                    <td className="px-8 py-6 text-slate-600">{branch.state || "-"}</td>
                    <td className="px-8 py-6 text-slate-600">{branch.country || "-"}</td>
                    <td className="px-8 py-6 text-slate-600">{branch.pincode || "-"}</td>
                    <td className="px-8 py-6 text-slate-600">{branch.longitude ?? "-"}</td>
                    <td className="px-8 py-6 text-slate-600">{branch.latitude ?? "-"}</td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setViewBranch(branch)}
                          className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <FaEye className="mx-auto" />
                        </button>
                        <button
                          onClick={() => handleEdit(branch)}
                          className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white"
                        >
                          <FaEdit className="mx-auto" />
                        </button>
                        <button
                          onClick={() => handleDelete(branch.id)}
                          className="w-10 h-10 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <FaTrash className="mx-auto" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {filteredBranches.length === 0 && (
            <div
              className="absolute z-20 pointer-events-none"
              style={{ top: overlayTop, left: overlayLeft, transform: 'translateX(-50%)', transition: 'left 220ms ease, top 220ms ease' }}
            >
              <div className="flex justify-center">
                <div className="text-center pointer-events-auto">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl mx-auto shadow-sm">
                    🏢
                  </div>
                  <h3 className="font-semibold text-slate-700 mt-4">No Branch Found</h3>
                  <p className="text-slate-500 text-sm">Add your first branch to get started.</p>
                </div>
              </div>
            </div>
          )}

          

        </div>
      </div>

      {/* MODAL (UNCHANGED) */}
      <BranchModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editIndex={editId}
      />

      {/* VIEW MODAL (UNCHANGED) */}
      {viewBranch && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] p-5">
              <h2 className="text-white text-2xl font-bold">Branch Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <p>
                <strong>Name:</strong> {viewBranch.name}
              </p>
              <p>
                <strong>Email:</strong> {viewBranch.email}
              </p>
              <p>
                <strong>Phone:</strong> {viewBranch.phone}
              </p>
              <p>
                <strong>Address Line 1:</strong> {viewBranch.address1 || "N/A"}
              </p>
              <p>
                <strong>Address Line 2:</strong> {viewBranch.address2 || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {viewBranch.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong> {viewBranch.state || "N/A"}
              </p>
              <p>
                <strong>Country:</strong> {viewBranch.country || "N/A"}
              </p>
              <p>
                <strong>Pincode:</strong> {viewBranch.pincode || "N/A"}
              </p>
              <p>
                <strong>Longitude:</strong> {viewBranch.longitude ?? "N/A"}
              </p>
              <p>
                <strong>Latitude:</strong> {viewBranch.latitude ?? "N/A"}
              </p>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ================= KEY LINE =================
  return asTab ? content : <DashboardLayout>{content}</DashboardLayout>;
}
