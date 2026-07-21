import { useEffect, useState, useRef } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  Search,
  RefreshCw,
  UserMinus,
  Users,
  CheckCircle,
  Clock,
  Building,
  Briefcase,
  Calendar,
  X,
  Eye,
  Send,
  FileText,
  AlertOctagon,
  Download,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image,
  PenTool,
  Grid
} from "lucide-react";
import { formatEmployeeId } from "../../utils/format";
import { getEmployeeAvatarSrc } from "../../utils/companyLogo";

const EMPLOYEE_API = "http://localhost:5000/api/employees";
const DEPARTMENT_API = "http://localhost:5000/api/departments";

export default function TerminationLetterManagement() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal & History Drawer state
  const [modalEmployee, setModalEmployee] = useState(null);
  const [drawerEmployee, setDrawerEmployee] = useState(null);
  const [terminationHistory, setTerminationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // New Termination letter form state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const editorRef = useRef(null);

  const [companyInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("company") || "{}");
    } catch {
      return {};
    }
  });

  // Pre-populate editor with a professional termination template
  useEffect(() => {
    if (modalEmployee && editorRef.current) {
      const companyName = companyInfo.company_name || "Company";
      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const initialHtml = `<p>Dear <strong>${modalEmployee.name}</strong>,</p>
<p>This letter serves as formal notification that your employment with <strong>${companyName}</strong> is terminated, effective <strong>${formattedDate}</strong>.</p>
<p><strong>Reason for Termination & Discussion Summary:</strong></p>
<p><em>[Please specify the reasons, policy violations, or performance details here...]</em></p>
<p>Please return all company property, including but not limited to your laptop, access badges, keys, and any other company-owned materials, on or before your last working day. Your final salary, along with any accrued benefits or severance pay (if applicable), will be calculated and paid out in accordance with company policy and legal guidelines.</p>
<p>We thank you for your service and wish you the best in your future endeavors.</p>
<p>Sincerely,</p>
<p><strong>HR Department</strong><br/>${companyName}</p>`;
      editorRef.current.innerHTML = initialHtml;
      setDescription(initialHtml);
      setSubject("Official Notice of Employment Termination");
    }
  }, [modalEmployee, companyInfo]);

  const execEditorCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 11px;">Item Details</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 11px;">Status / Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Return of Assets</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Pending last working day</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Final Payroll Settlement</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Within next pay cycle</td>
          </tr>
        </tbody>
      </table>
    `;
    execEditorCommand("insertHTML", tableHtml);
  };

  const insertLogo = () => {
    let logoUrl = "";
    if (companyInfo.logo) {
      logoUrl = companyInfo.logo;
      if (!logoUrl.startsWith("http") && !logoUrl.startsWith("data:")) {
        logoUrl = `http://localhost:5000/${logoUrl.replace(/^\//, "")}`;
      }
    }
    if (!logoUrl) {
      logoUrl = "https://placehold.co/120x60?text=Company+Logo";
    }
    const logoHtml = `<img src="${logoUrl}" alt="Company Logo" style="height: 48px; max-height: 48px; display: block; margin: 12px 0;" />`;
    execEditorCommand("insertHTML", logoHtml);
  };

  const insertSignature = () => {
    let sigUrl = "https://placehold.co/100x40?text=Signature";
    const sigHtml = `<img src="${sigUrl}" alt="HR Signature" style="height: 36px; max-height: 36px; display: block; margin: 12px 0;" />`;
    execEditorCommand("insertHTML", sigHtml);
  };

  const handleEditorInput = (e) => {
    setDescription(e.currentTarget.innerHTML);
  };

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        axios.get(EMPLOYEE_API, { headers }),
        axios.get(DEPARTMENT_API, { headers }).catch(() => ({ data: [] }))
      ]);

      const empData = empRes.data.employees || empRes.data || [];
      const mapped = empData.map((emp) => ({
        ...emp,
        name: emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim()
      }));

      // Fetch termination counts for each employee
      const employeesWithTerminationCount = await Promise.all(
        mapped.map(async (emp) => {
          try {
            const termRes = await axios.get(`http://localhost:5000/api/employees/${emp.id}/termination-letters`, { headers });
            return {
              ...emp,
              terminationCount: termRes.data.termination_letters?.length || 0
            };
          } catch (e) {
            return { ...emp, terminationCount: 0 };
          }
        })
      );

      setEmployees(employeesWithTerminationCount);
      setDepartments(deptRes.data.departments || deptRes.data || []);

      // Sync active drawer employee count/data if open
      if (drawerEmployee) {
        const updated = employeesWithTerminationCount.find((e) => e.id === drawerEmployee.id);
        if (updated) {
          setDrawerEmployee(updated);
          fetchTerminationHistory(updated.id);
        }
      }
    } catch (err) {
      console.error("Error fetching termination letter data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTerminationHistory = async (empId) => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/employees/${empId}/termination-letters`, { headers });
      setTerminationHistory(res.data.termination_letters || []);
    } catch (err) {
      console.error("Error fetching termination history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueTermination = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert("Please fill in both Subject and Description fields.");
      return;
    }

    if (!window.confirm(`Are you absolutely sure you want to issue a formal termination letter to ${modalEmployee.name}? This will record the termination and email the official document.`)) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/employees/${modalEmployee.id}/termination-letter`,
        { subject: subject.trim(), description: description.trim() },
        { headers }
      );
      if (res.data.success) {
        alert(res.data.message || "Termination letter issued and emailed successfully!");
        setSubject("");
        setDescription("");
        setModalEmployee(null);
        fetchData();
      }
    } catch (err) {
      console.error("Error issuing termination letter:", err);
      alert(err.response?.data?.message || "Failed to issue termination letter.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenHistory = (emp) => {
    setDrawerEmployee(emp);
    fetchTerminationHistory(emp.id);
  };

  const handleDownloadPdf = async (letterId, empName) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/employees/termination-letter/${letterId}/download`,
        { headers, responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Termination_Letter_${empName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Failed to download termination letter PDF:", err);
      alert("Failed to download PDF. Please try again.");
    }
  };

  // Stats calculation
  const totalWorkforce = employees.length;
  const terminatedCount = employees.filter((e) => e.terminationCount > 0).length;
  const activeCount = totalWorkforce - terminatedCount;

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(search.toLowerCase())) ||
      (emp.company_employee_id && String(emp.company_employee_id).includes(search));
    const matchDept = !selectedDepartment || String(emp.department_id) === String(selectedDepartment);
    return matchSearch && matchDept;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto p-2 relative">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 shadow-sm">
              <Users size={22} />
            </div>
            <div>
              <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Total Workforce</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalWorkforce}</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0 shadow-sm">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Active Employees</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{activeCount}</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 shrink-0 shadow-sm">
              <AlertOctagon size={22} />
            </div>
            <div>
              <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Terminations Processed</p>
              <h3 className="text-2xl font-black text-red-600 mt-0.5">{terminatedCount}</h3>
            </div>
          </div>
        </div>

        {/* Unified Top Control Bar */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center gap-4 justify-between w-full">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee ID, Name, or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white pl-10 pr-4 py-2.5 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold transition-all duration-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none bg-slate-50/80 border border-slate-200 hover:border-slate-300 text-slate-600 px-5 py-2.5 pr-9 rounded-full text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer min-w-[140px]"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4.5 px-6">Workforce Member</th>
                  <th className="py-4.5 px-6">Job Role & Department</th>
                  <th className="py-4.5 px-6">Date of Joining</th>
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6 text-right min-w-[240px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-650">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-10 font-bold text-slate-400">Loading workforce directory...</td></tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 font-bold text-slate-400">No matching employee records found</td></tr>
                ) : filteredEmployees.map((emp) => {
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center shrink-0 overflow-hidden font-black text-slate-700">
                          {emp.image ? <img src={getEmployeeAvatarSrc(emp.image)} alt={emp.name} className="w-full h-full object-cover" /> : emp.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-black text-slate-800 text-sm">{emp.name}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block font-bold">{formatEmployeeId(emp.company_name, emp.company_employee_id, emp.id)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-700"><Briefcase size={13} className="text-slate-400 shrink-0" /><span>{emp.designation_title || "Associate"}</span></div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Building size={11} className="text-slate-350 shrink-0" /><span>{emp.department_name || "Staff"}</span></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-650"><Calendar size={13} className="text-slate-400 shrink-0" /><span>{emp.doj ? new Date(emp.doj).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}</span></div>
                      </td>
                      <td className="py-4 px-6">
                        {emp.terminationCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-red-50 text-red-650 border border-red-100 uppercase tracking-wider">
                            Terminated ({emp.terminationCount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right min-w-[240px]">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button onClick={() => handleOpenHistory(emp)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-black shadow-sm border border-slate-200 transition cursor-pointer">
                            <Eye size={13} />
                            History
                          </button>
                          <button onClick={() => setModalEmployee(emp)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-black shadow-sm transition active:scale-95 duration-150 cursor-pointer">
                            <UserMinus size={13} />
                            Issue Termination
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Issue Termination Letter */}
        {modalEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden transition-all scale-100">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                    <UserMinus size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">Issue Employment Termination Letter</h3>
                    <p className="text-[10px] text-slate-300 font-bold mt-0.5">Prepare and send a formal termination notice to {modalEmployee.name}</p>
                  </div>
                </div>
                <button onClick={() => setModalEmployee(null)} className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleIssueTermination} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Termination Subject / Title
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Notice of Employment Termination"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-450 focus:bg-white outline-none rounded-xl text-xs font-bold text-slate-800 transition"
                      required
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-h-[300px]">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Reason & Description (Draft Official Termination Letter)
                    </label>

                    {/* WYSIWYG Editor */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-white">
                      {/* Editor Toolbar */}
                      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1 text-slate-500 shrink-0">
                        <button type="button" onClick={() => execEditorCommand("bold")} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition cursor-pointer" title="Bold"><Bold size={14} /></button>
                        <button type="button" onClick={() => execEditorCommand("italic")} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition cursor-pointer" title="Italic"><Italic size={14} /></button>
                        <button type="button" onClick={() => execEditorCommand("underline")} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition cursor-pointer" title="Underline"><Underline size={14} /></button>
                        <div className="h-4 w-px bg-slate-300 mx-1"></div>
                        <button type="button" onClick={() => execEditorCommand("justifyLeft")} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition cursor-pointer" title="Align Left"><AlignLeft size={14} /></button>
                        <button type="button" onClick={() => execEditorCommand("justifyCenter")} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition cursor-pointer" title="Align Center"><AlignCenter size={14} /></button>
                        <button type="button" onClick={() => execEditorCommand("justifyRight")} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition cursor-pointer" title="Align Right"><AlignRight size={14} /></button>
                        <div className="h-4 w-px bg-slate-300 mx-1"></div>
                        <button type="button" onClick={() => execEditorCommand("insertUnorderedList")} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition cursor-pointer" title="Bulleted List"><List size={14} /></button>
                        <button type="button" onClick={() => execEditorCommand("insertOrderedList")} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition cursor-pointer" title="Numbered List"><ListOrdered size={14} /></button>
                        <div className="h-4 w-px bg-slate-300 mx-1"></div>
                        <button type="button" onClick={insertTable} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition flex items-center gap-1 cursor-pointer" title="Insert Status Table"><Grid size={14} /><span className="text-[9px] font-bold">Table</span></button>
                        <button type="button" onClick={insertLogo} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition flex items-center gap-1 cursor-pointer" title="Insert Company Logo"><Image size={14} /><span className="text-[9px] font-bold">Logo</span></button>
                        <button type="button" onClick={insertSignature} className="p-1.5 hover:bg-slate-200 rounded text-slate-650 transition flex items-center gap-1 cursor-pointer" title="Insert HR Signature"><PenTool size={14} /><span className="text-[9px] font-bold">Signature</span></button>
                      </div>

                      {/* Content Editable Editor Pane */}
                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorInput}
                        className="p-5 overflow-y-auto min-h-[220px] max-h-[350px] outline-none text-xs text-slate-700 leading-relaxed font-semibold font-sans w-full"
                        style={{ minHeight: "220px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-slate-450">
                    <FileText size={14} />
                    <span className="text-[10px] font-bold text-slate-550">
                      This notice will be recorded in history and dispatched immediately as a formal email to <strong>{modalEmployee.email}</strong>.
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={() => setModalEmployee(null)}
                      className="px-4 py-2 border border-slate-250 hover:bg-slate-100 text-slate-700 text-xs font-black rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send size={13} />
                      {submitting ? "Sending..." : "Issue Letter"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drawer: Termination History */}
        <div className={`fixed inset-0 z-50 w-screen h-screen bg-slate-100 flex flex-col transition-transform duration-300 ease-out transform ${drawerEmployee ? "translate-x-0" : "translate-x-full"}`}>
          {drawerEmployee && (
            <div className="flex flex-col h-full overflow-hidden bg-slate-50">
              {/* Drawer Header */}
              <div className="px-8 py-5.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 text-white">
                    <UserMinus size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm">{drawerEmployee.name} — Employment Termination History</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      ID: {formatEmployeeId(drawerEmployee.company_name, drawerEmployee.company_employee_id, drawerEmployee.id)} · {drawerEmployee.designation_title || "Associate"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setDrawerEmployee(null)} className="flex items-center justify-center gap-1 px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-black shadow-sm transition cursor-pointer">
                  <X size={15} />
                  Close Profile
                </button>
              </div>

              {/* Drawer Body content */}
              <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Termination History Stack ({terminationHistory.length})</h4>
                  <button onClick={() => setModalEmployee(drawerEmployee)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-black shadow-sm transition cursor-pointer">
                    <Send size={13} />
                    Issue New Notice
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-12 font-bold text-slate-400 text-xs animate-pulse">Fetching records...</div>
                ) : terminationHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-200 shrink-0 mb-4 shadow-inner">
                      <CheckCircle size={28} />
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Perfect Employment Record</h4>
                    <p className="text-xs text-slate-500 font-bold max-w-[300px] mt-1.5 leading-relaxed">
                      This employee has not received any formal written termination notices.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {terminationHistory.map((item) => {
                      return (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4.5 flex justify-between items-center">
                            <div>
                              <h5 className="font-black text-slate-800 text-sm">{item.subject}</h5>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                Issued By: {item.issued_by_name || "HR Officer"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-500 font-black bg-slate-200/60 px-3 py-1.5 rounded-lg">
                                {new Date(item.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                              <button
                                onClick={() => handleDownloadPdf(item.id, drawerEmployee.name)}
                                className="flex items-center justify-center p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 shadow-sm transition cursor-pointer"
                                title="Download PDF"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <div className="w-full max-w-[800px] bg-white border border-slate-200 p-8 rounded-xl shadow-inner letter-preview">
                              <style dangerouslySetInnerHTML={{__html: `
                                .letter-preview p { margin-bottom: 1.2em; }
                                .letter-preview ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.2em; }
                                .letter-preview ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.2em; }
                                .letter-preview table { width: 100%; border-collapse: collapse; margin: 1.2em 0; }
                                .letter-preview th, .letter-preview td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                                .letter-preview th { background-color: #f8fafc; font-weight: bold; }
                                .letter-preview img { margin: 1em 0; }
                              `}} />
                              <div
                                className="text-xs text-slate-700 leading-relaxed font-semibold font-sans w-full max-w-full overflow-x-auto"
                                dangerouslySetInnerHTML={{ __html: item.description }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
