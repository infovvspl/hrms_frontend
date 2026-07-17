import { FaTimes, FaFileAlt, FaExternalLinkAlt, FaUser, FaBriefcase, FaMapMarkerAlt, FaIdCard, FaUserTie, FaDownload } from "react-icons/fa";
import axios from "axios";
import { formatEmployeeId } from "../../utils/format";
import { getEmployeeAvatarSrc } from "../../utils/companyLogo";


export default function EmployeeViewModal({
  employee,
  onClose,
  employees = [], // passed in order to find reporting manager's name
}) {
  if (!employee) return null;

  // Helper to extract initials from employee name
  const getInitials = (name) => {
    if (!name) return "EE";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper to assign nice pastel background gradients based on name hash
  const getAvatarGradient = (name) => {
    const gradients = [
      "from-blue-400 to-indigo-500",
      "from-emerald-400 to-teal-500",
      "from-purple-400 to-violet-500",
      "from-rose-400 to-pink-500",
      "from-amber-400 to-orange-500",
      "from-cyan-400 to-blue-500",
    ];
    let hash = 0;
    const cleanName = name || "";
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const getEmploymentTypeName = (type) => {
    const list = {
      "1": "Full-Time",
      "2": "Part-Time",
      "3": "Contract",
      "4": "Internship",
      "5": "Freelance",
      "6": "Temporary",
      "7": "Probation",
    };
    return list[type.toString()] || type || "Full-Time";
  };

  // Find manager name
  const manager = employees.find((e) => e.id == employee.reporting_manager);
  const managerName = manager ? manager.name : employee.reporting_manager ? `ID #${employee.reporting_manager}` : "-";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] w-full max-w-5xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 py-5 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                Employee Profile Details
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Full database record for the employee
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 hover:bg-red-500 hover:rotate-90 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Container (Scrollable) */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50/30">

          {/* Top Profile Summary Badge */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            {/* Profile Pic */}
            <div>
              {employee.image ? (
                <img
                  src={getEmployeeAvatarSrc(employee.image)}
                  alt={employee.name}
                  className="h-24 w-24 rounded-3xl object-cover shadow-md border-2 border-white"
                />
              ) : (
                <div
                  className={`
                    h-24 w-24
                    rounded-3xl
                    bg-gradient-to-br ${getAvatarGradient(employee.name)}
                    flex items-center justify-center
                    text-white
                    text-3xl
                    font-bold
                    shadow-md
                    border-2 border-white
                  `}
                >
                  {getInitials(employee.name)}
                </div>
              )}
            </div>

            {/* Profile Title Text */}
            <div className="text-center md:text-left space-y-1.5 flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-800">
                  {employee.first_name} {employee.middle_name} {employee.last_name}
                </h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {formatEmployeeId(employee.company_name, employee.company_employee_id, employee.id)}
                </span>
              </div>

              <p className="text-slate-500 font-semibold text-xs">
                {employee.designation_name || employee.designation_title || "No Designation"} • {employee.department_name || "No Department"}
              </p>

              <p className="text-slate-400 font-medium text-xs">
                {employee.email || "No email listed"}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1.5">
                <span
                  className={`
                    inline-flex items-center gap-1.5
                    px-2.5 py-0.5
                    rounded-full
                    text-[10px]
                    font-bold
                    border
                    ${employee.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : employee.status === "On Leave"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-rose-50 text-rose-700 border-rose-100"
                    }
                  `}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${employee.status === "Active"
                      ? "bg-emerald-500"
                      : employee.status === "On Leave"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                      }`}
                  />
                  {employee.status || "Active"}
                </span>

                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {getEmploymentTypeName(employee.employment_type || "1")}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Layout of Data Card Panels */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* 1. Personal Details */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
              <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <FaUser className="text-indigo-500" size={13} />
                Personal Profile
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <InfoItem label="First Name" value={employee.first_name} />
                <InfoItem label="Last Name" value={employee.last_name} />
                <InfoItem label="Middle Name" value={employee.middle_name} />
                <InfoItem label="Gender" value={employee.gender} />
                <InfoItem label="Marital Status" value={employee.marital_status} />
                <InfoItem label="Personal Mobile" value={employee.mobile} />
                <InfoItem label="Personal Email" value={employee.email} />
                <InfoItem
                  label="Date of Birth"
                  value={
                    employee.dob
                      ? new Date(employee.dob).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      : null
                  }
                />
              </div>
            </div>

            {/* 2. Employment & Org Info */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
              <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <FaBriefcase className="text-indigo-500" size={13} />
                Job & Organization
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <InfoItem label="Branch Location" value={employee.branch_name} />
                <InfoItem label="Department" value={employee.department_name} />
                <InfoItem label="Designation" value={employee.designation_name || employee.designation_title} />
                <InfoItem label="Security Role" value={employee.role_name} />
                <InfoItem label="Work Email" value={employee.work_email} />
                <InfoItem label="Work Phone / Ext" value={employee.work_phone_number} />
                <InfoItem label="Reporting Manager" value={managerName} />
                <InfoItem label="Area of Expertise" value={employee.area_of_expertise} />
                <InfoItem
                  label="Date of Joining"
                  value={
                    employee.doj
                      ? new Date(employee.doj).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      : null
                  }
                />
                <InfoItem
                  label="Date of Exit (DOE)"
                  value={
                    employee.doe ? (
                      new Date(employee.doe).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Present
                      </span>
                    )
                  }
                />
                <InfoItem label="Current Experience" value={employee.current_experience ? `${employee.current_experience} yrs` : null} />
                <InfoItem label="Total Experience" value={employee.total_experience ? `${employee.total_experience} yrs` : null} />
              </div>
            </div>

            {/* 3. Address details */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
              <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-indigo-500" size={13} />
                Addresses
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Present Address
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    {[
                      employee.present_address1,
                      employee.present_address2,
                      employee.present_city,
                      employee.present_state,
                      employee.present_country,
                      employee.present_pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No present address listed"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Permanent Address
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    {[
                      employee.permanent_address1,
                      employee.permanent_address2,
                      employee.permanent_city,
                      employee.permanent_state,
                      employee.permanent_country,
                      employee.permanent_pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No permanent address listed"}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Office seating & KYC Numbers */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
              <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <FaIdCard className="text-indigo-500" size={13} />
                Office Desk & KYC Info
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <InfoItem label="Building" value={employee.building_display_name || employee.building_name} />
                <InfoItem label="Floor" value={employee.floor_display_name || employee.floor_number} />
                <InfoItem label="Extension" value={employee.extension_display_number || employee.extension} />
                <InfoItem label="Seat Number" value={employee.seat_display_number || employee.seat_number} />

                <div className="col-span-2 border-t border-slate-50 pt-3 mt-1 grid grid-cols-2 gap-y-4">
                  <InfoItem label="Aadhaar Number" value={employee.aadhaar_number} />
                  <InfoItem label="PAN Card Number" value={employee.pan_number} />
                  <InfoItem label="Voter ID Card" value={employee.voter_id} />
                  <InfoItem label="Passport Number" value={employee.passport_number} />
                  <InfoItem label="UAN Number" value={employee.uan_number} />
                  <InfoItem label="PF Number" value={employee.pf_number} />
                </div>
              </div>
            </div>

          </div>

          {/* Document Section */}
          <div className="space-y-4">
            <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block" />
              Uploaded Documents Attachments
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {employee.resume && (
                <DocumentCard title="Resume" fileUrl={`http://localhost:5000${employee.resume}`} />
              )}
              <DocumentCard title="Aadhar Card" fileUrl={employee.aadhar_card} />
              <DocumentCard title="PAN Card" fileUrl={employee.pan_card} />
              <DocumentCard title="Passport" fileUrl={employee.passport} />
              <DocumentCard title="Voter ID Card" fileUrl={employee.voter_card} />
              <DocumentCard title="Offer Letter" fileUrl={employee.offer_letter} employeeId={employee.id} docType="offer" />
              <DocumentCard title="Experience Letter" fileUrl={employee.experience_letter} employeeId={employee.id} docType="experience" />
              <DocumentCard title="Relieving Letter" fileUrl={employee.relieveing_letter} employeeId={employee.id} docType="relieving" />
              <DocumentCard title="Termination Letter" fileUrl={employee.termination_letter} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-8 py-5 flex justify-end bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="
              bg-slate-900
              text-white
              font-semibold
              px-6 py-2.5
              rounded-xl
              hover:bg-slate-800
              transition-all
              duration-200
              shadow-lg shadow-slate-900/10
              cursor-pointer
            "
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}

