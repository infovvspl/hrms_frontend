import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaFileInvoiceDollar, 
  FaSpinner, 
  FaChevronLeft, 
  FaChevronRight, 
  FaCheckCircle, 
  FaEye, 
  FaTimes,
  FaFilePdf
} from "react-icons/fa";
import DashboardLayout from "../../layouts/DashboardLayout";

const RECORDS_API = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/payroll/records`;
const GENERATE_API = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/payroll/generate`;

export default function Payslip() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Select Month
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"));
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Payslip Preview Modal
  const [previewRecord, setPreviewRecord] = useState(null);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${RECORDS_API}?month=${selectedMonth}&year=${selectedYear}`, { headers });
      setRecords(res.data.payrollRecords || []);
    } catch (err) {
      console.error("Failed to fetch payroll calculations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedMonth, selectedYear]);



  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const handleGeneratePayslip = async (id) => {
    try {
      await axios.post(GENERATE_API, { id }, { headers });
      alert("Payslip generated successfully.");
      fetchRecords();
    } catch (err) {
      console.error("Failed to generate payslip:", err);
      alert(err.response?.data?.message || "Failed to generate payslip.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 animate-fadeIn bg-slate-50/50 rounded-[2.5rem]">
        
        {/* Zenova Corporate Header Card */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
          
          <div className="space-y-1.5 text-left relative z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-100">
              Payslip Generation
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-1.5">
              Monthly Payslip Manager
            </h1>
            <p className="text-slate-400 text-xs font-semibold">
              Publish generated payslips directly to employee profiles and print invoices.
            </p>
          </div>

          {/* Month/Year selectors */}
          <div className="flex gap-2 self-start md:self-center shrink-0 z-10">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="px-3.5 py-2 border-2 border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="px-3.5 py-2 border-2 border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>

        {/* Calculated Payroll Table */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-4 w-44">Employee</th>
                  <th className="px-3 py-4 text-center">Work Days</th>
                  <th className="px-3 py-4 text-center">Present / LOP</th>
                  <th className="px-3 py-4 text-right">Gross Salary</th>
                  <th className="px-3 py-4 text-right">Deductions</th>
                  <th className="px-3 py-4 text-right">Net Salary</th>
                  <th className="px-5 py-4 text-center w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {loading && records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-blue-600" />
                        <span>Loading calculated payroll registers...</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                      No calculated records found for {monthNames[parseInt(selectedMonth, 10) - 1]} {selectedYear}. Please run calculations inside the Salary Details page first.
                    </td>
                  </tr>
                ) : (
                  records.map(rec => {
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 leading-tight">{rec.name}</p>
                          <p className="text-[9px] text-slate-400 font-black mt-0.5 uppercase">{rec.company_employee_id || `EMP-${rec.user_id}`}</p>
                        </td>
                        <td className="px-3 py-4 text-center text-slate-800 font-bold">
                          {rec.total_working_days}
                        </td>
                        <td className="px-3 py-4 text-center font-bold text-slate-500">
                          {rec.present_days} P / <span className="text-rose-500 font-extrabold">{rec.lop_days} LOP</span>
                        </td>
                        <td className="px-3 py-4 text-right text-slate-800 font-extrabold">
                          ₹{parseFloat(rec.gross_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-4 text-right text-rose-500 font-extrabold">
                          ₹{parseFloat(rec.total_deductions || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-4 text-right text-emerald-600 font-black">
                          ₹{parseFloat(rec.net_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                if (rec.payslip_path) {
                                  window.open(`${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}${rec.payslip_path}`, '_blank');
                                } else {
                                  alert("Please click the 'Generate' button to compile the payslip PDF first.");
                                }
                              }}
                              className="p-2 text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition cursor-pointer"
                              title="View Payslip PDF"
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              onClick={() => handleGeneratePayslip(rec.id)}
                              className={`px-3 py-1.5 text-white rounded-xl text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1 shadow-sm ${
                                rec.payslip_path 
                                  ? "bg-slate-500 hover:bg-slate-600 shadow-slate-100" 
                                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                              }`}
                              title={rec.payslip_path ? "Regenerate Payslip PDF" : "Generate & Publish Payslip"}
                            >
                              <FaFileInvoiceDollar size={10} /> {rec.payslip_path ? "Regenerate" : "Generate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payslip Document Preview Modal */}
        {previewRecord && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-[2rem] p-8 shadow-2xl space-y-6 text-left relative overflow-y-auto max-h-[90vh] animate-scaleUp">
              
              {/* Close Button */}
              <button 
                onClick={() => setPreviewRecord(null)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded-xl cursor-pointer"
              >
                <FaTimes size={16} />
              </button>

              {/* Printable Area Wrapper */}
              <div id="payslip-print-section" className="space-y-6 bg-white p-2">
                
                {/* Payslip Title Bar */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">SALARY SLIP</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      For {monthNames[parseInt(previewRecord.month, 10) - 1]} {previewRecord.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-blue-600 text-sm">Zenova Systems</p>
                    <p className="text-[9px] font-semibold text-slate-400 leading-tight">HRMS Corporate HQ</p>
                  </div>
                </div>

                {/* Employee Corporate Details Block */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Employee Name</p>
                    <p className="font-bold text-slate-800">{previewRecord.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2">Designation / Role</p>
                    <p className="font-semibold text-slate-700">Software Engineer</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Employee Code</p>
                    <p className="font-bold text-slate-800">{previewRecord.company_employee_id || `EMP-${previewRecord.user_id}`}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2">Email Address</p>
                    <p className="font-semibold text-slate-700">{previewRecord.email}</p>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                    <p className="text-[8px] text-slate-450 uppercase font-black tracking-wider">Work Days</p>
                    <p className="font-extrabold text-slate-850 mt-0.5">{previewRecord.total_working_days}</p>
                  </div>
                  <div className="border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                    <p className="text-[8px] text-slate-450 uppercase font-black tracking-wider">Present Days</p>
                    <p className="font-extrabold text-slate-850 mt-0.5">{previewRecord.present_days}</p>
                  </div>
                  <div className="border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                    <p className="text-[8px] text-slate-450 uppercase font-black tracking-wider">LOP Days</p>
                    <p className="font-extrabold text-rose-500 mt-0.5">{previewRecord.lop_days}</p>
                  </div>
                  <div className="border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                    <p className="text-[8px] text-slate-450 uppercase font-black tracking-wider">Leave Days</p>
                    <p className="font-extrabold text-indigo-500 mt-0.5">{previewRecord.leave_days}</p>
                  </div>
                </div>

                {/* Earnings & Deductions Tables */}
                <div className="grid md:grid-cols-2 gap-6 text-xs align-top">
                  
                  {/* Earnings */}
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider pl-1.5 border-l-2 border-emerald-500 leading-none">Earnings</p>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                      <div className="flex justify-between p-3 border-b border-slate-100">
                        <span className="font-bold text-slate-500">Basic Salary</span>
                        <span className="font-extrabold text-slate-850">₹{parseFloat(previewRecord.basic || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between p-3 border-b border-slate-100">
                        <span className="font-bold text-slate-500">House Rent Allowance (HRA)</span>
                        <span className="font-extrabold text-slate-850">₹{parseFloat(previewRecord.hra || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between p-3">
                        <span className="font-bold text-slate-500">Other Allowances</span>
                        <span className="font-extrabold text-slate-850">₹{(parseFloat(previewRecord.allowance || 0) + parseFloat(previewRecord.da || 0) + parseFloat(previewRecord.ta || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50/70 border-t border-slate-200">
                        <span className="font-black text-slate-800">Gross Earnings</span>
                        <span className="font-black text-slate-800">₹{parseFloat(previewRecord.gross_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider pl-1.5 border-l-2 border-rose-500 leading-none">Deductions</p>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                      <div className="flex justify-between p-3 border-b border-slate-100">
                        <span className="font-bold text-slate-500">Provident Fund (PF)</span>
                        <span className="font-extrabold text-rose-500">₹{parseFloat(previewRecord.pf || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between p-3 border-b border-slate-100">
                        <span className="font-bold text-slate-500">Income Tax (TDS)</span>
                        <span className="font-extrabold text-rose-500">₹{parseFloat(previewRecord.tax || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between p-3">
                        <span className="font-bold text-slate-500">Loss of Pay (LOP)</span>
                        <span className="font-extrabold text-rose-500">₹{(parseFloat(previewRecord.total_deductions || 0) - parseFloat(previewRecord.pf || 0) - parseFloat(previewRecord.tax || 0) - parseFloat(previewRecord.esic || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50/70 border-t border-slate-200">
                        <span className="font-black text-slate-800">Total Deductions</span>
                        <span className="font-black text-rose-600">₹{parseFloat(previewRecord.total_deductions || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Net Salary Summary Panel */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white p-5 rounded-2xl flex justify-between items-center text-left">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider block opacity-70">Net Take-Home Salary</span>
                    <span className="text-xl md:text-2xl font-black mt-1 block">₹{parseFloat(previewRecord.net_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-wider block opacity-70">Payment Status</span>
                    <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 mt-1.5 inline-block">Approved</span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-4 pt-8 text-[10px] text-slate-400 font-bold border-t border-dashed border-slate-200">
                  <div className="text-left">
                    <p className="h-8 border-b border-slate-200 w-28"></p>
                    <p className="mt-1">Manager Signature</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="h-8 border-b border-slate-200 w-28"></p>
                    <p className="mt-1">Employee Signature</p>
                  </div>
                </div>

              </div>

              {/* Action trigger buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setPreviewRecord(null)}
                  className="flex-1 py-3 border border-slate-200 text-slate-650 rounded-2xl text-xs font-black hover:bg-slate-50 cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaFilePdf /> Print Invoice
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp {
          animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #payslip-print-section, #payslip-print-section * {
            visibility: visible;
          }
          #payslip-print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
