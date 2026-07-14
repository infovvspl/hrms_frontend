import { useEffect, useState, useRef } from "react";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import axios from "axios";

const API = "http://localhost:5000/api/holiday";

export default function Holiday() {
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewHoliday, setViewHoliday] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    from_date: "",
    to_date: "",
    is_optional: false,
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState("All");
  const [upcomingActiveIndex, setUpcomingActiveIndex] = useState(0);

  const token = localStorage.getItem("token");

  // ================= FETCH HOLIDAYS =================
  const fetchHolidays = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(API, { headers });
      setHolidays(res.data.holidays || []);
    } catch (error) {
      console.error("fetchHolidays error:", error);
      setHolidays([]);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [token]);

  // autofocus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [searchOpen]);

  // Automatically adjust default selected year to maximum available year if no holidays in current year
  useEffect(() => {
    setUpcomingActiveIndex(0);
    if (holidays.length > 0) {
      const currentYearStr = new Date().getFullYear().toString();
      const hasCurrentYear = holidays.some(
        (h) => new Date(h.from_date).getFullYear().toString() === currentYearStr
      );
      if (!hasCurrentYear) {
        const years = holidays.map((h) => new Date(h.from_date).getFullYear());
        const maxYear = Math.max(...years).toString();
        setSelectedYear(maxYear);
      }
    }
  }, [holidays]);

  // ================= RESET FORM =================
  const resetForm = () => {
    setFormData({
      name: "",
      from_date: "",
      to_date: "",
      is_optional: false,
    });
    setEditId(null);
  };

  // ================= SAVE (CREATE / UPDATE) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.from_date || !formData.to_date) {
      alert("Please fill all required fields.");
      return;
    }

    if (new Date(formData.to_date) < new Date(formData.from_date)) {
      alert("End date cannot be before start date.");
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
        await fetchHolidays();
        resetForm();
        setShowModal(false);
      } else {
        alert("Failed to save holiday.");
      }
    } catch (error) {
      console.error("handleSubmit error:", error);
      alert(error.response?.data?.message || "Failed to save holiday.");
    }
  };

  // ================= EDIT =================
  const handleEdit = (holiday) => {
    const fromDateObj = new Date(holiday.from_date);
    const toDateObj = new Date(holiday.to_date);

    const pad = (n) => String(n).padStart(2, "0");
    const from_date = `${fromDateObj.getFullYear()}-${pad(fromDateObj.getMonth() + 1)}-${pad(fromDateObj.getDate())}`;
    const to_date = `${toDateObj.getFullYear()}-${pad(toDateObj.getMonth() + 1)}-${pad(toDateObj.getDate())}`;

    setFormData({
      name: holiday.name,
      from_date,
      to_date,
      is_optional: !!holiday.is_optional,
    });
    setEditId(holiday.id);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`${API}/${id}`, config);
      fetchHolidays();
    } catch (error) {
      console.error("handleDelete error:", error);
      alert(error.response?.data?.message || "Failed to delete holiday.");
    }
  };

  // ================= DATE HELPERS =================
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getDuration = (fromStr, toStr) => {
    if (!fromStr || !toStr) return 0;
    const from = new Date(fromStr);
    const to = new Date(toStr);
    from.setHours(0,0,0,0);
    to.setHours(0,0,0,0);
    const diff = to.getTime() - from.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // ================= HOLIDAY STATUS HELPER =================
  const getHolidayStatus = (fromStr, toStr) => {
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const start = new Date(fromStr);
    start.setHours(0,0,0,0);
    const end = new Date(toStr);
    end.setHours(0,0,0,0);

    if (todayDate > end) {
      return { label: "Passed", style: "bg-slate-100 text-slate-600 border-slate-200" };
    } else if (todayDate >= start && todayDate <= end) {
      return { label: "Active Today", style: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    } else {
      return { label: "Upcoming", style: "bg-blue-50 border-blue-100 text-blue-700" };
    }
  };

  // ================= UPCOMING HOLIDAYS LIST HELPER =================
  const getUpcomingHolidays = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return [...holidays]
      .filter((h) => new Date(h.from_date) >= today)
      .sort((a, b) => new Date(a.from_date) - new Date(b.from_date));
  };

  const upcomingHolidays = getUpcomingHolidays();

  const handleNextUpcoming = (e) => {
    e.preventDefault();
    setUpcomingActiveIndex((prev) => (prev + 1) % upcomingHolidays.length);
  };

  const handlePrevUpcoming = (e) => {
    e.preventDefault();
    setUpcomingActiveIndex((prev) => (prev - 1 + upcomingHolidays.length) % upcomingHolidays.length);
  };

  const getDaysRemaining = (dateStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    target.setHours(0,0,0,0);
    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  // ================= FILTERING LOGIC =================
  const filteredHolidays = holidays.filter((h) => {
    if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedYear !== "All") {
      const yr = new Date(h.from_date).getFullYear().toString();
      if (yr !== selectedYear) return false;
    }
    const statusObj = getHolidayStatus(h.from_date, h.to_date);
    if (statusFilter === "Upcoming" && statusObj.label === "Passed") {
      return false;
    }
    if (statusFilter === "Past" && statusObj.label !== "Passed") {
      return false;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pt-2 px-6 pb-6 max-w-7xl mx-auto space-y-6">
        
        {/* ================= CONTROLS & NAVIGATION ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Link
              to="/holiday/calendar"
              className="px-4 py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <FaCalendarAlt />
              View Calendar
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white text-slate-800 border border-slate-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold shadow-sm cursor-pointer"
              >
                <option value="All">All Years</option>
                {Array.from({ length: 21 }, (_, i) => (2015 + i).toString()).map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 shadow-sm flex items-center justify-center hover:bg-slate-200 transition-all"
              >
                <FaSearch />
              </button>

              <div className={`relative transition-all duration-200 ${searchOpen ? "w-48 md:w-56" : "w-0 overflow-hidden"}`}>
                <div className="absolute inset-0 flex items-center">
                  <div className="flex items-center w-full">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Holiday..."
                      className="w-full bg-white text-slate-800 placeholder-slate-400 px-4 py-2 rounded-xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="-ml-8 mr-2 p-1 rounded-full bg-white text-slate-600 hover:bg-slate-100"
                      >
                        <FaTimes size={10} />
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
              className="h-10 bg-gradient-to-r from-[#0b163d] to-[#20287d] hover:scale-105 duration-300 text-white px-4 rounded-xl shadow-md flex items-center gap-2 transition-all font-semibold text-sm"
            >
              <FaPlus />
              <span>Add Holiday</span>
            </button>
          </div>
        </div>

        {/* ================= MAIN 2-COLUMN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2/3 COLUMN: HOLIDAY REGISTRY TABLE */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Tabs */}
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex gap-1">
              {["All", "Upcoming", "Past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                    statusFilter === tab
                      ? "bg-gradient-to-r from-[#0b163d] to-[#20287d] text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab} Holidays
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-slate-800 text-lg font-bold">Holiday Master Registry</h2>
                  <p className="text-slate-500 text-xs mt-0.5">List of corporate calendar holidays</p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-semibold border border-indigo-100">
                  Showing: {filteredHolidays.length}
                </span>
              </div>

              <div className="overflow-x-auto min-h-[320px] relative">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-4">Holiday Name</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Day</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHolidays.map((holiday) => {
                      const statusObj = getHolidayStatus(holiday.from_date, holiday.to_date);
                      return (
                        <tr
                          key={holiday.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 block text-sm">{holiday.name}</span>
                              {holiday.is_optional && (
                                <span className="bg-purple-50 border border-purple-200 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  Optional
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">Corporate Holiday</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                            {formatDate(holiday.from_date)}
                            {holiday.from_date !== holiday.to_date && ` - ${formatDate(holiday.to_date)}`}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                            {getDayOfWeek(holiday.from_date)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                              {getDuration(holiday.from_date, holiday.to_date)}{" "}
                              {getDuration(holiday.from_date, holiday.to_date) === 1 ? "day" : "days"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusObj.style}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusObj.label === "Passed" ? "bg-slate-400" : statusObj.label.startsWith("Active") ? "bg-emerald-500" : "bg-indigo-500"}`} />
                              {statusObj.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center justify-center gap-1">
                              <button
                                onClick={() => setViewHoliday(holiday)}
                                className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                                title="View Details"
                              >
                                <FaEye size={14} />
                              </button>
                              <button
                                onClick={() => handleEdit(holiday)}
                                className="p-2 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Edit Holiday"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(holiday.id)}
                                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Delete Holiday"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Empty State */}
                {filteredHolidays.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 px-4 w-full">
                    <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-semibold text-slate-700 mt-4">No Holidays Found</h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs text-center">There are no holidays matching the selected filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 1/3 COLUMN: WIDGETS */}
          <div className="space-y-6">
            
            {/* NEXT HOLIDAY CARD WITH SLIDER */}
            {upcomingHolidays.length > 0 ? (
              (() => {
                const activeUpcoming = upcomingHolidays[upcomingActiveIndex] || upcomingHolidays[0];
                return (
                  <div className="bg-gradient-to-br from-[#0e1731] via-[#1a2d5f] to-[#0e1731] text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
                    <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-950/40 border border-indigo-700/30 px-2.5 py-1 rounded-full">
                        Upcoming Next ({upcomingActiveIndex + 1} of {upcomingHolidays.length})
                      </span>
                      
                      {upcomingHolidays.length > 1 && (
                        <div className="flex gap-1.5 z-10">
                          <button
                            onClick={handlePrevUpcoming}
                            className="w-7 h-7 bg-indigo-950/50 hover:bg-indigo-950/80 border border-indigo-700/20 text-white rounded-lg flex items-center justify-center transition-all"
                            title="Previous"
                          >
                            <FaChevronLeft size={10} />
                          </button>
                          <button
                            onClick={handleNextUpcoming}
                            className="w-7 h-7 bg-indigo-950/50 hover:bg-indigo-950/80 border border-indigo-700/20 text-white rounded-lg flex items-center justify-center transition-all"
                            title="Next"
                          >
                            <FaChevronRight size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-black mt-4 tracking-tight truncate">
                      {activeUpcoming.name}
                    </h3>
                    
                    <div className="mt-4 flex items-center gap-3 text-indigo-100">
                      <div className="w-10 h-10 bg-indigo-950/40 rounded-xl flex items-center justify-center shrink-0 border border-indigo-700/20">
                        <FaCalendarAlt className="text-indigo-300" size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-indigo-200">Date & Day</p>
                        <p className="text-sm font-bold text-white">
                          {formatDate(activeUpcoming.from_date)} ({getDayOfWeek(activeUpcoming.from_date)})
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-indigo-700/40 flex justify-between items-center">
                      <span className="text-xs text-indigo-200 font-semibold">Remaining Time</span>
                      <span className="bg-emerald-500 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                        {getDaysRemaining(activeUpcoming.from_date)}
                      </span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl p-6 text-center">
                <FaCalendarAlt className="mx-auto mb-2 text-slate-400" size={24} />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Holiday</p>
                <p className="text-sm font-semibold text-slate-600 mt-2">No upcoming holidays scheduled</p>
              </div>
            )}

            {/* HOLIDAY SUMMARY stats card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-slate-800 font-bold text-base">Holiday Summary</h3>
                <p className="text-slate-400 text-xs">Overview for the selected year</p>
              </div>
              
              <div className="divide-y divide-slate-100">
                <div className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span className="text-sm text-slate-600 font-medium">Total Holidays</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {holidays.filter(h => selectedYear === "All" || new Date(h.from_date).getFullYear().toString() === selectedYear).length}
                  </span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-sm text-slate-600 font-medium">Upcoming Holidays</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {holidays.filter(h => {
                      const inYear = selectedYear === "All" || new Date(h.from_date).getFullYear().toString() === selectedYear;
                      const status = getHolidayStatus(h.from_date, h.to_date);
                      return inYear && status.label !== "Passed";
                    }).length}
                  </span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-sm text-slate-600 font-medium">Passed Holidays</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {holidays.filter(h => {
                      const inYear = selectedYear === "All" || new Date(h.from_date).getFullYear().toString() === selectedYear;
                      const status = getHolidayStatus(h.from_date, h.to_date);
                      return inYear && status.label === "Passed";
                    }).length}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ===== ADD / EDIT MODAL ===== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
              <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] p-6 flex justify-between items-center">
                <h2 className="text-white text-2xl font-bold">
                  {editId ? "Edit Corporate Holiday" : "Add Corporate Holiday"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Holiday Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Independence Day"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.from_date}
                      onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.to_date}
                      onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Optional Holiday</label>
                    <span className="text-[10px] text-slate-500">Allow employees to opt-in or mark as optional</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_optional || false}
                      onChange={(e) => setFormData({ ...formData, is_optional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#0b163d] to-[#20287d] hover:scale-105 duration-300 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
                  >
                    Save Holiday
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== VIEW DETAILS MODAL ===== */}
        {viewHoliday && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
              <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] p-6 flex justify-between items-center">
                <h2 className="text-white text-xl font-bold">Holiday Details</h2>
                <button
                  onClick={() => setViewHoliday(null)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-indigo-200 flex flex-col items-center justify-center overflow-hidden shrink-0">
                    <div className="w-full bg-indigo-600 text-white text-[9px] font-black text-center py-0.5 uppercase tracking-wide">
                      {new Date(viewHoliday.from_date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                    </div>
                    <div className="text-slate-800 text-sm font-black py-0.5">
                      {new Date(viewHoliday.from_date).getDate()}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{viewHoliday.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Corporate Holiday Event</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Start Date</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">{formatDate(viewHoliday.from_date)}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">End Date</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">{formatDate(viewHoliday.to_date)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">Holiday Type</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${viewHoliday.is_optional ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                    {viewHoliday.is_optional ? "Optional" : "Mandatory"}
                  </span>
                </div>

                <div className="bg-indigo-50/30 p-4 rounded-2xl flex justify-between items-center border border-indigo-50">
                  <span className="text-sm text-slate-600 font-medium">Total Duration</span>
                  <span className="bg-gradient-to-r from-[#0b163d] to-[#20287d] text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-sm">
                    {getDuration(viewHoliday.from_date, viewHoliday.to_date)}{" "}
                    {getDuration(viewHoliday.from_date, viewHoliday.to_date) === 1 ? "day" : "days"}
                  </span>
                </div>

                <button
                  onClick={() => setViewHoliday(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md"
                >
                  Close Detail
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