// Reusable Info Display Sub-Component
function InfoItem({ label, value }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xs font-semibold text-slate-700 truncate">
        {value !== undefined && value !== null && value !== "" ? value : "-"}
      </p>
    </div>
  );
}

// Reusable Document Link Card Sub-Component
function DocumentCard({ title, fileUrl, employeeId, docType }) {
  const isUploaded = !!fileUrl;

  console.log("fileUrl", fileUrl)
  const handleView = () => {
    if (fileUrl.startsWith("data:text/html;base64,")) {
      const base64 = fileUrl.substring("data:text/html;base64,".length);
      try {
        const decoded = atob(base64);
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(decoded);
          win.document.close();
        }
      } catch (e) {
        console.error("Failed to open base64 document", e);
      }
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div className="border border-slate-100 rounded-2xl p-4 bg-white flex flex-col justify-between gap-3 group hover:border-indigo-100 transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`p-2.5 rounded-xl border ${isUploaded ? "bg-indigo-50 border-indigo-100 text-indigo-650" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
          <FaFileAlt size={16} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700 font-sans">
            {title}
          </p>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${isUploaded ? "text-emerald-600" : "text-slate-400"}`}>
            {isUploaded ? "Uploaded" : "Missing"}
          </span>
        </div>
      </div>

      {isUploaded ? (
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleView}
            className="
              inline-flex items-center gap-1
              text-[11px]
              font-bold
              text-indigo-650
              hover:text-indigo-850
              transition-colors
              bg-transparent
              border-none
              p-0
              cursor-pointer
              text-left
            "
          >
            View
            <FaExternalLinkAlt size={8} />
          </button>
          <span className="text-slate-350 text-[10px] font-normal">|</span>
          <button
            onClick={() => downloadFile(fileUrl, title.replace(/\s+/g, '_'), employeeId, docType)}
            className="
              inline-flex items-center gap-1
              text-[11px]
              font-bold
              text-emerald-600
              hover:text-emerald-700
              transition-colors
              bg-transparent
              border-none
              p-0
              cursor-pointer
              text-left
            "
          >
            Download
            <FaDownload size={8} />
          </button>
        </div>
      ) : (
        <span className="text-[11px] font-medium text-slate-400 mt-1">
          Not uploaded
        </span>
      )}
    </div>
  );
}

// Unified file downloader helper matching profile/drawer standards
const downloadFile = async (dataUrl, baseName, employeeId = null, docType = "offer") => {
  if (!dataUrl) return;

  if (dataUrl.startsWith("data:text/html;base64,") || (employeeId && docType)) {
    if (employeeId && docType) {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        let downloadEndpoint = `http://localhost:5000/api/employees/${employeeId}/download-offer-letter`;
        if (docType === "experience") {
          downloadEndpoint = `http://localhost:5000/api/employees/${employeeId}/download-experience-letter`;
        } else if (docType === "relieving") {
          downloadEndpoint = `http://localhost:5000/api/employees/${employeeId}/download-relieving-letter`;
        }

        const response = await axios.get(
          downloadEndpoint,
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

    const base64 = dataUrl.substring("data:text/html;base64,".length);
    try {
      const decodedHtml = atob(base64);

      const opt = {
        margin: 0,
        filename: `${baseName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          width: 800,
          height: 1120,
          windowWidth: 800,
          windowHeight: 1120,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const generatePdf = () => {
        const iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.width = "800px";
        iframe.style.height = "1120px";
        iframe.style.left = "-9999px";
        iframe.style.top = "-9999px";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        iframe.onload = () => {
          const render = () => {
            const targetElement = iframe.contentDocument.querySelector(".container") || iframe.contentDocument.body;
            window.html2pdf()
              .set(opt)
              .from(targetElement)
              .save()
              .then(() => {
                document.body.removeChild(iframe);
              })
              .catch((err) => {
                console.error("PDF generation failed:", err);
                document.body.removeChild(iframe);
              });
          };

          // Wait for styles and web fonts to fully load inside the rendering context
          if (iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.fonts) {
            iframe.contentWindow.document.fonts.ready.then(() => {
              setTimeout(render, 500);
            }).catch(() => {
              setTimeout(render, 500);
            });
          } else {
            setTimeout(render, 500);
          }
        };

        iframe.srcdoc = decodedHtml;
      };

      if (window.html2pdf) {
        generatePdf();
      } else {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = generatePdf;
        document.body.appendChild(script);
      }
      return;
    } catch (e) {
      console.error("Failed to decode and convert base64 HTML to PDF", e);
    }
  }

  let extension = "pdf";
  if (dataUrl.startsWith("data:")) {
    const mime = dataUrl.split(";")[0].split(":")[1];
    if (mime === "image/png") extension = "png";
    else if (mime === "image/jpeg" || mime === "image/jpg") extension = "jpg";
    else if (mime === "text/html") extension = "html";
  } else {
    const parts = dataUrl.split(".");
    if (parts.length > 1) {
      extension = parts.pop().split("?")[0];
    }
  }

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${baseName}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};