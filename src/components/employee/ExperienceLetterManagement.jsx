import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  Search, RefreshCw, FileText, Users, CheckCircle, Clock,
  Building, Briefcase, Calendar, X, Eye, AlertCircle, Download, Award
} from "lucide-react";
import { formatEmployeeId } from "../../utils/format";
import { getEmployeeAvatarSrc } from "../../utils/companyLogo";

const EMPLOYEE_API = "http://localhost:5000/api/employees";
const DEPARTMENT_API = "http://localhost:5000/api/departments";

export default function ExperienceLetterManagement() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [drawerEmployee, setDrawerEmployee] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(false);

  // Effect to generate/fetch HTML for the clean inline viewer
  useEffect(() => {
    if (drawerEmployee && drawerEmployee.experience_letter) {
      setLoadingHtml(true);
      axios.get(`http://localhost:5000/api/employees/${drawerEmployee.id}/view-experience-letter`, { headers })
        .then(res => {
          setHtmlContent(res.data.html || "");
        })
        .catch(err => {
          console.error("Error fetching experience letter HTML:", err);
          // Fallback parsing
          setHtmlContent(decodeDataUrl(drawerEmployee.experience_letter));
        })
        .finally(() => {
          setLoadingHtml(false);
        });
    } else {
      setHtmlContent("");
    }
  }, [drawerEmployee]);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const decodeDataUrl = (dataUrl) => {
    if (!dataUrl) return "";
    if (dataUrl.startsWith("data:")) {
      const base64 = dataUrl.split(",")[1];
      try { return atob(base64); }
      catch (e) { console.error("Failed to decode base64 data URL", e); return ""; }
    }
    return dataUrl;
  };

  const downloadFile = async (dataUrl, baseName, employeeId = null) => {
    if (!dataUrl) return;
    if (employeeId) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/employees/${employeeId}/download-experience-letter`,
          { headers, responseType: "blob" }
        );
        const blob = new Blob([response.data], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${baseName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        return;
      } catch (err) {
        console.error("Failed to download experience letter PDF", err);
      }
    }
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = baseName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      setEmployees(mapped);
      setDepartments(deptRes.data.departments || deptRes.data || []);
      if (drawerEmployee) {
        const updated = mapped.find((e) => e.id === drawerEmployee.id);
        if (updated) setDrawerEmployee(updated);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  // Removed PDF preview logic; using HTML content directly

  const handleGenerate = async (empId) => {
    setGeneratingId(empId);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/employees/${empId}/generate-experience-letter`,
        {}, { headers }
      );
      if (res.data.success) {
        // Fetch updated employee data directly
        const empRes = await axios.get(`http://localhost:5000/api/employees/${empId}`, { headers });
        const updatedEmployee = empRes.data.employee || empRes.data;
        updatedEmployee.name = updatedEmployee.name || `${updatedEmployee.first_name || ""} ${updatedEmployee.last_name || ""}`.trim();
        // Update employee list
        setEmployees(prev => prev.map(e => (e.id === empId ? updatedEmployee : e)));
        // Update drawer if open for this employee
        if (drawerEmployee && drawerEmployee.id === empId) {
          setDrawerEmployee(updatedEmployee);
        }
        alert(res.data.message || "Experience letter generated successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate experience letter.");
    } finally {
      setGeneratingId(null);
    }
  };

  const totalEmployees = employees.length;
  const generatedCount = employees.filter((e) => e.experience_letter).length;
  const pendingCount = totalEmployees - generatedCount;

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(search.toLowerCase())) ||
      (emp.company_employee_id && String(emp.company_employee_id).includes(search));
    const matchDept = !selectedDepartment || String(emp.department_id) === String(selectedDepartment);
    const hasDoc = !!emp.experience_letter;
    const matchStatus = !selectedStatus || (selectedStatus === "generated" && hasDoc) || (selectedStatus === "pending" && !hasDoc);
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto p-2 relative">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center shadow-sm">
              <Award size={20} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Experience Letter Management</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Generate and manage official experience certificates</p>
            </div>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-350 bg-white text-slate-700 rounded-xl text-xs font-black shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>



        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Workforce", value: totalEmployees, Icon: Users, color: "teal" },
            { label: "Certificates Issued", value: generatedCount, Icon: CheckCircle, color: "emerald" },
            { label: "Pending Action", value: pendingCount, Icon: Clock, color: "amber" }
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-xl flex items-center justify-center border border-${color}-100 shrink-0 shadow-sm`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{value}</h3>
              </div>
            </div>
          ))}
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
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-[#f8fafc] border border-slate-100 focus:border-slate-200 outline-none px-4 py-2.5 rounded-xl text-xs font-bold text-slate-650 cursor-pointer">
              <option value="">All Statuses</option>
              <option value="generated">Generated</option>
              <option value="pending">Pending</option>
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
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-650">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-10 font-bold text-slate-400">Loading directory records...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 font-bold text-slate-400">No matching employee records found</td></tr>
                ) : filtered.map((emp) => {
                  const hasDoc = !!emp.experience_letter;
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
                        {hasDoc ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-teal-50 text-teal-600 border border-teal-100 uppercase tracking-wider">Generated</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-400 border border-slate-200 uppercase tracking-wider">Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasDoc && (
                            <button onClick={() => setDrawerEmployee(emp)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-black shadow-sm transition border border-teal-100 cursor-pointer">
                              <Eye size={13} />View
                            </button>
                          )}
                          <button onClick={() => handleGenerate(emp.id)} disabled={generatingId !== null} className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-black shadow-sm transition active:scale-95 duration-150 cursor-pointer ${hasDoc ? "bg-white border-slate-200 hover:border-slate-350 text-slate-700" : "bg-teal-600 hover:bg-teal-700 text-white border-transparent"}`}>
                            <FileText size={13} />
                            {generatingId === emp.id ? <span className="animate-pulse">Loading...</span> : hasDoc ? "Regenerate" : "Generate"}
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

        {/* Slide-out Preview Drawer */}
        <div className={`fixed inset-0 z-50 w-screen h-screen bg-slate-100 flex flex-col transition-transform duration-300 ease-out transform ${drawerEmployee ? "translate-x-0" : "translate-x-full"}`}>
          {drawerEmployee && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-8 py-4.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center shrink-0 text-teal-600"><Award size={18} /></div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm">{drawerEmployee.name} — Experience Certificate</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      ID: {formatEmployeeId(drawerEmployee.company_name, drawerEmployee.company_employee_id, drawerEmployee.id)} · {drawerEmployee.designation_title || "Associate"} · {drawerEmployee.department_name || "Staff"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleGenerate(drawerEmployee.id)} disabled={generatingId !== null} className={`flex items-center justify-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-black shadow-sm transition active:scale-95 duration-150 cursor-pointer ${drawerEmployee.experience_letter ? "bg-white border-slate-250 hover:border-slate-400 text-slate-700" : "bg-teal-600 hover:bg-teal-700 text-white border-transparent"}`}>
                    <FileText size={13} />
                    {generatingId === drawerEmployee.id ? <span className="animate-pulse">Loading...</span> : drawerEmployee.experience_letter ? "Regenerate" : "Generate"}
                  </button>
                  {drawerEmployee.experience_letter && (
                    <button onClick={() => downloadFile(drawerEmployee.experience_letter, `Experience_Letter_${drawerEmployee.name.replace(/\s+/g, "_")}`, drawerEmployee.id)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white border border-transparent rounded-xl text-xs font-black shadow-sm transition active:scale-95 duration-150 cursor-pointer">
                      <Download size={13} />Download
                    </button>
                  )}
                  <span className="w-px h-6 bg-slate-200 mx-1" />
                  <button onClick={() => setDrawerEmployee(null)} className="flex items-center justify-center gap-1 px-3 py-2 border border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-slate-650 hover:text-slate-800 rounded-xl text-xs font-black shadow-sm transition cursor-pointer">
                    <X size={15} />Close
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-500/10 p-6 overflow-y-auto flex justify-center">
                {drawerEmployee.experience_letter ? (
                  loadingHtml ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md h-64 text-center">
                      <span className="animate-pulse font-extrabold text-slate-500 text-xs">Loading Certificate Layout...</span>
                    </div>
                  ) : (
                    <iframe srcDoc={htmlContent} title={`Experience Letter - ${drawerEmployee.name}`} className="w-full max-w-[850px] h-full border border-slate-250 rounded-2xl shadow-2xl bg-white" />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md max-h-[360px] m-auto text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-200 shrink-0 mb-4 shadow-inner"><AlertCircle size={28} /></div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Certificate Missing</h4>
                    <p className="text-xs text-slate-400 font-bold max-w-[260px] mt-1.5 mb-6 leading-relaxed">No experience certificate has been generated for this employee yet.</p>
                    <button onClick={() => handleGenerate(drawerEmployee.id)} disabled={generatingId !== null} className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md transition disabled:opacity-50">
                      <FileText size={14} />{generatingId === drawerEmployee.id ? "Generating..." : "Generate Certificate"}
                    </button>
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




