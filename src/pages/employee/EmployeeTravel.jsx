import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlane,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaCalendarAlt,
  FaDollarSign,
  FaFilePdf,
  FaFileImage,
  FaPlus,
  FaInfoCircle,
} from "react-icons/fa";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";

const BASE = import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function TravelRequestCard({ item }) {
  const submittedDate = item.submitted_at
    ? new Date(item.submitted_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-255/10">
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-255/10">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-255/10">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold shrink-0">
            <FaPlane className="rotate-45" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              {item.travel_from} ➔ {item.travel_to}
            </p>
            <p className="text-slate-300 text-[10px] font-medium mt-0.5">
              Submitted: {submittedDate}
            </p>
          </div>
        </div>
        <div>{getStatusBadge(item.status)}</div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3.5">
        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <FaInfoCircle className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Purpose</p>
            <p className="text-slate-700 font-semibold mt-0.5">{item.purpose || "No purpose provided"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <p className="font-bold text-slate-550 uppercase tracking-wider text-[9px] text-slate-400">Total Amount</p>
            <p className="text-sm font-extrabold text-indigo-650 mt-0.5">
              ₹{parseFloat(item.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <p className="font-bold text-slate-550 uppercase tracking-wider text-[9px] text-slate-400">Bill Attachment</p>
            {item.bill ? (
              <a
                href={item.bill}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-blue-650 hover:underline"
              >
                {item.bill.toLowerCase().endsWith(".pdf") ? <FaFilePdf /> : <FaFileImage />}
                View Invoice
              </a>
            ) : (
              <p className="text-xs font-bold text-slate-400 mt-1">No Attachment</p>
            )}
          </div>
        </div>

        {item.approver_name && (
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <p className="text-[10px] font-bold text-slate-500">
              Reviewed by: <span className="text-slate-750 font-black">{item.approver_name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeTravel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("my-claims"); // "my-claims" or "new-claim"

  // Form states
  const [form, setForm] = useState({
    travel_from: "",
    travel_to: "",
    purpose: "",
    total_amount: "",
  });
  const [billFile, setBillFile] = useState(null);
  const [search, setSearch] = useState("");

  const fetchTravelRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE}/api/travel/me`, {
        headers: getHeaders(),
      });
      setRequests(res.data.travelRequests || []);
    } catch (e) {
      console.error("Error fetching travel requests:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelRequests();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBillFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.travel_from.trim()) return alert("Travel origin is required");
    if (!form.travel_to.trim()) return alert("Travel destination is required");
    if (!form.total_amount || parseFloat(form.total_amount) <= 0) {
      return alert("Please enter a valid amount");
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("travel_from", form.travel_from);
      fd.append("travel_to", form.travel_to);
      fd.append("purpose", form.purpose);
      fd.append("total_amount", form.total_amount);
      if (billFile) {
        fd.append("bill", billFile);
      }

      await axios.post(`${BASE}/api/travel`, fd, {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Travel reimbursement request submitted successfully!");
      // Reset form
      setForm({
        travel_from: "",
        travel_to: "",
        purpose: "",
        total_amount: "",
      });
      setBillFile(null);
      // Switch to history and fetch
      setActiveTab("my-claims");
      fetchTravelRequests();
    } catch (err) {
      console.error("Submit claim failed:", err);
      alert(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.travel_from?.toLowerCase().includes(q) ||
      r.travel_to?.toLowerCase().includes(q) ||
      r.purpose?.toLowerCase().includes(q)
    );
  });

  return (
    <EmployeeDashboardLayout>
      <div className="min-h-screen bg-slate-100 pb-12">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Travel Reimbursement</h1>
            <p className="text-slate-500 text-sm mt-1">
              File and track your business travel claims and invoices
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex gap-2 self-start bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("my-claims")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "my-claims"
                  ? "bg-[#0b163d] text-white"
                  : "text-slate-650 hover:bg-slate-50"
              }`}
            >
              My Claims
            </button>
            <button
              onClick={() => setActiveTab("new-claim")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "new-claim"
                  ? "bg-[#0b163d] text-white"
                  : "text-slate-650 hover:bg-slate-50"
              }`}
            >
              <FaPlus size={10} /> File Claim
            </button>
          </div>
        </div>

        {activeTab === "my-claims" ? (
          /* ================= HISTORY TAB ================= */
          <>
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-6 py-4">
                  <h2 className="text-white font-bold text-lg">My Claims</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl mb-4 shadow-sm">
                    ✈️
                  </div>
                  <h3 className="font-semibold text-slate-700 text-lg">No Claims Filed</h3>
                  <p className="text-slate-400 text-sm mt-1">You haven't submitted any travel claims yet.</p>
                  <button
                    onClick={() => setActiveTab("new-claim")}
                    className="mt-4 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
                  >
                    File New Claim
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex-1 max-w-sm">
                    <FaSearch className="text-slate-400" size={13} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search claims by location..."
                      className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-650">
                        <FaTimes size={11} />
                      </button>
                    )}
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm text-sm text-slate-600 font-semibold whitespace-nowrap">
                    {filtered.length} of {requests.length} claim{requests.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Card list */}
                {filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="font-bold text-slate-750">No results found for "{search}"</p>
                    <p className="text-slate-400 text-sm mt-1">Try another keyword.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((item) => (
                      <TravelRequestCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* ================= SUBMIT NEW CLAIM TAB ================= */
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-6 py-5">
              <h2 className="text-white font-bold text-lg">File Reimbursement Claim</h2>
              <p className="text-slate-300 text-xs mt-1">Enter your journey details and attach the payment invoice</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Travel Origin (From) *</label>
                  <input
                    type="text"
                    name="travel_from"
                    required
                    value={form.travel_from}
                    onChange={handleInputChange}
                    placeholder="e.g. Mumbai HQ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Travel Destination (To) *</label>
                  <input
                    type="text"
                    name="travel_to"
                    required
                    value={form.travel_to}
                    onChange={handleInputChange}
                    placeholder="e.g. New Delhi Branch"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Total Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 pointer-events-none font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="total_amount"
                    required
                    value={form.total_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Purpose of Travel</label>
                <textarea
                  name="purpose"
                  rows="3"
                  value={form.purpose}
                  onChange={handleInputChange}
                  placeholder="Describe the business purpose..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Invoice / Bill Receipt</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition relative flex flex-col items-center justify-center min-h-[120px] cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-550">
                      {billFile ? `📄 Selected: ${billFile.name}` : "Click or Drag to upload Receipt Bill"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, JPEG, and PDF (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("my-claims")}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#0b163d] hover:bg-[#1a2550] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </EmployeeDashboardLayout>
  );
}
