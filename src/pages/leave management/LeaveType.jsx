import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  X,
  Briefcase,
  Calendar,
  RotateCcw,
  Info,
  Layers,
  Shield,
  ArrowRight,
  RefreshCw,
  Sliders,
  Users
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const API_BASE = import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000";
const API = `${API_BASE}/api/leave-types`;

export default function LeaveType() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [remainingLeaves, setRemainingLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState("policies"); // "policies" or "balances"
  
  const [showModal, setShowModal] = useState(false);
  const [viewLeaveType, setViewLeaveType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    credit_type: "Monthly",
    carry_forward: "No",
    total_leave: "",
  });

  const token = localStorage.getItem("token");

  // ================= FETCH ALL DATA =================
  const fetchAllData = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [typesRes, remainRes] = await Promise.all([
        axios.get(API, { headers }),
        axios.get(`${API_BASE}/api/leaves/remaining`, { headers })
      ]);
      setLeaveTypes(typesRes.data.leaveTypes || []);
      setRemainingLeaves(remainRes.data.remainingLeaves || []);
    } catch (error) {
      console.error("fetchAllData error:", error);
      setLeaveTypes([]);
      setRemainingLeaves([]);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [searchOpen]);

  // ================= RESET FORM =================
  const resetForm = () => {
    setFormData({
      name: "",
      credit_type: "Monthly",
      carry_forward: "No",
      total_leave: "",
    });
    setEditId(null);
  };

  // ================= SAVE (CREATE / UPDATE) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.total_leave === "") {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      let res;
      if (editId) {
        res = await axios.put(`${API}/${editId}`, formData, config);
      } else {
        res = await axios.post(API, formData, config);
      }

      if (res.status === 200 || res.status === 201) {
        await fetchAllData();
        resetForm();
        setShowModal(false);
      } else {
        alert("Failed to save leave type.");
      }
    } catch (error) {
      console.error("handleSubmit error:", error);
      alert(error.response?.data?.message || "Failed to save leave type.");
    }
  };

  // ================= EDIT =================
  const handleEdit = (lt) => {
    setFormData({
      name: lt.name,
      credit_type: lt.credit_type || "Monthly",
      carry_forward: lt.carry_forward || "No",
      total_leave: lt.total_leave || "",
    });
    setEditId(lt.id);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave type?")) return;

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`${API}/${id}`, config);
      fetchAllData();
    } catch (error) {
      console.error("handleDelete error:", error);
      alert(error.response?.data?.message || "Failed to delete leave type.");
    }
  };



  // Filter policies based on search
  const filteredLeaveTypes = leaveTypes.filter((lt) => {
    return !(searchQuery && !lt.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Reduce remaining balances by user_id
  const employeeBalancesMap = remainingLeaves.reduce((acc, curr) => {
    const userId = curr.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        id: userId,
        name: `${curr.first_name || ""} ${curr.last_name || ""}`,
        department: curr.department_name || "General Staff",
        balances: {},
      };
    }
    acc[userId].balances[curr.leave_type_name] = {
      balance: parseFloat(curr.balance_leave) || 0,
      total: parseFloat(curr.total_leave) || 0,
    };
    return acc;
  }, {});

  const filteredRemainingLeaves = remainingLeaves.filter((rl) => {
    const fullName = `${rl.first_name || ""} ${rl.last_name || ""}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return (
      fullName.includes(search) ||
      (rl.leave_type_name && rl.leave_type_name.toLowerCase().includes(search)) ||
      (rl.department_name && rl.department_name.toLowerCase().includes(search))
    );
  });

  const totalCategories = leaveTypes.length;
  const totalYearlyAllowance = leaveTypes.reduce((acc, curr) => acc + parseFloat(curr.total_leave || 0), 0);
  const carryForwardCount = leaveTypes.filter((lt) => lt.carry_forward !== "No").length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 py-6 px-4 md:px-8 max-w-7xl mx-auto space-y-8 flex flex-col">
        {/* Metric Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Leave Categories */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-300 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Leave Categories</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{totalCategories}</h3>
            </div>
          </div>

          {/* Card 2: Rollover Categories */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-300 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500" />
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <RotateCcw size={18} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Rollover Categories</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{carryForwardCount}</h3>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-fit gap-1 shadow-inner border border-slate-200/20">
          <button
            onClick={() => {
              setActiveTab("policies");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === "policies" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sliders size={14} />
            <span>Policy Configurations</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("balances");
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeTab === "balances" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users size={14} />
            <span>Employee Balances Table</span>
          </button>
        </div>

        {/* Action Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h2 className="text-slate-800 text-lg font-black tracking-tight">
              {activeTab === "policies" ? "Leave Policies Catalog" : "Employee Leave Balance Records"}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">
              {activeTab === "policies"
                ? "Configure leave policy categories, yearly limits, and carry-forward settings"
                : "Spreadsheet audit console displaying current remaining and total leave days per worker"}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 shadow-sm flex items-center justify-center hover:bg-slate-200 transition-all duration-200"
                title="Search"
              >
                <Search size={16} />
              </button>
              <div className={`relative transition-all duration-250 ${searchOpen ? "w-48 md:w-56" : "w-0 overflow-hidden"}`}>
                <div className="absolute inset-0 flex items-center">
                  <div className="flex items-center w-full">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={activeTab === "policies" ? "Search Policy..." : "Search Employee..."}
                      className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="-ml-8 mr-2 p-1 rounded-full bg-white text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>



            {activeTab === "policies" && (
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] duration-300 flex items-center gap-2 transition-all font-bold text-xs"
              >
                <Plus size={14} />
                <span>Add Leave Type</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Panel Content */}
        {activeTab === "policies" && (
          <div className="flex-1">
            {filteredLeaveTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200/60 text-slate-400 text-center gap-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-350">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 text-sm">No Leave Policies Defined</h3>
                  <p className="text-slate-400 text-xs max-w-xs mt-1">
                    Configure leave policies to initialize the balance tracking dashboard for employees.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
                <div className="overflow-x-auto relative scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <th className="px-6 py-4">Policy Name</th>
                        <th className="px-6 py-4">Allowance</th>
                        <th className="px-6 py-4 text-center">Credit Frequency</th>
                        <th className="px-6 py-4 text-center">Carry Forward</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeaveTypes.map((lt, index) => {
                        const colors = [
                          "bg-indigo-50 text-indigo-700 border-indigo-150",
                          "bg-emerald-50 text-emerald-700 border-emerald-150",
                          "bg-rose-50 text-rose-700 border-rose-150",
                          "bg-purple-50 text-purple-700 border-purple-150",
                        ];
                        const activeColor = colors[index % colors.length];

                        return (
                          <tr key={lt.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800 text-xs flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${activeColor}`}>
                                {lt.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="truncate" title={lt.name}>{lt.name}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-700 text-xs font-black">
                              {lt.total_leave} Days / Year
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-[10px] text-slate-450 font-bold bg-slate-100 px-2.5 py-1 rounded-full uppercase">
                                {lt.credit_type || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                lt.carry_forward === "No"
                                  ? "bg-slate-50 text-slate-500 border-slate-200"
                                  : "bg-purple-50 text-purple-700 border-purple-100"
                              }`}>
                                {lt.carry_forward === "No" ? "No Rollover" : `${lt.carry_forward} Rollover`}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 justify-center items-center">
                                <button
                                  onClick={() => setViewLeaveType(lt)}
                                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl font-bold text-[10px] border border-slate-200 transition-all flex items-center gap-1.5"
                                >
                                  <Eye size={12} />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => handleEdit(lt)}
                                  className="p-2 bg-blue-50/50 hover:bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50 transition-all flex items-center justify-center"
                                  title="Edit Policy"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete(lt.id)}
                                  className="p-2 bg-rose-50/50 hover:bg-rose-50 text-rose-600 rounded-xl border border-rose-100/50 transition-all flex items-center justify-center"
                                  title="Delete Policy"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredLeaveTypes.length > 0 && (
                  <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between items-center">
                    <span>Displaying {filteredLeaveTypes.length} Active Policies</span>
                    <span>Click View to see details</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "balances" && (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
            <div className="overflow-x-auto relative scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Leave Type</th>
                    <th className="px-6 py-4">Total Allowance</th>
                    <th className="px-6 py-4">Used Leaves</th>
                    <th className="px-6 py-4">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRemainingLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-20 text-slate-400 text-xs font-semibold">
                        <Users size={24} className="text-slate-350 mx-auto mb-2" />
                        No employee balance records found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRemainingLeaves.map((rl) => {
                      const total = parseFloat(rl.total_leave) || 0;
                      const balance = parseFloat(rl.balance_leave) || 0;
                      const used = Math.max(0, total - balance);
                      const percent = total > 0 ? Math.min(100, Math.max(0, (balance / total) * 100)) : 0;

                      const initials = `${rl.first_name?.charAt(0) || ""}${rl.last_name?.charAt(0) || ""}`.toUpperCase();

                      return (
                        <tr key={rl.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800 text-xs flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-extrabold shrink-0">
                              {initials || "EE"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-slate-800 font-bold">{rl.first_name} {rl.last_name}</span>
                              <span className="text-[10px] text-slate-450 font-semibold">{rl.department_name || "General Staff"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-650">
                              <Layers size={10} className="text-slate-400" />
                              {rl.leave_type_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700 text-xs font-black">
                            {total} Days
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-bold">
                            {used} Days
                          </td>
                          <td className="px-6 py-4 text-xs font-black text-slate-850">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              percent > 50
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : percent > 20
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                            }`}>
                              {balance} Days Left
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredRemainingLeaves.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between items-center">
                <span>Displaying {filteredRemainingLeaves.length} Records</span>
                <span>Values represented as Remaining / Total days</span>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Policy Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
              >
                <div className="bg-gradient-to-r from-[#0b1220] via-[#15213b] to-[#0e1628] p-5 flex justify-between items-center text-white border-b border-white/5">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">{editId ? "Modify Leave Policy" : "Create Leave Policy"}</h2>
                    <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Establish allowances and rollover behaviors</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase mb-1.5">Leave Category Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Annual Leave, Sick Leave, Casual Leave"
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase mb-1.5">Total Leave (Days) *</label>
                    <input
                      type="number"
                      required
                      value={formData.total_leave}
                      onChange={(e) => setFormData({ ...formData, total_leave: e.target.value })}
                      placeholder="e.g. 12"
                      min="0"
                      step="0.5"
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase mb-1.5">Credit Frequency *</label>
                    <select
                      value={formData.credit_type}
                      onChange={(e) => setFormData({ ...formData, credit_type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs font-semibold"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase mb-1.5">Carry Forward Policy (Rollover) *</label>
                    <select
                      value={formData.carry_forward}
                      onChange={(e) => setFormData({ ...formData, carry_forward: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-xs font-semibold"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md"
                    >
                      Save Policy
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Policy Details Modal */}
        <AnimatePresence>
          {viewLeaveType && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
              >
                <div className="bg-gradient-to-r from-[#0b1220] via-[#15213b] to-[#0e1628] p-5 flex justify-between items-center text-white border-b border-white/5">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">Policy Details</h2>
                    <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Comprehensive details of the selected policy</p>
                  </div>
                  <button
                    onClick={() => setViewLeaveType(null)}
                    className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[450px] overflow-y-auto scrollbar-thin">
                  <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-blue-200 flex items-center justify-center shrink-0 font-black text-blue-600 text-lg">
                      {viewLeaveType.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">{viewLeaveType.name}</h3>
                      <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">Policy Category</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Total Days</p>
                      <p className="text-xs font-black text-slate-700 mt-1">{viewLeaveType.total_leave} Days</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Credit Type</p>
                      <p className="text-xs font-black text-slate-700 mt-1">{viewLeaveType.credit_type}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Rollover</p>
                      <p className="text-xs font-black text-slate-700 mt-1">{viewLeaveType.carry_forward === "No" ? "No" : "Yes"}</p>
                    </div>
                  </div>


                </div>

                <div className="p-6 border-t border-slate-100">
                  <button
                    onClick={() => setViewLeaveType(null)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs shadow-md transition-all duration-200"
                  >
                    Close Details
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}