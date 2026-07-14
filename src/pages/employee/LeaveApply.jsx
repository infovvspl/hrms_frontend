import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";

export default function EmployeeLeaveApply() {
  const navigate = useNavigate();
  const [remainingLeaves, setRemainingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/leaves/remaining`,
        { headers }
      );
      const list = res.data.remainingLeaves || res.data || [];
      setRemainingLeaves(list);

      // Leave it unselected initially to show placeholder
    } catch (err) {
      console.error("Error fetching balances for apply page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!leaveTypeId || !fromDate || !toDate) {
      setError("Please fill in all required fields.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError("From Date cannot be after To Date.");
      return;
    }

    try {
      setSubmitting(true);
      const employeeData = JSON.parse(localStorage.getItem("employee") || "{}");

      const payload = {
        user_id: employeeData.id,
        leave_types: Number(leaveTypeId),
        from_date: fromDate,
        to_date: toDate,
        description: description,
        status: "Pending",
      };

      await axios.post(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/leaves`,
        payload,
        { headers }
      );

      setSuccess("Leave request submitted successfully!");
      setFromDate("");
      setToDate("");
      setDescription("");

      // Refresh balances
      await fetchBalances();

      // Redirect after brief delay
      setTimeout(() => {
        navigate("/employee/leave/history");
      }, 1500);
    } catch (err) {
      console.error("Apply leave error:", err);
      setError(err.response?.data?.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/employee/leave")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition w-fit"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="bg-gradient-to-r from-[#08112d] via-[#151a5a] to-[#08112d] rounded-3xl p-6 text-white border border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-1">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                Leaves Portal
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
                Apply for Leave
              </h1>
              <p className="text-slate-300 text-xs font-semibold">
                Submit a new leave request. Your manager will receive this request for approval.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            <span className="text-sm font-bold text-slate-600 ml-3">Loading leave balances...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Form Column */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <CalendarPlus size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Application Details</h3>
                  <p className="text-[10px] text-slate-400 font-bold">SUBMIT NEW APPLICATION</p>
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
                  <AlertCircle className="shrink-0 text-rose-500" size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="shrink-0 text-emerald-500" size={16} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Leave Type *
                  </label>
                  <select
                    value={leaveTypeId}
                    onChange={(e) => setLeaveTypeId(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition duration-150"
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {remainingLeaves.map((rl) => (
                      <option key={rl.leave_type_id} value={rl.leave_type_id}>
                        {rl.leave_type_name} (Balance: {rl.balance_leave} Days)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      From Date *
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition duration-150"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      To Date *
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition duration-150"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Reason / Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe the reason for applying for leave..."
                    className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold text-slate-700 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition duration-150"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || remainingLeaves.length === 0}
                  className="w-full bg-[#2390ea] hover:bg-[#1678d4] disabled:opacity-50 text-white py-3.5 rounded-2xl text-xs font-bold transition duration-150 flex items-center justify-center shadow-md hover:scale-[1.01]"
                >
                  {submitting ? "Submitting Request..." : "Submit Application"}
                </button>
              </form>
            </div>

            {/* Sidebar Balances Info */}
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Balances Guide</h3>
                  <p className="text-[10px] text-slate-400 font-bold">AVAILABLE BALANCES REFERENCE</p>
                </div>
              </div>

              <div className="space-y-4">
                {remainingLeaves.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center">
                    No leave balances assigned.
                  </p>
                ) : (
                  remainingLeaves.map((rl) => (
                    <div key={rl.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">{rl.leave_type_name}</h4>
                        <span className="text-[9px] text-slate-400 font-semibold">Total: {rl.total_leave} Days</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-800">{rl.balance_leave}</span>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Days Left</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeDashboardLayout>
  );
}
