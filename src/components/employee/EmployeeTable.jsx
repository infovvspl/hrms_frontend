import {
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { formatEmployeeId } from "../../utils/format";
import { getEmployeeAvatarSrc } from "../../utils/companyLogo";

export default function EmployeeTable({
  employees = [],
  onView,
  onEdit,
  onDelete,
}) {

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

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">

      {/* Table Header Section */}
      <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-white text-lg font-extrabold tracking-tight">
            Employee Directory
          </h2>
          <p className="text-slate-300 text-xs mt-0.5 font-medium">
            Manage your organization workforce
          </p>
        </div>
        <span className="bg-white/10 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-white/20">
          {employees.length} Active Employees
        </span>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left sticky-table">

          {/* Header Row */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {[
                "Employee ID",
                "First Name",
                "Middle Name",
                "Last Name",
                "Email",
                "Work Email",
                "Mobile",
                "Work Phone",
                "Branch",
                "Department",
                "Designation",
                "Role",
                "Employment Type",
                "DOB",
                "DOJ",
                "DOE",
                "Gender",
                "Marital Status",
                "Present Address",
                "Permanent Address",
                "Aadhaar Number",
                "PAN Number",
                "Voter ID",
                "Passport Number",
                "UAN Number",
                "PF Number",
                "Current Exp",
                "Total Exp",
                "Reporting Manager",
                "Office Allocation",
                "Area of Expertise",
                "Status",
                "Actions",
              ].map((head, i) => {
                let stickyClass = "";
                let padClass = "px-6";
                if (i === 0) {
                  stickyClass = "sticky left-0 z-30 bg-slate-50 border-r border-slate-100/50 w-[140px] min-w-[140px] max-w-[140px]";
                  padClass = "px-4";
                } else if (i === 1) {
                  stickyClass = "sticky left-[140px] z-30 bg-slate-50 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]";
                }

                return (
                  <th
                    key={head}
                    className={`${padClass} py-4 text-slate-700 uppercase tracking-wider text-[11px] font-semibold whitespace-nowrap ${stickyClass}`}
                  >
                    {head}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-slate-50/50 transition-colors duration-200 group"
                >
                  {/* Employee ID with Avatar */}
                  <td className="px-4 py-4 sticky left-0 z-20 bg-white group-hover:bg-slate-50 transition-colors duration-200 border-r border-slate-100/50 w-[140px] min-w-[140px] max-w-[140px] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {employee.image ? (
                          <img
                            src={getEmployeeAvatarSrc(employee.image)}
                            alt={employee.name}
                            className="h-8 w-8 rounded-full object-cover shadow-sm border border-slate-100"
                          />
                        ) : (
                          <div
                            className={`
                              h-8 w-8
                              rounded-full
                              bg-gradient-to-br ${getAvatarGradient(employee.name)}
                              flex items-center justify-center
                              text-white
                              text-[10px]
                              font-bold
                              shadow-sm
                            `}
                          >
                            {getInitials(employee.name)}
                          </div>
                        )}
                      </div>

                      {/* ID */}
                      <span className="font-bold text-slate-700 text-xs">
                        {formatEmployeeId(employee.company_name, employee.company_employee_id, employee.id)}
                      </span>
                    </div>
                  </td>

                  {/* First Name */}
                  <td className="px-6 py-4 sticky left-[140px] z-20 bg-white group-hover:bg-slate-50 transition-colors duration-200 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)] text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.first_name || "-"}
                  </td>

                  {/* Middle Name */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.middle_name || "-"}
                  </td>

                  {/* Last Name */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.last_name || "-"}
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.email || "-"}
                  </td>

                  {/* Work Email */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.work_email || "-"}
                  </td>

                  {/* Mobile */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.mobile || "-"}
                  </td>

                  {/* Work Phone */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.work_phone_number || "-"}
                  </td>

                  {/* Branch */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.branch_name || "-"}
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.department_name || "-"}
                  </td>

                  {/* Designation */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.designation_name || employee.designation_title || "-"}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.role_name || "-"}
                  </td>

                  {/* Employment Type */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.employment_type_name ||
                      (employee.employment_type === 1 || employee.employment_type === "1" ? "Full-Time" :
                        employee.employment_type === 2 || employee.employment_type === "2" ? "Part-Time" :
                          employee.employment_type === 3 || employee.employment_type === "3" ? "Contract" :
                            employee.employment_type === 4 || employee.employment_type === "4" ? "Internship" :
                              employee.employment_type === 5 || employee.employment_type === "5" ? "Freelance" :
                                employee.employment_type === 6 || employee.employment_type === "6" ? "Temporary" :
                                  employee.employment_type === 7 || employee.employment_type === "7" ? "Probation" :
                                    employee.employment_type || "-")}
                  </td>

                  {/* DOB */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.dob
                      ? new Date(employee.dob).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      : "-"}
                  </td>

                  {/* DOJ */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.doj
                      ? new Date(employee.doj).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      : "-"}
                  </td>

                  {/* DOE */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.doe ? (
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
                    )}
                  </td>

                  {/* Gender */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.gender || "-"}
                  </td>

                  {/* Marital Status */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.marital_status || "-"}
                  </td>

                  {/* Present Address */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {(employee.present_address1 || employee.present_city || employee.present_state || employee.present_pincode) ? (
                      <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {[
                          employee.present_address1,
                          employee.present_address2,
                          employee.present_city,
                          employee.present_state,
                          employee.present_country,
                          employee.present_pincode,
                        ].filter(Boolean).join(", ")}
                      </span>
                    ) : "-"}
                  </td>

                  {/* Permanent Address */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {(employee.permanent_address1 || employee.permanent_city || employee.permanent_state || employee.permanent_pincode) ? (
                      <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {[
                          employee.permanent_address1,
                          employee.permanent_address2,
                          employee.permanent_city,
                          employee.permanent_state,
                          employee.permanent_country,
                          employee.permanent_pincode,
                        ].filter(Boolean).join(", ")}
                      </span>
                    ) : "-"}
                  </td>

                  {/* Aadhaar */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.aadhaar_number || "-"}
                  </td>

                  {/* PAN */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.pan_number || "-"}
                  </td>

                  {/* Voter ID */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.voter_id || "-"}
                  </td>

                  {/* Passport */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.passport_number || "-"}
                  </td>

                  {/* UAN */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.uan_number || "-"}
                  </td>

                  {/* PF Number */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.pf_number || "-"}
                  </td>

                  {/* Current Experience */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.current_experience !== undefined && employee.current_experience !== null ? `${employee.current_experience} yrs` : "-"}
                  </td>

                  {/* Total Experience */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.total_experience !== undefined && employee.total_experience !== null ? `${employee.total_experience} yrs` : "-"}
                  </td>

                  {/* Reporting Manager */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.reporting_manager_name || employee.reporting_manager || "-"}
                  </td>

                  {/* Office Allocation */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {(employee.building_display_name || employee.building_name || employee.floor_display_name || employee.floor_number || employee.seat_display_number || employee.seat_number || employee.extension_display_number || employee.extension) ? (
                      <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {[
                          employee.building_display_name || employee.building_name ? `Bldg ${employee.building_display_name || employee.building_name}` : null,
                          employee.floor_display_name || employee.floor_number ? `Fl ${employee.floor_display_name || employee.floor_number}` : null,
                          employee.seat_display_number || employee.seat_number ? `St ${employee.seat_display_number || employee.seat_number}` : null,
                          employee.extension_display_number || employee.extension ? `Ext ${employee.extension_display_number || employee.extension}` : null,
                        ].filter(Boolean).join(", ")}
                      </span>
                    ) : "-"}
                  </td>

                  {/* Area of Expertise */}
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                    {employee.area_of_expertise || "-"}
                  </td>

                  {/* Status Pill Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`
                        inline-flex items-center gap-1.5
                        px-2.5 py-1
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
                  </td>


                  {/* Actions buttons */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onView(employee)}
                        className="
                          p-2
                          rounded-xl
                          bg-slate-50
                          text-slate-500
                          hover:bg-indigo-50
                          hover:text-indigo-600
                          border border-slate-100
                          hover:border-indigo-100
                          transition-all
                          duration-200
                          cursor-pointer
                        "
                        title="View Profile"
                      >
                        <FaEye size={13} />
                      </button>

                      <button
                        onClick={() => onEdit(employee)}
                        className="
                          p-2
                          rounded-xl
                          bg-slate-50
                          text-slate-500
                          hover:bg-amber-50
                          hover:text-amber-600
                          border border-slate-100
                          hover:border-amber-100
                          transition-all
                          duration-200
                          cursor-pointer
                        "
                        title="Edit Details"
                      >
                        <FaEdit size={13} />
                      </button>

                      <button
                        onClick={() => onDelete(employee.id)}
                        className="
                          p-2
                          rounded-xl
                          bg-slate-50
                          text-slate-500
                          hover:bg-rose-50
                          hover:text-rose-600
                          border border-slate-100
                          hover:border-rose-100
                          transition-all
                          duration-200
                          cursor-pointer
                        "
                        title="Delete Record"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">👥</span>
                    <p className="font-semibold text-slate-600">No Employees Found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
      <style>{`
        .sticky-table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
        }
        .sticky-table th {
          border-bottom: 1px solid #e2e8f0 !important; /* border-slate-200 */
        }
        .sticky-table td {
          border-bottom: 1px solid #f1f5f9 !important; /* border-slate-100 */
        }
      `}</style>
    </div>
  );
}