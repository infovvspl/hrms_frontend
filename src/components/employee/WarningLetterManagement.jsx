import { useEffect, useState, useRef } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  Search,
  RefreshCw,
  AlertTriangle,
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
  Trash2,
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
  Grid,
  Download
} from "lucide-react";
import { formatEmployeeId } from "../../utils/format";
import { getEmployeeAvatarSrc } from "../../utils/companyLogo";

const EMPLOYEE_API = "http://localhost:5000/api/employees";
const DEPARTMENT_API = "http://localhost:5000/api/departments";

export default function WarningLetterManagement() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  // Warning modal & history drawer state
  const [modalEmployee, setModalEmployee] = useState(null);
  const [drawerEmployee, setDrawerEmployee] = useState(null);
  const [warningHistory, setWarningHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // New Warning form state
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

  useEffect(() => {
    if (modalEmployee && editorRef.current) {
      const companyName = companyInfo.company_name || "Company";
      const initialHtml = `<p>Dear <strong>${modalEmployee.name}</strong>,</p>
<p>This letter serves as an official warning notice regarding a review of your conduct, performance, or behavior. We have identified areas requiring immediate improvement.</p>
<p><strong>Reason for Warning & Incident Details:</strong></p>
<p><em>[Please draft the detailed incident details, dates, and violations here...]</em></p>
<p>We expect you to take immediate and sustained corrective action to resolve the issues described above. Please note that failure to improve or repeated infractions of company rules will lead to further disciplinary actions, up to and including termination of your employment.</p>
<p>Sincerely,</p>
<p><strong>HR Department</strong><br/>${companyName}</p>`;
      editorRef.current.innerHTML = initialHtml;
      setDescription(initialHtml);
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
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 11px;">Header 1</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 11px;">Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Data 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11px;">Data 2</td>
          </tr>
        </tbody>
      </table>
    `;
    execEditorCommand('insertHTML', tableHtml);
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
    execEditorCommand('insertHTML', logoHtml);
  };

  const insertSignature = () => {
    let sigUrl = "https://placehold.co/100x40?text=Signature";
    const sigHtml = `<img src="${sigUrl}" alt="HR Signature" style="height: 36px; max-height: 36px; display: block; margin: 12px 0;" />`;
    execEditorCommand('insertHTML', sigHtml);
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

      // Fetch warning counts for each employee
      const employeesWithWarningCount = await Promise.all(
        mapped.map(async (emp) => {
          try {
            const warningRes = await axios.get(`http://localhost:5000/api/employees/${emp.id}/warning-letters`, { headers });
            return {
              ...emp,
              warningCount: warningRes.data.warning_letters?.length || 0
            };
          } catch (e) {
            return { ...emp, warningCount: 0 };
          }
        })
      );

      setEmployees(employeesWithWarningCount);
      setDepartments(deptRes.data.departments || deptRes.data || []);

      // Sync active drawer employee count/data if open
      if (drawerEmployee) {
        const updated = employeesWithWarningCount.find((e) => e.id === drawerEmployee.id);
        if (updated) {
          setDrawerEmployee(updated);
          fetchWarningHistory(updated.id);
        }
      }
    } catch (err) {
      console.error("Error fetching warning letter data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarningHistory = async (empId) => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/employees/${empId}/warning-letters`, { headers });
      setWarningHistory(res.data.warning_letters || []);
    } catch (err) {
      console.error("Error fetching warning history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueWarning = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert("Please fill in both Subject and Description fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/employees/${modalEmployee.id}/warning-letter`,
        { subject: subject.trim(), description: description.trim() },
        { headers }
      );
      if (res.data.success) {
        alert(res.data.message || "Warning letter sent and recorded successfully!");
        setSubject("");
        setDescription("");
        setModalEmployee(null);
        fetchData();
      }
    } catch (err) {
      console.error("Error issuing warning letter:", err);
      alert(err.response?.data?.message || "Failed to issue warning letter.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenHistory = (emp) => {
    setDrawerEmployee(emp);
    fetchWarningHistory(emp.id);
  };

  const handleDownloadPdf = async (letterId, empName) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/employees/warning-letter/${letterId}/download`,
        { headers, responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Warning_Letter_${empName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Failed to download warning letter PDF:", err);
      alert("Failed to download PDF. Please try again.");
    }
  };

  // Stats calculation
  const totalWorkforce = employees.length;
  const employeesWithWarnings = employees.filter((e) => e.warningCount > 0).length;
  const totalWarningsIssued = employees.reduce((acc, curr) => acc + (curr.warningCount || 0), 0);

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
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center shadow-sm">
              <AlertTriangle size={20} className="text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Warning Letter Management</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Issue official written warnings and notify employees directly via email</p>
            </div>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-350 bg-white text-slate-700 rounded-xl text-xs font-black shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

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
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100 shrink-0 shadow-sm">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Employees Warned</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{employeesWithWarnings}</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shrink-0 shadow-sm">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Total Warnings Issued</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalWarningsIssued}</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search by Employee ID, Name, or Email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-slate-100 focus:border-slate-200 outline-none rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 transition" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="bg-[#f8fafc] border border-slate-100 focus:border-slate-200 outline-none px-4 py-2.5 rounded-xl text-xs font-bold text-slate-650 cursor-pointer">
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
            </select>
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
                  <th className="py-4.5 px-6">Warning Status</th>
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
                        {emp.warningCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">
                            {emp.warningCount} {emp.warningCount === 1 ? "Warning" : "Warnings"} Issued
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                            Clean Record
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right min-w-[240px]">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button onClick={() => handleOpenHistory(emp)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-black shadow-sm border border-slate-200 transition cursor-pointer">
                            <Eye size={13} />
                            History
                          </button>
                          <button onClick={() => setModalEmployee(emp)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-sm transition active:scale-95 duration-150 cursor-pointer">
                            <Send size={13} />
                            Issue Warning
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

        {/* Modal: Issue Warning Letter */}
        {modalEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-rose-900 px-6 py-4 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Issue Disciplinary Warning</h3>
                  <p className="text-[10px] text-rose-155 font-bold mt-0.5">Send a formal written warning to {modalEmployee.name}</p>
                </div>
                <button onClick={() => setModalEmployee(null)} className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleIssueWarning} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">
                      Warning Subject / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Unprofessional Conduct / Repeated Attendance Violation"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-350 outline-none rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1.5">
                      Reason & Description (Draft Official Warning Letter)
                    </label>

                    {/* MS Word style WYSIWYG Toolbar */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:border-slate-350 transition flex flex-col">
                      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 select-none">

                        {/* Text Style buttons */}
                        <button
                          type="button"
                          onClick={() => execEditorCommand("bold")}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                          title="Bold"
                        >
                          <Bold size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => execEditorCommand("italic")}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                          title="Italic"
                        >
                          <Italic size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => execEditorCommand("underline")}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                          title="Underline"
                        >
                          <Underline size={13} />
                        </button>

                        <div className="h-4.5 w-px bg-slate-200 mx-1"></div>

                        {/* Lists */}
                        <button
                          type="button"
                          onClick={() => execEditorCommand("insertUnorderedList")}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                          title="Bullet List"
                        >
                          <List size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => execEditorCommand("insertOrderedList")}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                          title="Numbered List"
                        >
                          <ListOrdered size={13} />
                        </button>

                        <div className="h-4.5 w-px bg-slate-200 mx-1"></div>

                        {/* Alignments */}
                        <button
                          type="button"
                          onClick={() => execEditorCommand("justifyLeft")}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                          title="Align Left"
                        >
                          <AlignLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => execEditorCommand("justifyCenter")}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                          title="Align Center"
                        >
                          <AlignCenter size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => execEditorCommand("justifyRight")}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                          title="Align Right"
                        >
                          <AlignRight size={13} />
                        </button>

                        <div className="h-4.5 w-px bg-slate-200 mx-1"></div>

                        {/* Font Family */}
                        <select
                          onChange={(e) => execEditorCommand("fontName", e.target.value)}
                          className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-black text-slate-600 focus:outline-none cursor-pointer"
                          title="Font Family"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>

                        {/* Font Size */}
                        <select
                          onChange={(e) => execEditorCommand("fontSize", e.target.value)}
                          className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-black text-slate-600 focus:outline-none cursor-pointer"
                          title="Font Size"
                        >
                          <option value="3">Normal</option>
                          <option value="1">Small</option>
                          <option value="2">Medium</option>
                          <option value="4">Large</option>
                          <option value="5">X-Large</option>
                          <option value="6">XX-Large</option>
                        </select>

                        <div className="h-4.5 w-px bg-slate-200 mx-1"></div>

                        {/* Highlight color selector */}
                        <button
                          type="button"
                          onClick={() => execEditorCommand("hiliteColor", "yellow")}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition flex items-center justify-center"
                          title="Highlight Text (Yellow)"
                        >
                          <span className="font-extrabold text-[10px] bg-yellow-250 px-1 rounded text-slate-900 border border-yellow-350">A</span>
                        </button>

                        <div className="h-4.5 w-px bg-slate-200 mx-1"></div>

                        {/* Insert Custom Items */}
                        <button
                          type="button"
                          onClick={insertTable}
                          className="p-1 px-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 rounded-md text-[10px] font-black transition flex items-center gap-1"
                          title="Insert Table"
                        >
                          <Grid size={11} />
                          Table
                        </button>

                        <button
                          type="button"
                          onClick={insertLogo}
                          className="p-1 px-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 rounded-md text-[10px] font-black transition flex items-center gap-1"
                          title="Insert Company Logo"
                        >
                          <Image size={11} />
                          Logo
                        </button>

                        <button
                          type="button"
                          onClick={insertSignature}
                          className="p-1 px-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 rounded-md text-[10px] font-black transition flex items-center gap-1"
                          title="Insert Signature"
                        >
                          <PenTool size={11} />
                          Sign
                        </button>

                      </div>

                      {/* Word Editor content field */}
                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorInput}
                        style={{ minHeight: "220px", maxHeight: "320px", overflowY: "auto" }}
                        className="p-4 outline-none text-xs font-bold text-slate-700 bg-white focus:bg-white transition leading-relaxed prose prose-slate max-w-none"
                      />
                    </div>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-xl flex items-start gap-2.5 text-[10px] font-semibold text-rose-700 leading-relaxed">
                    <AlertTriangle size={16} className="shrink-0 text-rose-500 mt-0.5" />
                    <div>
                      This warning notification will be immediately dispatched as a formally signed email to <strong>{modalEmployee.email}</strong>.
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
                  <button type="button" onClick={() => setModalEmployee(null)} className="px-4 py-2 border border-slate-250 text-slate-750 font-bold rounded-xl text-xs hover:bg-slate-50 bg-white transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex items-center justify-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md transition disabled:opacity-50">
                    <Send size={13} />
                    {submitting ? "Sending..." : "Issue Warning"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drawer: Warning History */}
        <div className={`fixed inset-0 z-50 w-screen h-screen bg-slate-100 flex flex-col transition-transform duration-300 ease-out transform ${drawerEmployee ? "translate-x-0" : "translate-x-full"}`}>
          {drawerEmployee && (
            <div className="flex flex-col h-full overflow-hidden bg-slate-50">
              <div className="px-8 py-5.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center shrink-0 text-rose-600">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm">{drawerEmployee.name} — Disciplinary Warning History</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      ID: {formatEmployeeId(drawerEmployee.company_name, drawerEmployee.company_employee_id, drawerEmployee.id)} · {drawerEmployee.designation_title || "Associate"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setDrawerEmployee(null)} className="flex items-center justify-center gap-1 px-4 py-2 border border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-slate-650 hover:text-slate-800 rounded-xl text-xs font-black shadow-sm transition cursor-pointer">
                  <X size={15} />
                  Close Profile
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-450">Warnings History Stack ({warningHistory.length})</h4>
                  <button onClick={() => setModalEmployee(drawerEmployee)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-sm transition cursor-pointer">
                    <Send size={13} />
                    Issue New Warning
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-12 font-bold text-slate-400 text-xs animate-pulse">Fetching warning files...</div>
                ) : warningHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-200 shrink-0 mb-4 shadow-inner">
                      <CheckCircle size={28} />
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Perfect Disciplinary Record</h4>
                    <p className="text-xs text-slate-500 font-bold max-w-[300px] mt-1.5 leading-relaxed">
                      This employee has not received any formal written warning letters. No warnings have been issued.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {warningHistory.map((item) => {
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
