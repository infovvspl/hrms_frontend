import { useEffect, useState } from "react";
import axios from "axios";
import {
  User, Building2, IdCard, FileText, Loader2, Camera, Phone, X,
  Mail, Calendar, MapPin, Shield, Briefcase, Award, Clock,
  Download, Eye, Edit3, Save, XCircle
} from "lucide-react";
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
  const [editData, setEditData] = useState({});
  const [htmlContent, setHtmlContent] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [hasUpdatePermission, setHasUpdatePermission] = useState(false);

  const token = localStorage.getItem("token");
  const employeeId = localStorage.getItem("employee_id");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
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

    const fetchPermissions = async () => {
      const userRole = localStorage.getItem("role");
      if (userRole === "company" || userRole === "admin") {
        setHasUpdatePermission(true);
        return;
      }
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000"}/api/permissions/my-permissions`,
          { headers }
        );
        const list = res.data.permissions || [];
        setHasUpdatePermission(list.includes("Update My Profile"));
      } catch (err) {
        console.error("Error fetching active user permissions:", err);
        setHasUpdatePermission(false);
      }
    };

    fetchProfile();
    fetchPermissions();
  }, [employeeId]);

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

  const getTenureText = () => {
    if (!profile?.doj) return "N/A";
    const start = new Date(profile.doj);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;
    if (totalMonths < 12) return `${totalMonths} months`;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return m > 0 ? `${y}y ${m}m` : `${y} years`;
  };

  const tabs = [
    { id: "corporate", label: "Corporate Info", icon: Building2 },
    { id: "contact", label: "Personal Details", icon: User },
    { id: "government", label: "Government IDs", icon: Shield },
    { id: "attachments", label: "Documents", icon: FileText },
  ];

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 text-left select-none">

        {loading && (
          <div className="flex flex-col justify-center items-center py-32 bg-white border border-slate-200 rounded-2xl gap-3">
            <Loader2 className="animate-spin text-slate-800" size={24} />
            <span className="text-xs font-semibold text-slate-400">Loading profile data...</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50/80 border border-rose-100 text-rose-600 text-xs font-semibold p-4 rounded-xl text-center flex items-center justify-center gap-2">
            <XCircle size={15} /> {error}
          </div>
        )}

        {profile && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

            {/* Left Card: Summary Card */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
              <div
                onClick={() => hasUpdatePermission && !uploading && document.getElementById("avatar-upload-input")?.click()}
                className={`w-28 h-28 rounded-full bg-slate-50 border border-slate-200 overflow-hidden relative group shrink-0 shadow-inner ${hasUpdatePermission ? "cursor-pointer" : ""}`}
              >
                {uploading ? (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                ) : (
                  <>
                    {profile.image ? (
                      <img src={getEmployeeAvatarSrc(profile.image)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={44} className="text-slate-355" />
                      </div>
                    )}
                    {hasUpdatePermission && (
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition duration-200">
                        <Camera size={16} className="mb-0.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <input id="avatar-upload-input" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />

              <div className="space-y-1">
                <h1 className="text-base font-bold text-slate-800 tracking-tight">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-xs font-semibold text-slate-450">{profile.designation_title || "Team Member"}</p>
              </div>

              <div className="w-full border-t border-slate-100 pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Emp ID</span>
                  <span className="font-bold text-slate-700">{profile.company_employee_id || profile.id}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" /> Active
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Joining Date</span>
                  <span className="font-bold text-slate-700">
                    {profile.doj ? new Date(profile.doj).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Tenure</span>
                  <span className="font-bold text-slate-700">{getTenureText()}</span>
                </div>
              </div>
            </div>

            {/* Right Workstation: Tab Panels */}
            <div className="lg:col-span-3 space-y-6">

              {/* Tabs Navigation */}
              <div className="bg-white border border-slate-200 rounded-xl p-1 flex overflow-x-auto scrollbar-none gap-1 shadow-sm">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsEditing(false);
                      }}
                      className={`flex-1 min-w-[120px] py-2.5 rounded-lg font-bold text-xs transition cursor-pointer text-center ${isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Main Content Workspace Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm min-h-[350px]">

                {/* ─── CORPORATE ─── */}
                {activeTab === "corporate" && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Corporate &amp; Workplace</h2>
                      <p className="text-xs text-slate-400 mt-1">Official organization roles, assignments, and reporting</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Department</span>
                        <p className="font-bold text-slate-700 mt-1">{profile.department_name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Designation</span>
                        <p className="font-bold text-slate-700 mt-1">{profile.designation_title || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Branch Location</span>
                        <p className="font-bold text-slate-700 mt-1">{profile.branch_name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Shift Schedule</span>
                        <p className="font-bold text-slate-700 mt-1">{profile.shift_name || "General Shift"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">System Access Role</span>
                        <p className="font-bold text-slate-700 mt-1">{profile.role_name || "Employee"}</p>
                      </div>
                    </div>

                    {/* Reporting Manager */}
                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Reporting Manager</h3>
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl max-w-xl">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{profile.reporting_manager_name || "N/A"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{profile.reporting_manager_email || "N/A"}</p>
                        </div>
                        {profile.reporting_manager_email && (
                          <a
                            href={`mailto:${profile.reporting_manager_email}`}
                            className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-350 bg-white rounded-lg text-xs font-bold text-slate-600 transition"
                          >
                            Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── PERSONAL DETAILS ─── */}
                {activeTab === "contact" && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Personal Details</h2>
                        <p className="text-xs text-slate-400 mt-1">Manage contact info and personal records</p>
                      </div>
                      {!isEditing && hasUpdatePermission && (
                        <button
                          onClick={startEditing}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mobile Number</label>
                            <input type="text" value={editData.mobile} onChange={(e) => setEditData({ ...editData, mobile: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Personal Email</label>
                            <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date of Birth</label>
                            <input type="date" value={editData.dob} onChange={(e) => setEditData({ ...editData, dob: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gender</label>
                            <select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition cursor-pointer">
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Marital Status</label>
                            <select value={editData.marital_status} onChange={(e) => setEditData({ ...editData, marital_status: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition cursor-pointer">
                              <option value="">Select Status</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Area of Expertise</label>
                            <input type="text" value={editData.area_of_expertise} onChange={(e) => setEditData({ ...editData, area_of_expertise: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition" />
                          </div>
                        </div>

                        {/* Addresses */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Present Address</label>
                            <input type="text" placeholder="Line 1" value={editData.present_address1} onChange={(e) => setEditData({ ...editData, present_address1: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-xs transition" />
                            <input type="text" placeholder="Line 2" value={editData.present_address2} onChange={(e) => setEditData({ ...editData, present_address2: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-xs transition" />
                            <div className="grid grid-cols-3 gap-2">
                              <input type="text" placeholder="City" value={editData.present_city} onChange={(e) => setEditData({ ...editData, present_city: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-2 py-1.5 outline-none text-xs transition" />
                              <input type="text" placeholder="State" value={editData.present_state} onChange={(e) => setEditData({ ...editData, present_state: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-2 py-1.5 outline-none text-xs transition" />
                              <input type="text" placeholder="Pincode" value={editData.present_pincode} onChange={(e) => setEditData({ ...editData, present_pincode: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-2 py-1.5 outline-none text-xs transition" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Permanent Address</label>
                            <input type="text" placeholder="Line 1" value={editData.permanent_address1} onChange={(e) => setEditData({ ...editData, permanent_address1: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-xs transition" />
                            <input type="text" placeholder="Line 2" value={editData.permanent_address2} onChange={(e) => setEditData({ ...editData, permanent_address2: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-xs transition" />
                            <div className="grid grid-cols-3 gap-2">
                              <input type="text" placeholder="City" value={editData.permanent_city} onChange={(e) => setEditData({ ...editData, permanent_city: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-2 py-1.5 outline-none text-xs transition" />
                              <input type="text" placeholder="State" value={editData.permanent_state} onChange={(e) => setEditData({ ...editData, permanent_state: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-2 py-1.5 outline-none text-xs transition" />
                              <input type="text" placeholder="Pincode" value={editData.permanent_pincode} onChange={(e) => setEditData({ ...editData, permanent_pincode: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-2 py-1.5 outline-none text-xs transition" />
                            </div>
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-2 pt-4 border-t border-slate-100">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Emergency Contact</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input type="text" placeholder="Name" value={editData.emergency_contact_name} onChange={(e) => setEditData({ ...editData, emergency_contact_name: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-xs transition" />
                            <input type="text" placeholder="Relation" value={editData.emergency_contact_relation} onChange={(e) => setEditData({ ...editData, emergency_contact_relation: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-xs transition" />
                            <input type="text" placeholder="Phone" value={editData.emergency_contact_phone} onChange={(e) => setEditData({ ...editData, emergency_contact_phone: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-xs transition" />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                          <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition">Cancel</button>
                          <button type="button" onClick={handleSaveChanges} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition">Save Changes</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mobile Number</span>
                            <p className="font-bold text-slate-700 mt-1">{profile.mobile || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Personal Email</span>
                            <p className="font-bold text-slate-700 mt-1 truncate">{profile.email || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date of Birth</span>
                            <p className="font-bold text-slate-700 mt-1">
                              {profile.dob ? new Date(profile.dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gender</span>
                            <p className="font-bold text-slate-700 mt-1">{profile.gender || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Marital Status</span>
                            <p className="font-bold text-slate-700 mt-1">{profile.marital_status || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Area of Expertise</span>
                            <p className="font-bold text-slate-700 mt-1">{profile.area_of_expertise || "N/A"}</p>
                          </div>
                        </div>

                        {/* Addresses */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2.5">Present Address</span>
                            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl min-h-[80px]">
                              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                                {profile.present_address1 || "N/A"}
                                {profile.present_address2 ? `, ${profile.present_address2}` : ""}
                                {profile.present_city ? `, ${profile.present_city}` : ""}
                                {profile.present_state ? `, ${profile.present_state}` : ""}
                                {profile.present_pincode ? ` - ${profile.present_pincode}` : ""}
                              </p>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2.5">Permanent Address</span>
                            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl min-h-[80px]">
                              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                                {profile.permanent_address1 || "N/A"}
                                {profile.permanent_address2 ? `, ${profile.permanent_address2}` : ""}
                                {profile.permanent_city ? `, ${profile.permanent_city}` : ""}
                                {profile.permanent_state ? `, ${profile.permanent_state}` : ""}
                                {profile.permanent_pincode ? ` - ${profile.permanent_pincode}` : ""}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="pt-4 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3">Emergency Contact</span>
                          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Contact Person</span>
                                <p className="font-bold text-slate-700 mt-1">{profile.emergency_contact_name || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Relationship</span>
                                <p className="font-bold text-slate-700 mt-1">{profile.emergency_contact_relation || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                                <p className="font-bold text-slate-700 mt-1">{profile.emergency_contact_phone || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── GOVT IDS ─── */}
                {activeTab === "government" && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Government Identifications</h2>
                        <p className="text-xs text-slate-400 mt-1">Official registry record identification details</p>
                      </div>
                      {!isEditing && hasUpdatePermission && (
                        <button
                          onClick={startEditing}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Edit Details
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Aadhaar Card Number</label>
                            <input type="text" maxLength={12} value={editData.aadhaar_number} onChange={(e) => setEditData({ ...editData, aadhaar_number: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PAN Card Number</label>
                            <input type="text" maxLength={10} value={editData.pan_number} onChange={(e) => setEditData({ ...editData, pan_number: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">UAN Provident Fund No.</label>
                            <input type="text" value={editData.uan_number} onChange={(e) => setEditData({ ...editData, uan_number: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Passport Number</label>
                            <input type="text" value={editData.passport_number} onChange={(e) => setEditData({ ...editData, passport_number: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition" />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Voter Card ID Number</label>
                            <input type="text" value={editData.voter_id} onChange={(e) => setEditData({ ...editData, voter_id: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-slate-500 rounded-xl px-3 py-2 outline-none text-sm transition" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                          <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition">Cancel</button>
                          <button type="button" onClick={handleSaveChanges} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition">Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Aadhaar Card Number</span>
                          <p className="font-bold text-slate-700 mt-1">{profile.aadhaar_number || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PAN Card Number</span>
                          <p className="font-bold text-slate-700 mt-1">{profile.pan_number || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">UAN Provident Fund No.</span>
                          <p className="font-bold text-slate-700 mt-1">{profile.uan_number || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Passport Number</span>
                          <p className="font-bold text-slate-700 mt-1">{profile.passport_number || "N/A"}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Voter Card ID Number</span>
                          <p className="font-bold text-slate-700 mt-1">{profile.voter_id || "N/A"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── DOCUMENTS ─── */}
                {activeTab === "attachments" && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-sm font-bold text-slate-805 uppercase tracking-wider">Documents &amp; Certificates</h2>
                      <p className="text-xs text-slate-400 mt-1">Official certificate copies and administrative employment files</p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {[
                        { key: "aadhar_card", label: "Aadhaar Card Copy", isDoc: false },
                        { key: "pan_card", label: "PAN Card Copy", isDoc: false },
                        { key: "voter_card", label: "Voter Card Copy", isDoc: false },
                        { key: "passport", label: "Passport Copy", isDoc: false },
                        { key: "offer_letter", label: "Offer Letter", isDoc: true, previewKey: "offer" },
                        { key: "experience_letter", label: "Experience Letter", isDoc: true, previewKey: "experience" },
                        { key: "relieveing_letter", label: "Relieving Letter", isDoc: true, previewKey: "relieving" },
                        { key: "termination_letter", label: "Termination Letter", isDoc: false },
                      ].map((doc) => {
                        const hasFile = !!profile[doc.key];
                        return (
                          <div key={doc.key} className="flex items-center justify-between py-3.5 gap-4">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{doc.label}</p>
                              <span className={`text-[10px] font-bold ${hasFile ? "text-emerald-600" : "text-slate-350"}`}>
                                {hasFile ? "Verified" : "Missing"}
                              </span>
                            </div>
                            {hasFile ? (
                              <div className="flex items-center gap-2">
                                {doc.isDoc ? (
                                  <button
                                    onClick={() => setPreviewType(doc.previewKey)}
                                    className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 transition"
                                  >
                                    View
                                  </button>
                                ) : (
                                  <a
                                    href={profile[doc.key]}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-355 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 transition inline-block"
                                  >
                                    View
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    if (doc.isDoc) {
                                      downloadFile(profile[doc.key], doc.label.replace(/ /g, "_"), profile.id, doc.previewKey || "offer");
                                    } else {
                                      downloadFile(profile[doc.key], doc.label.replace(/ /g, "_"));
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
                                >
                                  Download
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold px-2 py-1 bg-slate-50 border border-slate-100 rounded">
                                N/A
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL PREVIEW ─── */}
      {previewType && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-white">
              <h3 className="font-bold text-slate-850 text-sm">
                {previewType === "offer" ? "Offer Letter Preview" : previewType === "experience" ? "Experience Certificate Preview" : "Relieving Letter Preview"}
              </h3>
              <button onClick={() => setPreviewType(null)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-250 p-2 rounded-xl transition cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <div className="p-6 bg-slate-50 flex-1 overflow-y-auto flex justify-center items-start">
              {loadingHtml ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl w-full max-w-[800px] h-[60vh] text-center gap-3">
                  <Loader2 className="animate-spin text-slate-500" size={24} />
                  <span className="text-xs font-bold text-slate-400">Loading document...</span>
                </div>
              ) : (
                <iframe
                  id="document-letter-iframe-employee"
                  srcDoc={htmlContent}
                  title="Document Preview"
                  className="w-full h-[60vh] max-w-[800px] border border-slate-200 rounded-2xl shadow-sm bg-white"
                />
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-150 flex items-center justify-end bg-white gap-2">
              <button onClick={() => setPreviewType(null)} className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-600 bg-white rounded-xl text-xs font-bold transition">Close</button>
              <button
                onClick={() => {
                  const dataUrl = previewType === "offer" ? profile?.offer_letter : previewType === "experience" ? profile?.experience_letter : profile?.relieveing_letter;
                  const label = previewType === "offer" ? "Offer_Letter" : previewType === "experience" ? "Experience_Letter" : "Relieving_Letter";
                  downloadFile(dataUrl, label, profile.id, previewType);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </EmployeeDashboardLayout>
  );
}

