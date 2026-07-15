import { useState, useEffect } from "react";
import { formatEmployeeId } from "../../utils/format";
import { getEmployeeAvatarSrc } from "../../utils/companyLogo";
import {
  FaTimes,
  FaUser,
  FaBriefcase,
  FaMapMarkerAlt,
  FaFileSignature,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaTrashAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaBuilding,
  FaFileImage,
  FaFilePdf
} from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";

const COMPANY_SEEDED_DATA = {
  "TechNova Solutions Pvt Ltd": {
    buildings: ["TechNova Tower A", "TechNova Tower B"],
    floors: ["Floor 1", "Floor 2", "Floor 3", "Floor 4"],
    extensions: ["101", "102", "201", "202", "301", "302", "401", "402"],
    seats: [
      "TNA-01-101-A", "TNA-01-101-B", "TNA-01-102-A", "TNA-01-102-B",
      "TNA-02-201-A", "TNA-02-201-B", "TNA-02-202-A", "TNA-02-202-B",
      "TNB-03-301-A", "TNB-03-301-B", "TNB-03-302-A", "TNB-03-302-B",
      "TNB-04-401-A", "TNB-04-401-B", "TNB-04-402-A", "TNB-04-402-B"
    ]
  },
  "MediCare Health Services": {
    buildings: ["Medicare Block A", "Medicare Block B"],
    floors: ["Floor 1", "Floor 2"],
    extensions: ["110", "111", "120", "121", "210", "211", "220", "221"],
    seats: [
      "MCA-01-110-01", "MCA-01-110-02", "MCA-01-111-01", "MCA-01-111-02",
      "MCA-02-210-01", "MCA-02-210-02", "MCA-02-211-01", "MCA-02-211-02",
      "MCB-01-120-01", "MCB-01-120-02", "MCB-01-121-01", "MCB-01-121-02",
      "MCB-02-220-01", "MCB-02-220-02", "MCB-02-221-01", "MCB-02-221-02"
    ]
  },
  "EduSpark Learning LLP": {
    buildings: ["EduSpark Campus 1", "EduSpark Campus 2"],
    floors: ["Ground Floor", "First Floor", "Floor 1", "Floor 2"],
    extensions: ["10", "11", "15", "16", "20", "21", "25", "26"],
    seats: [
      "ES1-GF-10-X", "ES1-GF-10-Y", "ES1-GF-11-X", "ES1-GF-11-Y",
      "ES1-1F-20-X", "ES1-1F-20-Y", "ES1-1F-21-X", "ES1-1F-21-Y",
      "ES2-01-15-X", "ES2-01-15-Y", "ES2-01-16-X", "ES2-01-16-Y",
      "ES2-02-25-X", "ES2-02-25-Y", "ES2-02-26-X", "ES2-02-26-Y"
    ]
  }
};

