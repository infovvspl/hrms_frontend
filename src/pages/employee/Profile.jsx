import { useEffect, useState } from "react";
import axios from "axios";
import { User, Building2, IdCard, FileText, Loader2, Camera, Phone, X } from "lucide-react";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";
import { getEmployeeAvatarSrc } from "../../utils/companyLogo";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Tab control state: 'corporate', 'contact', 'government', 'attachments'
  const [activeTab, setActiveTab] = useState("corporate");
  const [previewType, setPreviewType] = useState(null); // 'offer', 'experience', 'relieving'
  const [isEditing, setIsEditing] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [loadingPayslips, setLoadingPayslips] = useState(false);
  const [previewPayslip, setPreviewPayslip] = useState(null);
  const [editData, setEditData] = useState({});
  const [htmlContent, setHtmlContent] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(false);

  const token = localStorage.getItem("token");
  const employeeId = localStorage.getItem("employee_id");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    Promise.resolve().then(() => {
      if (!previewType || !employeeId) {
        setHtmlContent("");
        return;
      }

      setLoadingHtml(true);
      let endpoint = "";
      if (previewType === "offer") {
        endpoint = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/employees/${employeeId}/view-offer-letter`;
      } else if (previewType === "experience") {
        endpoint = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/employees/${employeeId}/view-experience-letter`;
      } else if (previewType === "relieving") {
        endpoint = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/employees/${employeeId}/view-relieving-letter`;
      }

      if (endpoint) {
        axios.get(endpoint, { headers })
          .then(res => {
            setHtmlContent(res.data.html || "");
          })
          .catch(err => {
            console.error(`Error fetching ${previewType} HTML:`, err);
            setHtmlContent("");
          })
          .finally(() => {
            setLoadingHtml(false);
          });
      } else {
        setHtmlContent("");
        setLoadingHtml(false);
      }
    });
  }, [previewType, employeeId]);

  const downloadFile = async (dataUrl, baseName, employeeId = null, docType = "offer") => {
    if (!dataUrl) return;

    if (employeeId) {
      try {
        let endpoint = `http://localhost:5000/api/employees/${employeeId}/download-offer-letter`;
        if (docType === "experience") {
          endpoint = `http://localhost:5000/api/employees/${employeeId}/download-experience-letter`;
        } else if (docType === "relieving") {
          endpoint = `http://localhost:5000/api/employees/${employeeId}/download-relieving-letter`;
        }

        const response = await axios.get(
          endpoint,
          {
            headers,
            responseType: "blob"
          }
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
      } catch (error) {
        console.error(`Failed to download ${docType} letter PDF from backend, falling back to local HTML render`, error);
      }
    }

    // Direct download fallback
    let href = dataUrl;
    let extension = "pdf";

    if (dataUrl.startsWith("data:")) {
      const mime = dataUrl.split(";")[0].split(":")[1];
      if (mime === "image/png") extension = "png";
      else if (mime === "image/jpeg" || mime === "image/jpg") extension = "jpg";
      else if (mime === "text/html") extension = "html";
    } else if (dataUrl.startsWith("uploads/") || dataUrl.startsWith("/uploads/")) {
      const cleanPath = dataUrl.startsWith("/") ? dataUrl.substring(1) : dataUrl;
      href = `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/${cleanPath}`;
      extension = "pdf";
    } else if (dataUrl.startsWith("JVBER")) {
      href = `data:application/pdf;base64,${dataUrl}`;
      extension = "pdf";
    } else {
      const parts = dataUrl.split(".");
      if (parts.length > 1) {
        extension = parts.pop().split("?")[0];
      }
    }

    const link = document.createElement("a");
    link.href = href;
    link.download = `${baseName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEditing = () => {
    setEditData({
      mobile: profile?.mobile || "",
      email: profile?.email || "",
      dob: profile?.dob ? profile.dob.substring(0, 10) : "",
      gender: profile?.gender || "",
      marital_status: profile?.marital_status || "",
      area_of_expertise: profile?.area_of_expertise || "",

      present_address1: profile?.present_address1 || "",
      present_address2: profile?.present_address2 || "",
      present_city: profile?.present_city || "",
      present_state: profile?.present_state || "",
      present_pincode: profile?.present_pincode || "",
      present_country: profile?.present_country || "India",

      permanent_address1: profile?.permanent_address1 || "",
      permanent_address2: profile?.permanent_address2 || "",
      permanent_city: profile?.permanent_city || "",
      permanent_state: profile?.permanent_state || "",
      permanent_pincode: profile?.permanent_pincode || "",
      permanent_country: profile?.permanent_country || "India",

      aadhaar_number: profile?.aadhaar_number || "",
      pan_number: profile?.pan_number || "",
      uan_number: profile?.uan_number || "",
      passport_number: profile?.passport_number || "",
      voter_id: profile?.voter_id || "",
      emergency_contact_name: profile?.emergency_contact_name || "",
      emergency_contact_relation: profile?.emergency_contact_relation || "",
      emergency_contact_phone: profile?.emergency_contact_phone || "",
    });
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/employees/${employeeId}`,
        editData,
        { headers }
      );

      const updatedEmployee = res.data.employee || res.data || {};
      setProfile(updatedEmployee);
      localStorage.setItem("employee", JSON.stringify(updatedEmployee));
      window.dispatchEvent(new Event("employee-avatar-updated"));
      setIsEditing(false);
      alert("Personal details updated successfully!");
    } catch (err) {
      console.error("Failed to update profile details:", err);
      alert(err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!employeeId) {
        setError("Employee ID not found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/employees/${employeeId}`,
          { headers }
        );
        const employeeData = res.data.employee || res.data || null;

        if (employeeData) {
          localStorage.setItem("employee", JSON.stringify(employeeData));
          window.dispatchEvent(new Event("employee-avatar-updated"));
        }

        setProfile(employeeData);
      } catch (err) {
        console.error("Error fetching employee profile:", err);
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [employeeId]);

  useEffect(() => {
    const fetchPayslips = async () => {
      if (activeTab !== "payslips" || !employeeId) return;
      try {
        setLoadingPayslips(true);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/payroll/my-payslips`,
          { headers }
        );
        setPayslips(res.data.payslips || []);
      } catch (err) {
        console.error("Error fetching employee payslips ledger:", err);
      } finally {
        setLoadingPayslips(false);
      }
    };
    fetchPayslips();
  }, [activeTab, employeeId]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/employees/${employeeId}`,
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedEmployee = res.data.employee || res.data || {};
      const newImage = updatedEmployee.image;

      setProfile(prev => prev ? { ...prev, image: newImage } : null);
      localStorage.setItem("employee", JSON.stringify(updatedEmployee));
      window.dispatchEvent(new Event("employee-avatar-updated"));
      alert("Profile picture updated successfully");
    } catch (err) {
      console.error("Failed to upload profile photo to server:", err);
      alert(err.response?.data?.message || "Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-6xl mx-auto py-4 space-y-6 select-none">

        {loading && (
          <div className="flex flex-col justify-center items-center py-32 bg-white border border-slate-200 rounded-2xl shadow-sm gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={28} />
            <span className="text-xs font-bold text-slate-400">Retrieving employee file details...</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {profile && !loading && (
          <div className="space-y-6">

            {/* ================= HIGH-FIDELITY TOP PROFILE BANNER (Full Width) ================= */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-5">
                {/* Photo Upload Container */}
                <div
                  onClick={() => !uploading && document.getElementById("avatar-upload-input")?.click()}
                  className="w-24 h-24 rounded-full bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 shadow-sm overflow-hidden relative group cursor-pointer transition-all duration-300 shrink-0"
                  title="Click to change photo"
                >
                  {uploading ? (
                    <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white gap-1">
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span className="text-[7.5px] font-black uppercase tracking-wider">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      {profile.image ? (
                        <img src={getEmployeeAvatarSrc(profile.image)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} className="opacity-80 text-slate-400 absolute inset-0 m-auto" />
                      )}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white gap-0.5 transition-opacity duration-300">
                        <Camera size={13} />
                        <span className="text-[7.5px] font-black uppercase tracking-wider">Change photo</span>
                      </div>
                    </>
                  )}
                </div>

                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* Profile Details text */}
                <div className="text-center md:text-left space-y-1">
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">
                    {profile.first_name} {profile.middle_name ? `${profile.middle_name} ` : ""}{profile.last_name}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-full">
                      {profile.designation_title || "Software Engineer"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      #{profile.company_employee_id || profile.id}
                    </span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-bold">
                      {profile.employment_status || "Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Joining Tenure Dashboard Blocks */}
              <div className="flex gap-4 md:border-l md:border-slate-200 md:pl-6 shrink-0 w-full md:w-auto justify-around md:justify-start">
                <div className="text-center md:text-left">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Joined Date</span>
                  <span className="text-xs text-indigo-655 font-extrabold mt-0.5 block">
                    {profile.doj ? new Date(profile.doj).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Company Tenure</span>
                  <span className="text-xs text-indigo-655 text-indigo-600 font-extrabold mt-0.5 block">
                    {profile.current_experience || 0} Years Service
                  </span>
                </div>
              </div>
            </div>

            {/* ================= HORIZONTAL TABS NAVIGATION BAR ================= */}
            <div className="bg-white border border-slate-200 rounded-2xl p-1 pb-0 shadow-sm">
              <div className="flex items-center overflow-x-auto scrollbar-none">
                {[
                  { id: "corporate", label: "Corporate & Shift", icon: Building2, color: "border-indigo-600 text-indigo-600" },
                  { id: "contact", label: "Contact & Emergency", icon: User, color: "border-emerald-600 text-emerald-650" },
                  { id: "government", label: "Government IDs", icon: IdCard, color: "border-amber-600 text-amber-655" },
                  { id: "attachments", label: "Attachment Files", icon: FileText, color: "border-rose-600 text-rose-650" }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsEditing(false);
                      }}
                      className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-bold text-xs transition cursor-pointer shrink-0 ${
                        isActive
                          ? `${item.color} font-extrabold`
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Icon size={14} className={isActive ? "" : "text-slate-400"} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================= WORKSPACE PANEL (Detailed content cards) ================= */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm min-h-[360px]">

              {/* ─── TAB 1: CORPORATE & SHIFT ─── */}
              {activeTab === "corporate" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-2.5 border-l-2 border-indigo-600 leading-none">Corporate & Shift Details</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1.5 pl-2.5">Your official position, workplace location and managers</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Official Department</p>
                      <p className="text-slate-800 font-extrabold text-xs mt-1">{profile.department_name || "N/A"}</p>
                    </div>
                    <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Employment Designation</p>
                      <p className="text-slate-800 font-extrabold text-xs mt-1">{profile.designation_title || "N/A"}</p>
                    </div>
                    <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Office Branch Location</p>
                      <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.branch_name || "N/A"}</p>
                    </div>
                    <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Assigned Timing Shift</p>
                      <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.shift_name || "General Shift"}</p>
                    </div>
                    <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl sm:col-span-2 text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">System Access Role</p>
                      <p className="text-indigo-650 font-extrabold text-xs mt-1">{profile.role_name || "Employee"}</p>
                    </div>
                  </div>

                  {/* Manager hierarchy element */}
                  <div className="pt-4 space-y-3">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Reporting Hierarchy</p>
                    <div className="flex items-center justify-between gap-4 bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl hover:scale-[1.01] hover:shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-indigo-200">
                          {profile.reporting_manager_name ? profile.reporting_manager_name.split(" ").map(w => w[0]).join("").toUpperCase() : "RM"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Direct Manager</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{profile.reporting_manager_name || "N/A"}</p>
                        </div>
                      </div>
                      <a href={`mailto:${profile.reporting_manager_email || "manager@company.com"}`} className="px-3.5 py-1.5 bg-white border border-slate-205 hover:border-indigo-300 rounded-lg text-slate-700 hover:text-indigo-650 hover:bg-indigo-50/15 font-bold text-[10px] transition cursor-pointer">
                        Send Email
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: CONTACT & EMERGENCY ─── */}
              {activeTab === "contact" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-2.5 border-l-2 border-indigo-600 leading-none">Contact & Emergency Details</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1.5 pl-2.5">Your personal contact numbers, registered address and emergency files</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={startEditing}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition active:scale-95 cursor-pointer shrink-0"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-6 text-xs text-left">
                      {/* Grid for basic contact details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</label>
                          <input
                            type="text"
                            value={editData.mobile}
                            onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Personal Email</label>
                          <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-808 text-slate-800 transition duration-205"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</label>
                          <input
                            type="date"
                            value={editData.dob}
                            onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender</label>
                          <select
                            value={editData.gender}
                            onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marital Status</label>
                          <select
                            value={editData.marital_status}
                            onChange={(e) => setEditData({ ...editData, marital_status: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                          >
                            <option value="">Select Marital Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Area of Expertise</label>
                          <input
                            type="text"
                            value={editData.area_of_expertise}
                            onChange={(e) => setEditData({ ...editData, area_of_expertise: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-808 text-slate-800 transition duration-205"
                          />
                        </div>
                      </div>

                      {/* Address editing sections */}
                      <div className="border-t border-slate-100 pt-5 space-y-4">
                        <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Addresses</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Present Address */}
                          <div className="space-y-3">
                            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Present Address</p>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Address Line 1"
                                value={editData.present_address1}
                                onChange={(e) => setEditData({ ...editData, present_address1: e.target.value })}
                                className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                              />
                              <input
                                type="text"
                                placeholder="Address Line 2"
                                value={editData.present_address2}
                                onChange={(e) => setEditData({ ...editData, present_address2: e.target.value })}
                                className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-805 text-slate-800 transition duration-205"
                              />
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="City"
                                  value={editData.present_city}
                                  onChange={(e) => setEditData({ ...editData, present_city: e.target.value })}
                                  className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-805 text-slate-800 transition duration-205"
                                />
                                <input
                                  type="text"
                                  placeholder="State"
                                  value={editData.present_state}
                                  onChange={(e) => setEditData({ ...editData, present_state: e.target.value })}
                                  className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-808 text-slate-800 transition duration-205"
                                />
                                <input
                                  type="text"
                                  placeholder="Pincode"
                                  value={editData.present_pincode}
                                  onChange={(e) => setEditData({ ...editData, present_pincode: e.target.value })}
                                  className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-808 text-slate-800 transition duration-205"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Permanent Address */}
                          <div className="space-y-3">
                            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Permanent Address</p>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Address Line 1"
                                value={editData.permanent_address1}
                                onChange={(e) => setEditData({ ...editData, permanent_address1: e.target.value })}
                                className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                              />
                              <input
                                type="text"
                                placeholder="Address Line 2"
                                value={editData.permanent_address2}
                                onChange={(e) => setEditData({ ...editData, permanent_address2: e.target.value })}
                                className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-805 text-slate-800 transition duration-205"
                              />
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="City"
                                  value={editData.permanent_city}
                                  onChange={(e) => setEditData({ ...editData, permanent_city: e.target.value })}
                                  className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-808 text-slate-800 transition duration-205"
                                />
                                <input
                                  type="text"
                                  placeholder="State"
                                  value={editData.permanent_state}
                                  onChange={(e) => setEditData({ ...editData, permanent_state: e.target.value })}
                                  className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-808 text-slate-800 transition duration-205"
                                />
                                <input
                                  type="text"
                                  placeholder="Pincode"
                                  value={editData.permanent_pincode}
                                  onChange={(e) => setEditData({ ...editData, permanent_pincode: e.target.value })}
                                  className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-808 text-slate-800 transition duration-205"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact Edit Mode */}
                      <div className="border-t border-slate-100 pt-6 space-y-3">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Emergency Contact Point</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border-2 border-slate-200">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Person</label>
                            <input
                              type="text"
                              value={editData.emergency_contact_name}
                              onChange={(e) => setEditData({ ...editData, emergency_contact_name: e.target.value })}
                              className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Relationship</label>
                            <input
                              type="text"
                              value={editData.emergency_contact_relation}
                              onChange={(e) => setEditData({ ...editData, emergency_contact_relation: e.target.value })}
                              className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Emergency Phone</label>
                            <input
                              type="text"
                              value={editData.emergency_contact_phone}
                              onChange={(e) => setEditData({ ...editData, emergency_contact_phone: e.target.value })}
                              className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-808 text-slate-800 transition duration-205"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Edit control buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-5 py-2.5 border border-slate-200 hover:border-slate-350 bg-white rounded-xl text-slate-700 font-bold shadow-sm transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveChanges}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 transition active:scale-95 cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mobile Number</p>
                          <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.mobile || "N/A"}</p>
                        </div>
                        <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Personal Email</p>
                          <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1 truncate">{profile.email || "N/A"}</p>
                        </div>
                        <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Date of Birth</p>
                          <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">
                            {profile.dob ? new Date(profile.dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                          </p>
                        </div>
                        <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Gender</p>
                          <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.gender || "N/A"}</p>
                        </div>
                        <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Marital Status</p>
                          <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.marital_status || "N/A"}</p>
                        </div>
                        <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Area of Expertise</p>
                          <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.area_of_expertise || "N/A"}</p>
                        </div>
                      </div>

                      {/* Address Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                        <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-5 rounded-2xl space-y-1.5 text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Present Address</p>
                          <p className="text-xs text-slate-700 leading-normal font-semibold">
                            {profile.present_address1}
                            {profile.present_address2 ? `, ${profile.present_address2}` : ""}
                            {profile.present_city ? `, ${profile.present_city}` : ""}
                            {profile.present_state ? `, ${profile.present_state}` : ""}
                            {profile.present_pincode ? ` - ${profile.present_pincode}` : ""}
                          </p>
                        </div>
                        <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-5 rounded-2xl space-y-1.5 text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Permanent Address</p>
                          <p className="text-xs text-slate-700 leading-normal font-semibold">
                            {profile.permanent_address1}
                            {profile.permanent_address2 ? `, ${profile.permanent_address2}` : ""}
                            {profile.permanent_city ? `, ${profile.permanent_city}` : ""}
                            {profile.permanent_state ? `, ${profile.permanent_state}` : ""}
                            {profile.permanent_pincode ? ` - ${profile.permanent_pincode}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Emergency card */}
                      <div className="border-t border-slate-100 pt-6 space-y-3">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Emergency Contact Point</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-5 rounded-2xl hover:scale-[1.01] hover:shadow-sm">
                          <div>
                            <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Contact Person</p>
                            <p className="text-xs font-black text-slate-800 mt-1">{profile.emergency_contact_name || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Relationship</p>
                            <p className="text-xs font-black text-slate-800 mt-1">{profile.emergency_contact_relation || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Emergency Phone</p>
                            <p className="text-xs font-black text-indigo-650 mt-1 flex items-center gap-1.5">
                              <Phone size={11} className="text-indigo-500 animate-pulse" /> {profile.emergency_contact_phone || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                    </>
                  )}
                </div>
              )}

              {/* ─── TAB 3: GOVERNMENT IDS ─── */}
              {activeTab === "government" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-2.5 border-l-2 border-indigo-600 leading-none">Government Identifications</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1.5 pl-2.5">Your official tax, identity, and registry record numbers</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={startEditing}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition active:scale-95 cursor-pointer shrink-0"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-6 text-xs text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aadhaar Card Number</label>
                          <input
                            type="text"
                            maxLength={12}
                            value={editData.aadhaar_number}
                            onChange={(e) => setEditData({ ...editData, aadhaar_number: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PAN Card Number</label>
                          <input
                            type="text"
                            maxLength={10}
                            value={editData.pan_number}
                            onChange={(e) => setEditData({ ...editData, pan_number: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">UAN Provident Fund No.</label>
                          <input
                            type="text"
                            value={editData.uan_number}
                            onChange={(e) => setEditData({ ...editData, uan_number: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Passport Number</label>
                          <input
                            type="text"
                            value={editData.passport_number}
                            onChange={(e) => setEditData({ ...editData, passport_number: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Voter Card ID Number</label>
                          <input
                            type="text"
                            value={editData.voter_id}
                            onChange={(e) => setEditData({ ...editData, voter_id: e.target.value })}
                            className="w-full border-2 border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-white focus:bg-white rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-semibold text-slate-800 transition duration-205"
                          />
                        </div>
                      </div>

                      {/* Edit control buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-5 py-2.5 border border-slate-205 hover:border-slate-350 bg-white rounded-xl text-slate-700 font-bold shadow-sm transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveChanges}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 transition active:scale-95 cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Aadhaar Card Number</p>
                        <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.aadhaar_number || "N/A"}</p>
                      </div>
                      <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">PAN Card Number</p>
                        <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.pan_number || "N/A"}</p>
                      </div>
                      <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">UAN Provident Fund No.</p>
                        <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.uan_number || "N/A"}</p>
                      </div>
                      <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Passport Number</p>
                        <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.passport_number || "N/A"}</p>
                      </div>
                      <div className="bg-[#f8fafc] border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 p-4.5 rounded-2xl sm:col-span-2 text-left cursor-default hover:scale-[1.01] hover:shadow-sm">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Voter Card ID Number</p>
                        <p className="text-slate-808 text-slate-800 font-extrabold text-xs mt-1">{profile.voter_id || "N/A"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 4: ATTACHMENT FILES ─── */}
              {activeTab === "attachments" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-2.5 border-l-2 border-indigo-600 leading-none">Attachment Files</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1.5 pl-2.5">Your uploaded identity cards copies and validation papers</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Aadhaar File */}
                    <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between text-xs hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 border border-emerald-100">
                          <FileText size={16} />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-extrabold text-slate-800 truncate block">Aadhaar Card Copy</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider ${profile.aadhar_card ? "text-emerald-600" : "text-slate-400"}`}>
                            {profile.aadhar_card ? "Verified File" : "Pending upload"}
                          </span>
                        </div>
                      </div>
                      {profile.aadhar_card ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <a href={profile.aadhar_card} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/10 rounded-lg text-slate-700 hover:text-indigo-650 font-bold text-[10px] transition cursor-pointer text-center inline-block">
                            View
                          </a>
                          <button onClick={() => downloadFile(profile.aadhar_card, "Aadhaar_Card")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition active:scale-95 cursor-pointer">
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-[9px] shrink-0">Missing</span>
                      )}
                    </div>

                    {/* PAN File */}
                    <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between text-xs hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0 border border-orange-100">
                          <FileText size={16} />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-extrabold text-slate-800 truncate block">PAN Card Copy</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider ${profile.pan_card ? "text-emerald-600" : "text-slate-400"}`}>
                            {profile.pan_card ? "Verified File" : "Pending upload"}
                          </span>
                        </div>
                      </div>
                      {profile.pan_card ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <a href={profile.pan_card} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/10 rounded-lg text-slate-700 hover:text-indigo-650 font-bold text-[10px] transition cursor-pointer text-center inline-block">
                            View
                          </a>
                          <button onClick={() => downloadFile(profile.pan_card, "PAN_Card")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition active:scale-95 cursor-pointer">
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-[9px] shrink-0">Missing</span>
                      )}
                    </div>

                    {/* Voter Card File */}
                    <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between text-xs hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-655 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100">
                          <FileText size={16} />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-extrabold text-slate-800 truncate block">Voter Card Copy</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider ${profile.voter_card ? "text-emerald-600" : "text-slate-400"}`}>
                            {profile.voter_card ? "Verified File" : "Pending upload"}
                          </span>
                        </div>
                      </div>
                      {profile.voter_card ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <a href={profile.voter_card} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-slate-205 hover:border-indigo-355 hover:bg-indigo-50/10 rounded-lg text-slate-700 hover:text-indigo-650 font-bold text-[10px] transition cursor-pointer text-center inline-block">
                            View
                          </a>
                          <button onClick={() => downloadFile(profile.voter_card, "Voter_Card")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition active:scale-95 cursor-pointer">
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-[9px] shrink-0">Missing</span>
                      )}
                    </div>

                    {/* Passport File */}
                    <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between text-xs hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-rose-50 text-rose-655 rounded-lg flex items-center justify-center shrink-0 border border-rose-100">
                          <FileText size={16} />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-extrabold text-slate-800 truncate block">Passport Copy</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider ${profile.passport ? "text-emerald-600" : "text-slate-400"}`}>
                            {profile.passport ? "Verified File" : "Pending upload"}
                          </span>
                        </div>
                      </div>
                      {profile.passport ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <a href={profile.passport} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/10 rounded-lg text-slate-700 hover:text-indigo-650 font-bold text-[10px] transition cursor-pointer text-center inline-block">
                            View
                          </a>
                          <button onClick={() => downloadFile(profile.passport, "Passport_Copy")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition active:scale-95 cursor-pointer">
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-[9px] shrink-0">Missing</span>
                      )}
                    </div>

                    {/* Offer Letter */}
                    <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between text-xs hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 border border-blue-100">
                          <FileText size={16} />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-extrabold text-slate-800 truncate block">Offer Letter</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider ${profile.offer_letter ? "text-emerald-600" : "text-slate-400"}`}>
                            {profile.offer_letter ? "Generated File" : "Not generated"}
                          </span>
                        </div>
                      </div>
                      {profile.offer_letter ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setPreviewType("offer")}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/10 rounded-lg text-slate-700 hover:text-indigo-655 font-bold text-[10px] transition cursor-pointer"
                          >
                            View
                          </button>
                          <button onClick={() => downloadFile(profile.offer_letter, "Offer_Letter", profile.id)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition active:scale-95 cursor-pointer">
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-[9px] shrink-0">Missing</span>
                      )}
                    </div>

                    {/* Experience Letter */}
                    <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between text-xs hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-purple-50 text-purple-655 rounded-lg flex items-center justify-center shrink-0 border border-purple-100">
                          <FileText size={16} />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-extrabold text-slate-800 truncate block">Experience Letter</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider ${profile.experience_letter ? "text-emerald-600" : "text-slate-400"}`}>
                            {profile.experience_letter ? "Generated File" : "Not generated"}
                          </span>
                        </div>
                      </div>
                      {profile.experience_letter ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setPreviewType("experience")}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/10 rounded-lg text-slate-700 hover:text-indigo-655 font-bold text-[10px] transition cursor-pointer"
                          >
                            View
                          </button>
                          <button onClick={() => downloadFile(profile.experience_letter, "Experience_Letter", profile.id, "experience")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition active:scale-95 cursor-pointer">
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-[9px] shrink-0">Missing</span>
                      )}
                    </div>

                    {/* Relieving Letter */}
                    <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between text-xs hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-teal-50 text-teal-655 rounded-lg flex items-center justify-center shrink-0 border border-teal-100">
                          <FileText size={16} />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-extrabold text-slate-800 truncate block">Relieving Letter</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider ${profile.relieveing_letter ? "text-emerald-600" : "text-slate-400"}`}>
                            {profile.relieveing_letter ? "Generated File" : "Not generated"}
                          </span>
                        </div>
                      </div>
                      {profile.relieveing_letter ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setPreviewType("relieving")}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/10 rounded-lg text-slate-700 hover:text-indigo-650 font-bold text-[10px] transition cursor-pointer"
                          >
                            View
                          </button>
                          <button onClick={() => downloadFile(profile.relieveing_letter, "Relieving_Letter", profile.id, "relieving")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition active:scale-95 cursor-pointer">
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-[9px] shrink-0">Missing</span>
                      )}
                    </div>

                    {/* Termination Letter */}
                    <div className="bg-[#f8fafc] border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between text-xs hover:border-indigo-500 hover:bg-indigo-50/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-red-50 text-red-655 rounded-lg flex items-center justify-center shrink-0 border border-red-100">
                          <FileText size={16} />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-extrabold text-slate-800 truncate block">Termination Letter</span>
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider ${profile.termination_letter ? "text-emerald-600" : "text-slate-400"}`}>
                            {profile.termination_letter ? "Uploaded File" : "Pending upload"}
                          </span>
                        </div>
                      </div>
                      {profile.termination_letter ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <a href={profile.termination_letter} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-355 hover:bg-indigo-50/10 rounded-lg text-slate-700 hover:text-indigo-655 font-bold text-[10px] transition cursor-center text-center inline-block">
                            View
                          </a>
                          <button onClick={() => downloadFile(profile.termination_letter, "Termination_Letter")} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition active:scale-95 cursor-pointer">
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-[9px] shrink-0">Missing</span>
                      )}
                    </div>
                  </div>
                </div>
              )}



            </div>
          </div>
        )}
      </div>

      {/* Sleek In-App Modal Preview for Employee */}
      {previewType && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl border border-slate-205 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0 text-indigo-655">
                  <FileText size={17} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {previewType === "offer" ? "My Offer Letter" : previewType === "experience" ? "My Experience Certificate" : "My Relieving Letter"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {previewType === "offer" ? "Official employment offer document" : previewType === "experience" ? "Official employment tenure certificate" : "Official relief from employment duties"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewType(null)}
                className="text-slate-400 hover:text-slate-650 bg-white border border-slate-200 p-1.5 rounded-xl transition hover:shadow-sm"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Content - Iframe render */}
            <div className="p-6 bg-slate-100/40 flex-1 overflow-y-auto flex justify-center items-start">
              {loadingHtml ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-md w-full max-w-[800px] h-[60vh] text-center">
                  <span className="animate-pulse font-bold text-slate-400 text-xs">Loading Letter Layout...</span>
                </div>
              ) : (
                <iframe
                  id="document-letter-iframe-employee"
                  srcDoc={htmlContent}
                  title="Document Preview"
                  className="w-full h-[60vh] max-w-[800px] border border-slate-200 rounded-2xl shadow-xl bg-white"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                HRMS DOCUMENT VIEWER
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dataUrl = previewType === "offer" ? profile?.offer_letter : previewType === "experience" ? profile?.experience_letter : profile?.relieveing_letter;
                    const label = previewType === "offer" ? "Offer_Letter" : previewType === "experience" ? "Experience_Letter" : "Relieving_Letter";
                    downloadFile(dataUrl, label, profile.id, previewType);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition active:scale-95 cursor-pointer animate-in duration-200"
                >
                  Download
                </button>
                <button
                  onClick={() => setPreviewType(null)}
                  className="px-4 py-2 border border-slate-205 hover:border-slate-350 text-slate-700 bg-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </EmployeeDashboardLayout>
  );
}
