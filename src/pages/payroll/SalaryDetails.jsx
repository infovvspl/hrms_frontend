import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUserCog, 
  FaSave, 
  FaCalculator, 
  FaSpinner, 
  FaTimes, 
  FaDollarSign,
  FaCheckCircle
} from "react-icons/fa";
import DashboardLayout from "../../layouts/DashboardLayout";

const SALARY_DETAILS_API = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/payroll/salary-details`;
const CALCULATE_API = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/payroll/calculate`;

export default function SalaryDetails() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Salary Drawer Input State
  const [basic, setBasic] = useState("0.00");
  const [hra, setHra] = useState("0.00");
  const [da, setDa] = useState("0.00");
  const [ta, setTa] = useState("0.00");
  const [allowance, setAllowance] = useState("0.00");
  const [pf, setPf] = useState("0.00");
  const [esic, setEsic] = useState("0.00");
  const [tax, setTax] = useState("0.00");

  // Calculate All Dialog State
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcMonth, setCalcMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [calcYear, setCalcYear] = useState(new Date().getFullYear());
  const [calcRunning, setCalcRunning] = useState(false);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchSalaryList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(SALARY_DETAILS_API, { headers });
      setEmployees(res.data.salaryDetails || []);
    } catch (err) {
      console.error("Failed to fetch salary configurations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryList();
  }, []);

  const openEditDrawer = (emp) => {
    setEditingEmployee(emp);
    setBasic(emp.basic);
    setHra(emp.hra);
    setDa(emp.da);
    setTa(emp.ta);
    setAllowance(emp.allowance);
    setPf(emp.pf);
    setEsic(emp.esic);
    setTax(emp.tax);
  };

  const handleSaveSalaryDetails = async () => {
    if (!editingEmployee) return;
    try {
      setLoading(true);
      await axios.post(SALARY_DETAILS_API, {
        user_id: editingEmployee.user_id,
        basic: parseFloat(basic) || 0,
        hra: parseFloat(hra) || 0,
        da: parseFloat(da) || 0,
        ta: parseFloat(ta) || 0,
        allowance: parseFloat(allowance) || 0,
        pf: parseFloat(pf) || 0,
        esic: parseFloat(esic) || 0,
        tax: parseFloat(tax) || 0
      }, { headers });

      alert(`Salary structure updated successfully for ${editingEmployee.name}.`);
      setEditingEmployee(null);
      fetchSalaryList();
    } catch (err) {
      console.error("Failed to save salary config details:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunCalculation = async () => {
    try {
      setCalcRunning(true);
      const res = await axios.post(CALCULATE_API, {
        month: calcMonth,
        year: parseInt(calcYear, 10)
      }, { headers });

      alert(res.data.message || "Payroll calculated successfully for all staff members.");
      setShowCalcModal(false);
    } catch (err) {
      console.error("Failed to calculate payroll:", err);
      alert(err.response?.data?.message || "Failed to execute calculations.");
    } finally {
      setCalcRunning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-4 px-2 sm:px-4 animate-fadeIn bg-slate-50/50 rounded-[2.5rem]">
        
        {/* Zenova Corporate Header Card */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
          
          <div className="space-y-1.5 relative z-10 text-left">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-100">
              Salary Details
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-1.5">
              Salary Configurations
            </h1>
            <p className="text-slate-400 text-xs font-semibold">
              Set hourly, basic rates, statutory allowances, and provident fund rules per employee.
            </p>
          </div>

          <button 
            onClick={() => setShowCalcModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:scale-[1.02] duration-350 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer shadow-blue-200 self-start md:self-center shrink-0 z-10"
          >
            <FaCalculator /> Calculate Payroll (All)
          </button>
        </div>

        {/* Master Employees Salary Grid */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-4 w-48">Employee</th>
                  <th className="px-3 py-4 text-right">Basic Salary</th>
                  <th className="px-3 py-4 text-right">HRA</th>
                  <th className="px-3 py-4 text-right">Allowances</th>
                  <th className="px-3 py-4 text-right">Provident Fund (PF)</th>
                  <th className="px-3 py-4 text-right">Income Tax</th>
                  <th className="px-5 py-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {loading && employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-blue-600" />
                        <span>Fetching configurations from master record...</span>
                      </div>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                      No active employee profiles registered in the system.
                    </td>
                  </tr>
                ) : (
                  employees.map(emp => {
                    const gross = parseFloat(emp.basic) + parseFloat(emp.hra) + parseFloat(emp.da) + parseFloat(emp.ta) + parseFloat(emp.allowance);
                    return (
                      <tr key={emp.user_id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 leading-tight">{emp.name}</p>
                          <p className="text-[9px] text-slate-400 font-black mt-0.5 uppercase">{emp.company_employee_id || `EMP-${emp.user_id}`}</p>
                        </td>
                        <td className="px-3 py-4 text-right text-slate-800 font-extrabold">
                          ₹{parseFloat(emp.basic).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-4 text-right text-slate-500 font-bold">
                          ₹{parseFloat(emp.hra).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-4 text-right text-slate-500 font-bold">
                          ₹{(parseFloat(emp.allowance) + parseFloat(emp.da) + parseFloat(emp.ta)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-4 text-right text-rose-600 font-extrabold">
                          ₹{parseFloat(emp.pf).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-4 text-right text-rose-600 font-extrabold">
                          ₹{parseFloat(emp.tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => openEditDrawer(emp)}
                            className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-xl transition cursor-pointer"
                            title="Configure Salary Settings"
                          >
                            <FaUserCog size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Edit Salary Drawer (Side Overly) */}
        {editingEmployee && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between text-left animate-slideLeft">
              
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-850 text-base">Adjust Compensation</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">{editingEmployee.name}</p>
                  </div>
                  <button 
                    onClick={() => setEditingEmployee(null)}
                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded-xl cursor-pointer"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-4 text-xs">
                  
                  {/* Earnings */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider pl-1.5 border-l-2 border-blue-500 leading-none">Earnings / Allowances</p>
                    
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Basic Salary</label>
                        <input
                          type="number"
                          value={basic}
                          onChange={(e) => setBasic(e.target.value)}
                          className="w-full border-2 border-slate-200 bg-slate-50/20 hover:border-blue-400 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">House Rent (HRA)</label>
                        <input
                          type="number"
                          value={hra}
                          onChange={(e) => setHra(e.target.value)}
                          className="w-full border-2 border-slate-200 bg-slate-50/20 hover:border-blue-400 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dearness (DA)</label>
                        <input
                          type="number"
                          value={da}
                          onChange={(e) => setDa(e.target.value)}
                          className="w-full border-2 border-slate-200 bg-slate-50/20 hover:border-blue-400 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Travel (TA)</label>
                        <input
                          type="number"
                          value={ta}
                          onChange={(e) => setTa(e.target.value)}
                          className="w-full border-2 border-slate-200 bg-slate-50/20 hover:border-blue-400 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Other Allowances</label>
                      <input
                        type="number"
                        value={allowance}
                        onChange={(e) => setAllowance(e.target.value)}
                        className="w-full border-2 border-slate-200 bg-slate-50/20 hover:border-blue-400 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-3 pt-3">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider pl-1.5 border-l-2 border-rose-500 leading-none">Deductions / Taxes</p>
                    
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Provident Fund (PF)</label>
                        <input
                          type="number"
                          value={pf}
                          onChange={(e) => setPf(e.target.value)}
                          className="w-full border-2 border-slate-200 bg-slate-50/20 hover:border-rose-450 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ESIC</label>
                        <input
                          type="number"
                          value={esic}
                          onChange={(e) => setEsic(e.target.value)}
                          className="w-full border-2 border-slate-200 bg-slate-50/20 hover:border-rose-450 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Professional/Income Tax</label>
                      <input
                        type="number"
                        value={tax}
                        onChange={(e) => setTax(e.target.value)}
                        className="w-full border-2 border-slate-200 bg-slate-50/20 hover:border-rose-450 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex gap-3">
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="flex-1 py-3 border border-slate-200 text-slate-650 rounded-2xl text-xs font-black hover:bg-slate-50 cursor-pointer text-center"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSaveSalaryDetails}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaSave /> Save Changes
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Calculate All dialog modal */}
        {showCalcModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-6 text-left relative animate-scaleUp">
              
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-850 text-base">Calculate Monthly Payroll</h3>
                <p className="text-xs text-slate-400 font-semibold">Select the payroll period to calculate employee salaries.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Month</label>
                    <select
                      value={calcMonth}
                      onChange={(e) => setCalcMonth(e.target.value)}
                      className="w-full border-2 border-slate-200 bg-slate-50/20 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
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
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Year</label>
                    <select
                      value={calcYear}
                      onChange={(e) => setCalcYear(e.target.value)}
                      className="w-full border-2 border-slate-200 bg-slate-50/20 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-800"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-700 leading-normal font-medium text-[11px]">
                  <FaCheckCircle className="shrink-0 mt-0.5" size={14} />
                  <p>Calculating all payslips reads employee logs, approved leaves, unpaid leaves, and performs deductions based on absenteeism.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCalcModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-650 rounded-2xl text-xs font-black hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunCalculation}
                  disabled={calcRunning}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {calcRunning ? (
                    <>
                      <FaSpinner className="animate-spin" /> Calculating...
                    </>
                  ) : (
                    <>Run Calculations</>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideLeft {
          animation: slideLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp {
          animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </DashboardLayout>
  );
}