export default function EmployeeModal({
  employee = null,
  onClose,
  onSubmit,
  branches = [],
  departments = [],
  designations = [],
  roles = [],
  employees = [], // passed to select reporting manager
}) {
  const isEdit = !!employee;

  const activeCompany = JSON.parse(localStorage.getItem("company") || "{}");
  const rawCompanyName = activeCompany.company_name || "";
  const matchedCompanyKey = Object.keys(COMPANY_SEEDED_DATA).find(
    (key) => key.toLowerCase() === rawCompanyName.toLowerCase()
  );
  const companySeededData = COMPANY_SEEDED_DATA[matchedCompanyKey] || null;

  const [activeTab, setActiveTab] = useState("personal"); // personal | job | address | documents
  const [lastTabChangeTime, setLastTabChangeTime] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setLastTabChangeTime(Date.now());
  };

  const [sameAsPresent, setSameAsPresent] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    work_email: "",
    password: "Emp123",
    mobile: "",
    work_phone_number: "",
    dob: "",
    doj: "",
    doe: "",
    employment_type: "1", // Default to 1 (Full-Time)
    employment_status: "Active",
    status: "Pending",
    reporting_manager: "",
    gender: "",
    marital_status: "",
    area_of_expertise: "",
    current_experience: "0",
    total_experience: "0",

    // Seating
    building_name: "",
    floor_number: "",
    extension: "",
    seat_number: "",

    // Present Address
    present_address1: "",
    present_address2: "",
    present_city: "",
    present_state: "",
    present_country: "",
    present_pincode: "",

    // Permanent Address
    permanent_address1: "",
    permanent_address2: "",
    permanent_city: "",
    permanent_state: "",
    permanent_country: "",
    permanent_pincode: "",

    // KYC Numbers
    aadhaar_number: "",
    pan_number: "",
    voter_id: "",
    passport_number: "",
    uan_number: "",
    pf_number: "",

    // Organization fields
    branch_id: "",
    department_id: "",
    designation_id: "",
    role_id: "",

    // Files
    image: null,
    aadhar_card: null,
    voter_card: null,
    passport: null,
    pan_card: null,
    signatures: null,
  });

  // Photo preview
  const [photoPreview, setPhotoPreview] = useState(null);

  const buildings = companySeededData ? companySeededData.buildings : [];
  const floors = companySeededData ? companySeededData.floors : [];
  const extensions = companySeededData ? companySeededData.extensions : [];
  const seats = companySeededData ? companySeededData.seats : [];

  // Load employee data on edit
  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || "",
        middle_name: employee.middle_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        work_email: employee.work_email || "",
        password: "",
        mobile: employee.mobile || "",
        work_phone_number: employee.work_phone_number || "",
        dob: employee.dob ? employee.dob.substring(0, 10) : "",
        doj: employee.doj ? employee.doj.substring(0, 10) : "",
        doe: employee.doe ? employee.doe.substring(0, 10) : "",
        employment_type: employee.employment_type || "1",
        employment_status: employee.employment_status || "Active",
        status: employee.status || "Pending",
        reporting_manager: employee.reporting_manager || "",
        gender: employee.gender || "",
        marital_status: employee.marital_status || "",
        area_of_expertise: employee.area_of_expertise || "",
        current_experience: employee.current_experience || "0",
        total_experience: employee.total_experience || "0",

        building_name: employee.building_display_name || employee.building_name || "",
        floor_number: employee.floor_display_name || employee.floor_number || "",
        extension: employee.extension_display_number || employee.extension || "",
        seat_number: employee.seat_display_number || employee.seat_number || "",

        present_address1: employee.present_address1 || "",
        present_address2: employee.present_address2 || "",
        present_city: employee.present_city || "",
        present_state: employee.present_state || "",
        present_country: employee.present_country || "",
        present_pincode: employee.present_pincode || "",

        permanent_address1: employee.permanent_address1 || "",
        permanent_address2: employee.permanent_address2 || "",
        permanent_city: employee.permanent_city || "",
        permanent_state: employee.permanent_state || "",
        permanent_country: employee.permanent_country || "",
        permanent_pincode: employee.permanent_pincode || "",

        aadhaar_number: employee.aadhaar_number || "",
        pan_number: employee.pan_number || "",
        voter_id: employee.voter_id || "",
        passport_number: employee.passport_number || "",
        uan_number: employee.uan_number || "",
        pf_number: employee.pf_number || "",

        image: employee.image || null,
        aadhar_card: employee.aadhar_card || null,
        voter_card: employee.voter_card || null,
        passport: employee.passport || null,
        pan_card: employee.pan_card || null,
        signatures: employee.signatures || null,
        branch_id: employee.branch_id || "",
        department_id: employee.department_id || "",
        designation_id: employee.designation_id || "",
        role_id: employee.role_id || "",
      });

      if (employee.image) {
        setPhotoPreview(getEmployeeAvatarSrc(employee.image));
      }
    }
  }, [employee]);

  // Synchronize permanent address if check is enabled
  useEffect(() => {
    if (sameAsPresent) {
      setFormData((prev) => ({
        ...prev,
        permanent_address1: prev.present_address1,
        permanent_address2: prev.present_address2,
        permanent_city: prev.present_city,
        permanent_state: prev.present_state,
        permanent_country: prev.present_country,
        permanent_pincode: prev.present_pincode,
      }));
    }
  }, [
    sameAsPresent,
    formData.present_address1,
    formData.present_address2,
    formData.present_city,
    formData.present_state,
    formData.present_country,
    formData.present_pincode,
  ]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];

      if (name === "signatures") {
        const maxSizeBytes = 20 * 1024;
        if (file.size > maxSizeBytes) {
          alert(`Signature image size must be under 20KB. Current size is ${(file.size / 1024).toFixed(1)}KB.`);
          e.target.value = "";
          return;
        }

        const img = new Image();
        img.onload = () => {
          if (img.width < 300 || img.width > 600 || img.height < 90 || img.height > 150) {
            alert(`Signature image dimensions must be:\n- Width: 300px to 600px (Current: ${img.width}px)\n- Height: 90px to 150px (Current: ${img.height}px)`);
            e.target.value = "";
            setFormData((prev) => ({ ...prev, signatures: null }));
          } else {
            setFormData((prev) => ({ ...prev, signatures: file }));
          }
        };
        img.src = URL.createObjectURL(file);
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));

      if (name === "image") {
        setPhotoPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClearFile = (name) => {
    setFormData((prev) => ({ ...prev, [name]: null }));
    if (name === "image") {
      setPhotoPreview(null);
    }
  };



  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") {
      e.preventDefault();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab !== "documents") {
      return;
    }

    if (Date.now() - lastTabChangeTime < 450) {
      return;
    }

    const selectedRoleName = roles.find((r) => String(r.id) === String(formData.role_id))?.role_name?.toLowerCase() || "";
    const isSigRequired = selectedRoleName.includes("hr") || selectedRoleName.includes("ceo");

    if (isSigRequired && !formData.signatures) {
      alert("Signature upload is required for HR and CEO roles.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (["image", "aadhar_card", "pan_card", "passport", "voter_card", "signatures"].includes(key)) {
        if (val instanceof File) {
          data.append(key, val);
        }
      } else {
        if (key === "password" && isEdit && !val) {
          return; // omit password on edit if empty
        }
        data.append(key, val);
      }
    });

    onSubmit(data);
  };

  const tabs = [
    { id: "personal", label: "1. Personal Info", icon: <FaUser size={12} /> },
    { id: "job", label: "2. Work & Org", icon: <FaBriefcase size={12} /> },
    { id: "address", label: "3. Address & Office", icon: <FaMapMarkerAlt size={12} /> },
    { id: "documents", label: "4. KYC & Docs", icon: <FaFileSignature size={12} /> },
  ];

  const employmentTypesList = [
    { id: "1", name: "Full-Time" },
    { id: "2", name: "Part-Time" },
    { id: "3", name: "Contract" },
    { id: "4", name: "Internship" },
    { id: "5", name: "Freelance" },
    { id: "6", name: "Temporary" },
    { id: "7", name: "Probation" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-slate-50 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.18)] w-full max-w-4xl overflow-hidden border border-white flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-8 py-6 text-white shrink-0">
          <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
                {isEdit ? <FaBriefcase size={20} /> : <FaUser size={20} />}
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  {isEdit
                    ? `Update Workforce Member (${formatEmployeeId(employee?.company_name, employee?.company_employee_id, employee?.id)})`
                    : "Onboard New Personnel"}
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-0.5 uppercase tracking-wider">
                  HRMS Registry • System Schema Integration
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-slate-300 transition-all duration-300 hover:bg-rose-500 hover:border-rose-500 hover:text-white hover:rotate-90 flex items-center justify-center cursor-pointer shadow-sm"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-100 bg-white shrink-0 p-3 gap-2 overflow-x-auto justify-center md:justify-start">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`
                  px-5 py-3
                  rounded-2xl
                  text-xs
                  font-extrabold
                  flex
                  items-center
                  gap-2.5
                  cursor-pointer
                  transition-all
                  duration-300
                  border
                  ${isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-950/20 scale-[1.02]"
                    : "text-slate-500 bg-slate-50/50 border-transparent hover:bg-slate-100 hover:text-slate-800"
                  }
                `}
              >
                <span className={isActive ? "text-indigo-400" : "text-slate-400"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="flex-1 flex flex-col overflow-hidden"
        >

          {/* Scrollable Form Body */}
          <div className="p-8 overflow-y-auto flex-1 space-y-6">

            {/* 1. PERSONAL INFO TAB */}
            {activeTab === "personal" && (
              <div className="space-y-6 animate-in fade-in duration-300">

                {/* Photo uploader */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                  <label className="relative cursor-pointer group/avatar">
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="h-28 w-28 rounded-full bg-slate-50 border-4 border-slate-100 overflow-hidden flex items-center justify-center shadow-inner group-hover/avatar:border-indigo-500 transition-all duration-300">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-slate-300">👤</span>
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 p-2 rounded-full bg-indigo-600 text-white text-xs shadow-md border border-white hover:bg-indigo-700 transition duration-300">
                      📷
                    </div>
                  </label>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Employee Profile Photo
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Accepts JPG, PNG, GIF formats (max 1MB)
                    </p>
                  </div>
                </div>

                {/* Identity Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                      <FaUser size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Identity Details
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    <InputWrapper label="First Name" required={true}>
                      <input
                        type="text"
                        name="first_name"
                        placeholder="e.g. John"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="form-input-custom"
                        required
                      />
                    </InputWrapper>

                    <InputWrapper label="Middle Name">
                      <input
                        type="text"
                        name="middle_name"
                        placeholder="e.g. Robert"
                        value={formData.middle_name}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="Last Name" required={true}>
                      <input
                        type="text"
                        name="last_name"
                        placeholder="e.g. Doe"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="form-input-custom"
                        required
                      />
                    </InputWrapper>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    <InputWrapper label="Date of Birth">
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="Gender">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-select-custom"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </InputWrapper>

                    <InputWrapper label="Marital Status">
                      <select
                        name="marital_status"
                        value={formData.marital_status}
                        onChange={handleChange}
                        className="form-select-custom"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </InputWrapper>
                  </div>
                </div>

                {/* Contact & Credentials */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                      <FaLock size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Contact & Account Security
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <InputWrapper label="Primary Email Address" required={true}>
                      <input
                        type="email"
                        name="email"
                        placeholder="e.g. john@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input-custom"
                        required
                      />
                    </InputWrapper>

                    <InputWrapper label="Mobile Number">
                      <input
                        type="text"
                        name="mobile"
                        placeholder="e.g. +91 9876543210"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <InputWrapper label="Account Security Password" required={!isEdit}>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder={isEdit ? "•••••••• (Leave blank to keep current)" : "Minimum 6 characters"}
                          value={formData.password}
                          onChange={handleChange}
                          className="form-input-custom pr-10"
                          required={!isEdit}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 hover:text-slate-600"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      </div>
                      {!isEdit && (
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                          Default: <span className="font-bold text-indigo-600">Emp123</span> (Changeable)
                        </p>
                      )}
                    </InputWrapper>
                  </div>
                </div>

              </div>
            )}

            {/* 2. JOB DETAILS TAB */}
            {activeTab === "job" && (
              <div className="space-y-6 animate-in fade-in duration-300">

                {/* Org Structure */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                      <FaBuilding size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Organizational Placement
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <InputWrapper label="Branch Location" required={true}>
                      <select
                        name="branch_id"
                        value={formData.branch_id}
                        onChange={handleChange}
                        className="form-select-custom"
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.branch_name || b.name}
                          </option>
                        ))}
                      </select>
                    </InputWrapper>

                    <InputWrapper label="Department" required={true}>
                      <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleChange}
                        className="form-select-custom"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.department_name || d.title}
                          </option>
                        ))}
                      </select>
                    </InputWrapper>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    <InputWrapper label="Designation" required={true}>
                      <select
                        name="designation_id"
                        value={formData.designation_id}
                        onChange={handleChange}
                        className="form-select-custom"
                        required
                      >
                        <option value="">Select Designation</option>
                        {designations.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title}
                          </option>
                        ))}
                      </select>
                    </InputWrapper>

                    <InputWrapper label="System Access Role" required={true}>
                      <select
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                        className="form-select-custom"
                        required
                      >
                        <option value="">Select Role</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.role_name}
                          </option>
                        ))}
                      </select>
                    </InputWrapper>

                    <InputWrapper label="Direct Reporting Manager">
                      <select
                        name="reporting_manager"
                        value={formData.reporting_manager}
                        onChange={handleChange}
                        className="form-select-custom"
                      >
                        <option value="">Select Manager</option>
                        {employees
                          .filter((e) => e.id !== employee?.id) // avoid reporting to self
                          .map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} (ID #{emp.id})
                            </option>
                          ))}
                      </select>
                    </InputWrapper>
                  </div>
                </div>

                {/* Job Info */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                      <FaBriefcase size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Employment Settings
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    <InputWrapper label="Employment Type" required={true}>
                      <select
                        name="employment_type"
                        value={formData.employment_type}
                        onChange={handleChange}
                        className="form-select-custom"
                        required
                      >
                        {employmentTypesList.map((et) => (
                          <option key={et.id} value={et.id}>
                            {et.name}
                          </option>
                        ))}
                      </select>
                    </InputWrapper>

                    <InputWrapper label="Employment Status" required={true}>
                      <select
                        name="employment_status"
                        value={formData.employment_status}
                        onChange={handleChange}
                        className="form-select-custom"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </InputWrapper>

                    <InputWrapper label="Status">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select-custom"
                      >
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Interview Ongoing">Interview Ongoing</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Offer Accepted">Offer Accepted</option>
                        <option value="Offer Declined">Offer Declined</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Probation">Probation</option>
                        <option value="Probation Extension">Probation Extension</option>
                        <option value="Probation Passed">Probation Passed</option>
                        <option value="Probation Failed">Probation Failed</option>
                        <option value="Resigned">Resigned</option>
                        <option value="Termination">Termination</option>
                        <option value="Ex-Employee">Ex-Employee</option>
                      </select>
                    </InputWrapper>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <InputWrapper label="Work Email Address">
                      <input
                        type="email"
                        name="work_email"
                        placeholder="e.g. employee@company.com"
                        value={formData.work_email}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="Work Phone / Extension">
                      <input
                        type="text"
                        name="work_phone_number"
                        placeholder="e.g. ext-442"
                        value={formData.work_phone_number}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <InputWrapper label="Date of Joining">
                      <input
                        type="date"
                        name="doj"
                        value={formData.doj}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="Date of Exit (DOE)">
                      <input
                        type="date"
                        name="doe"
                        value={formData.doe}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>
                  </div>
                </div>

                {/* Professional background */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                      <FaFileSignature size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Skills & Experience
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <InputWrapper label="Area of Expertise">
                      <input
                        type="text"
                        name="area_of_expertise"
                        placeholder="e.g. Node.js, Frontend UI"
                        value={formData.area_of_expertise}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <div className="grid grid-cols-2 gap-3">
                      <InputWrapper label="Current Exp (Yrs)">
                        <input
                          type="number"
                          step="0.1"
                          name="current_experience"
                          value={formData.current_experience}
                          onChange={handleChange}
                          className="form-input-custom"
                        />
                      </InputWrapper>

                      <InputWrapper label="Total Exp (Yrs)">
                        <input
                          type="number"
                          step="0.1"
                          name="total_experience"
                          value={formData.total_experience}
                          onChange={handleChange}
                          className="form-input-custom"
                        />
                      </InputWrapper>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 3. ADDRESS & OFFICE TAB */}
            {activeTab === "address" && (
              <div className="space-y-6 animate-in fade-in duration-300">

                {/* Office desk */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                      <FaBuilding size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      🏢 Office Desk Seating
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {companySeededData ? (
                      <>
                        <InputWrapper label="Building Name">
                          <select
                            name="building_name"
                            value={formData.building_name}
                            onChange={handleChange}
                            className="form-select-custom"
                          >
                            <option value="">Select Building</option>
                            {buildings.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </InputWrapper>

                        <InputWrapper label="Floor Name">
                          <select
                            name="floor_number"
                            value={formData.floor_number}
                            onChange={handleChange}
                            className="form-select-custom"
                          >
                            <option value="">Select Floor</option>
                            {floors.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </InputWrapper>

                        <InputWrapper label="Extension">
                          <select
                            name="extension"
                            value={formData.extension}
                            onChange={handleChange}
                            className="form-select-custom"
                          >
                            <option value="">Select Extension</option>
                            {extensions.map((ext) => (
                              <option key={ext} value={ext}>
                                {ext}
                              </option>
                            ))}
                          </select>
                        </InputWrapper>

                        <InputWrapper label="Seat Number">
                          <select
                            name="seat_number"
                            value={formData.seat_number}
                            onChange={handleChange}
                            className="form-select-custom"
                          >
                            <option value="">Select Seat</option>
                            {seats.map((seat) => (
                              <option key={seat} value={seat}>
                                {seat}
                              </option>
                            ))}
                          </select>
                        </InputWrapper>
                      </>
                    ) : (
                      <>
                        <InputWrapper label="Building Name">
                          <input
                            type="text"
                            name="building_name"
                            placeholder="e.g. Tower A"
                            value={formData.building_name}
                            onChange={handleChange}
                            className="form-input-custom"
                          />
                        </InputWrapper>

                        <InputWrapper label="Floor Number">
                          <input
                            type="number"
                            name="floor_number"
                            placeholder="e.g. 2"
                            value={formData.floor_number}
                            onChange={handleChange}
                            className="form-input-custom"
                          />
                        </InputWrapper>

                        <InputWrapper label="Extension">
                          <input
                            type="number"
                            name="extension"
                            placeholder="e.g. 101"
                            value={formData.extension}
                            onChange={handleChange}
                            className="form-input-custom"
                          />
                        </InputWrapper>

                        <InputWrapper label="Seat Number">
                          <input
                            type="text"
                            name="seat_number"
                            placeholder="e.g. Seat-34"
                            value={formData.seat_number}
                            onChange={handleChange}
                            className="form-input-custom"
                          />
                        </InputWrapper>
                      </>
                    )}
                  </div>
                </div>

                {/* Present Address */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                      <FaMapMarkerAlt size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      📍 Present Address
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <InputWrapper label="Address Line 1">
                        <input
                          type="text"
                          name="present_address1"
                          placeholder="House No, Building, Street"
                          value={formData.present_address1}
                          onChange={handleChange}
                          className="form-input-custom"
                        />
                      </InputWrapper>
                    </div>

                    <div className="col-span-2">
                      <InputWrapper label="Address Line 2">
                        <input
                          type="text"
                          name="present_address2"
                          placeholder="Locality, Area, Landmark"
                          value={formData.present_address2}
                          onChange={handleChange}
                          className="form-input-custom"
                        />
                      </InputWrapper>
                    </div>

                    <InputWrapper label="City">
                      <input
                        type="text"
                        name="present_city"
                        value={formData.present_city}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="State">
                      <input
                        type="text"
                        name="present_state"
                        value={formData.present_state}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="Country">
                      <input
                        type="text"
                        name="present_country"
                        value={formData.present_country}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="Pincode">
                      <input
                        type="text"
                        name="present_pincode"
                        value={formData.present_pincode}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>
                  </div>
                </div>

                {/* Permanent Address */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                        <FaBuilding size={12} />
                      </div>
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        🏠 Permanent Address
                      </h3>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sameAsPresent}
                        onChange={(e) => setSameAsPresent(e.target.checked)}
                        className="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 h-4 w-4 transition-all duration-200"
                      />
                      Same as Present Address
                    </label>
                  </div>

                  {!sameAsPresent && (
                    <div className="grid md:grid-cols-2 gap-4 animate-in slide-in-from-top-1 duration-200">
                      <div className="col-span-2">
                        <InputWrapper label="Address Line 1">
                          <input
                            type="text"
                            name="permanent_address1"
                            value={formData.permanent_address1}
                            onChange={handleChange}
                            className="form-input-custom"
                          />
                        </InputWrapper>
                      </div>

                      <div className="col-span-2">
                        <InputWrapper label="Address Line 2">
                          <input
                            type="text"
                            name="permanent_address2"
                            value={formData.permanent_address2}
                            onChange={handleChange}
                            className="form-input-custom"
                          />
                        </InputWrapper>
                      </div>

                      <InputWrapper label="City">
                        <input
                          type="text"
                          name="permanent_city"
                          value={formData.permanent_city}
                          onChange={handleChange}
                          className="form-input-custom"
                        />
                      </InputWrapper>

                      <InputWrapper label="State">
                        <input
                          type="text"
                          name="permanent_state"
                          value={formData.permanent_state}
                          onChange={handleChange}
                          className="form-input-custom"
                        />
                      </InputWrapper>

                      <InputWrapper label="Country">
                        <input
                          type="text"
                          name="permanent_country"
                          value={formData.permanent_country}
                          onChange={handleChange}
                          className="form-input-custom"
                        />
                      </InputWrapper>

                      <InputWrapper label="Pincode">
                        <input
                          type="text"
                          name="permanent_pincode"
                          value={formData.permanent_pincode}
                          onChange={handleChange}
                          className="form-input-custom"
                        />
                      </InputWrapper>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 4. KYC & DOCUMENTS TAB */}
            {activeTab === "documents" && (
              <div className="space-y-6 animate-in fade-in duration-300">

                {/* Government registration IDs */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                      <FaIdCard size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      🔑 Government Identification Numbers
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    <InputWrapper label="Aadhaar Card Number">
                      <input
                        type="text"
                        name="aadhaar_number"
                        placeholder="12-digit UID"
                        maxLength="12"
                        value={formData.aadhaar_number}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="PAN Card Number">
                      <input
                        type="text"
                        name="pan_number"
                        placeholder="10-digit Alphanumeric"
                        maxLength="10"
                        value={formData.pan_number}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="Voter ID Card Number">
                      <input
                        type="text"
                        name="voter_id"
                        placeholder="Voter Card Identification"
                        value={formData.voter_id}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="Passport Number">
                      <input
                        type="text"
                        name="passport_number"
                        placeholder="Passport Number"
                        value={formData.passport_number}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="UAN Number">
                      <input
                        type="text"
                        name="uan_number"
                        placeholder="Universal Account Number"
                        value={formData.uan_number}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>

                    <InputWrapper label="PF Number">
                      <input
                        type="text"
                        name="pf_number"
                        placeholder="Provident Fund Number"
                        value={formData.pf_number}
                        onChange={handleChange}
                        className="form-input-custom"
                      />
                    </InputWrapper>
                  </div>
                </div>

                {/* Uploaded files grid */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                      <FaCloudUploadAlt size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      📎 Upload Document Attachments
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <DocumentUploadCard
                      label="Aadhar Card Document"
                      name="aadhar_card"
                      file={formData.aadhar_card}
                      onChange={handleChange}
                      onClear={handleClearFile}
                    />

                    <DocumentUploadCard
                      label="PAN Card Document"
                      name="pan_card"
                      file={formData.pan_card}
                      onChange={handleChange}
                      onClear={handleClearFile}
                    />

                    <DocumentUploadCard
                      label="Passport Document"
                      name="passport"
                      file={formData.passport}
                      onChange={handleChange}
                      onClear={handleClearFile}
                    />

                    <DocumentUploadCard
                      label="Voter ID Document"
                      name="voter_card"
                      file={formData.voter_card}
                      onChange={handleChange}
                      onClear={handleClearFile}
                    />

                    {/* Signature Uploader */}
                    {(() => {
                      const rName = roles.find((r) => String(r.id) === String(formData.role_id))?.role_name?.toLowerCase() || "";
                      const isRequired = rName.includes("hr") || rName.includes("ceo");
                      return (
                        <DocumentUploadCard
                          label={`Signature Document ${isRequired ? "*" : "(Optional)"}`}
                          name="signatures"
                          file={formData.signatures}
                          onChange={handleChange}
                          onClear={handleClearFile}
                        />
                      );
                    })()}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Footer controls */}
          <div className="border-t border-slate-100 px-8 py-5 flex justify-end gap-3 bg-white shrink-0 shadow-inner">
            <button
              type="button"
              onClick={onClose}
              className="
                px-6 py-3
                border border-slate-200
                rounded-2xl
                text-slate-600
                font-extrabold
                text-xs
                bg-slate-50
                hover:bg-slate-100
                transition-all
                cursor-pointer
              "
            >
              Cancel
            </button>

            {activeTab !== "documents" ? (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === "personal") handleTabChange("job");
                  else if (activeTab === "job") handleTabChange("address");
                  else if (activeTab === "address") handleTabChange("documents");
                }}
                className="
                  px-6 py-3
                  rounded-2xl
                  bg-slate-900
                  text-white
                  font-extrabold
                  text-xs
                  hover:bg-slate-800
                  transition-all
                  cursor-pointer
                "
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="
                  px-6 py-3
                  rounded-2xl
                  bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d]
                  text-white
                  font-extrabold
                  text-xs
                  hover:scale-[1.03]
                  transition-all
                  duration-300
                  shadow-lg
                  cursor-pointer
                "
              >
                {isEdit ? "Update Details" : "Create Profile"}
              </button>
            )}
          </div>

        </form>

      </div>

      {/* Styled inline components styles */}
      <style>{`
        .form-input-custom {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          color: #1e293b;
          outline: none;
          background-color: #ffffff;
          transition: all 0.2s ease-in-out;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
        }
        .form-input-custom:hover {
          border-color: #cbd5e1;
          background-color: #f8fafc;
        }
        .form-input-custom:focus {
          border-color: #4f46e5;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .form-select-custom {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          color: #1e293b;
          outline: none;
          background-color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
        }
        .form-select-custom:hover {
          border-color: #cbd5e1;
          background-color: #f8fafc;
        }
        .form-select-custom:focus {
          border-color: #4f46e5;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .form-textarea-custom {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 13px;
          color: #1e293b;
          outline: none;
          background-color: #ffffff;
          transition: all 0.2s ease-in-out;
          resize: none;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
        }
        .form-textarea-custom:hover {
          border-color: #cbd5e1;
          background-color: #f8fafc;
        }
        .form-textarea-custom:focus {
          border-color: #4f46e5;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  );
}

// Sub-Component to wrap inputs with nice labels
function InputWrapper({ label, children, required = false }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[11px] font-bold text-slate-500 block select-none">
        {label} {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      {children}
    </div>
  );
}

// Sub-Component for custom styled file input cards with preview and clear
function DocumentUploadCard({ label, name, file, onChange, onClear }) {
  const isUploaded = !!file;
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (file instanceof File) {
      if (file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    } else if (typeof file === "string") {
      setPreviewUrl(file);
    }
  }, [file]);

  const isPdf = file instanceof File
    ? file.type === "application/pdf"
    : typeof file === "string" && (file.startsWith("data:application/pdf") || file.toLowerCase().endsWith(".pdf"));

  const docColorMap = {
    aadhar_card: {
      title: "Aadhaar Card",
      accent: "indigo",
      bg: "bg-gradient-to-br from-indigo-50/50 to-blue-50/30",
      border: "border-indigo-100",
      text: "text-indigo-600",
      glow: "group-hover:border-indigo-400 group-hover:shadow-indigo-100/50",
    },
    pan_card: {
      title: "PAN Card",
      accent: "teal",
      bg: "bg-gradient-to-br from-teal-50/50 to-emerald-50/30",
      border: "border-teal-100",
      text: "text-teal-600",
      glow: "group-hover:border-teal-400 group-hover:shadow-teal-100/50",
    },
    passport: {
      title: "Passport",
      accent: "sky",
      bg: "bg-gradient-to-br from-sky-50/50 to-cyan-50/30",
      border: "border-sky-100",
      text: "text-sky-600",
      glow: "group-hover:border-sky-400 group-hover:shadow-sky-100/50",
    },
    voter_card: {
      title: "Voter ID Card",
      accent: "purple",
      bg: "bg-gradient-to-br from-purple-50/50 to-fuchsia-50/30",
      border: "border-purple-100",
      text: "text-purple-600",
      glow: "group-hover:border-purple-400 group-hover:shadow-purple-100/50",
    },
    signatures: {
      title: "Signature",
      accent: "rose",
      bg: "bg-gradient-to-br from-rose-50/50 to-pink-50/30",
      border: "border-rose-100",
      text: "text-rose-600",
      glow: "group-hover:border-rose-400 group-hover:shadow-rose-100/50",
    },
  };

  const style = docColorMap[name] || {
    title: "Document",
    accent: "indigo",
    bg: "bg-gradient-to-br from-indigo-50/50 to-blue-50/30",
    border: "border-indigo-100",
    text: "text-indigo-600",
    glow: "group-hover:border-indigo-400 group-hover:shadow-indigo-100/50",
  };

  return (
    <div className="space-y-2 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
        {label}
      </label>
      <div
        className={`
          relative border-2 border-dashed rounded-[2rem] p-6
          flex flex-col items-center justify-center gap-3
          transition-all duration-300 min-h-[220px] shadow-sm group overflow-hidden
          ${isUploaded
            ? "border-emerald-300 bg-gradient-to-br from-emerald-50/40 to-teal-50/20"
            : `border-slate-200/80 ${style.bg} ${style.glow} hover:shadow-lg`
          }
        `}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          name={name}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          accept=".pdf,.jpeg,.jpg,.png"
        />

        {isUploaded ? (
          <div className="flex flex-col items-center text-center gap-3 w-full z-20">
            {/* Larger, modern preview */}
            <div className="relative w-full max-w-[240px] aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-100/50 bg-slate-50 flex items-center justify-center">
              {previewUrl && !isPdf ? (
                <img
                  src={previewUrl}
                  alt={label}
                  className="h-full w-full object-cover"
                />
              ) : isPdf ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">📄</span>
                  <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold">
                    PDF Document
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl text-slate-400">🖼️</span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Document Image
                  </span>
                </div>
              )}
              <span className="absolute top-2 right-2 h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md border-2 border-white animate-pulse">
                ✓
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 max-w-[220px] truncate mx-auto">
                {file instanceof File ? file.name : `${style.title} Attached`}
              </p>
              <p className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider mt-0.5">
                Secured Cloud Storage
              </p>
            </div>

            {/* Action Links */}
            <div className="flex gap-2 mt-1 relative z-30">
              {(typeof file === "string" || (file instanceof File && previewUrl)) && (
                <a
                  href={typeof file === "string" ? file : previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-extrabold hover:bg-slate-800 transition shadow-sm cursor-pointer z-30 flex items-center gap-1.5"
                >
                  👁️ View Full
                </a>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClear(name);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-rose-100 text-rose-600 text-[10px] font-extrabold hover:bg-rose-50 hover:border-rose-200 transition shadow-sm cursor-pointer z-30 flex items-center gap-1.5"
              >
                <FaTrashAlt size={8} /> Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3">
            <div className={`p-4 rounded-2xl bg-white border border-slate-100/80 ${style.text} shadow-sm group-hover:scale-110 transition duration-300`}>
              <FaCloudUploadAlt size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Upload {style.title}</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] font-medium leading-relaxed">
                Drag & drop or click to upload verification file (PDF/Image)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}