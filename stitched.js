export default function EmployeeFilters({
  departments = [],
  selectedDepartment,
  setSelectedDepartment,
  status,
  setStatus,
  employees = [],
}) {
  // Compute counts for status tabs based on all employees fetched
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === "Active").length;
  const leaveCount = employees.filter((e) => e.status === "On Leave").length;
  const inactiveCount = employees.filter((e) => e.status === "Inactive").length;

  const statusTabs = [
    { label: "All Employees", value: "", count: totalCount },
    { label: "Active", value: "Active", dot: "bg-emerald-500", count: activeCount },
    { label: "On Leave", value: "On Leave", dot: "bg-amber-500", count: leaveCount },
    { label: "Inactive", value: "Inactive", dot: "bg-rose-500", count: inactiveCount },
  ];

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-center justify-between">
      
      {/* Visual Tab Bar for Status Selection */}
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        {statusTabs.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`
                px-4 py-2.5
                rou
              <span>{tab.label}</span>
              <span className={`
                px-1.5 py-0.5 rounded-md text-[10px] font-extrabold
                ${isActive ? "bg-white/20 text-white" : "bg-slate-200/60 text-slate-500"}
              `}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// ACTION BAR COMPONENT (Search, dropdowns, export, add)
// ==========================================
export function EmployeeActionBar({
  search = "",
  setSearch,
  selectedDepartment = "",
  setSelectedDepartment,
  selectedBranch = "",
  setSelectedBranch,
  departments = [],
  branches = [],
  onAddClick,
  onExportClick,
  filteredCount = 0,
  totalCount = 0,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if any filter is active
  const hasActiveFilters = search || selectedDepartment || selectedBranch;

  const handleClearAll = () => {
    setSearch("");
    setSelectedDepartment("");
    setSelectedBranch("");
  };

  const getDepartmentName = (id) => {
    const dept = departments.find((d) => String(d.id) === String(id));
    return dept ? (dept.department_name || dept.title) : "";
  };

  const getBranchName = (id) => {
    const br = branches.find((b) => String(b.id) === String(id));
    return br ? (br.branch_name || br.name) : "";
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
        
        {/* Left Side: Search with hel
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-lg border border-indigo-100 text-[11px]">
              <span>Dept: {getDepartmentName(selectedDepartment)}</span>
              <button onClick={() => setSelectedDepartment("")} className="hover:text-indigo-900 cursor-pointer flex items-center justify-center">
                <FaTimes size={8} />
              </button>
            </span>
          )}

          {selectedBranch && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-lg border border-indigo-100 text-[11px]">
              <span>Branch: {getBranchName(selectedBranch)}</span>
              <button onClick={() => setSelectedBranch("")} className="hover:text-indigo-900 cursor-pointer flex items-center justify-center">
                <FaTimes size={8} />
              </button>
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline ml-1 cursor-pointer text-[11px]"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Dynamic Workforce Counter */}
        <div className="text-[11px] text-slate-400 font-semibold self-end">
          Showing <span className="text-slate-700 font-extrabold">{filteredCount}</span> of{" "}
          <span className="text-slate-700 font-extrabold">{totalCount}</span> registered personnel
        </div>
      </div>

    </div>
  );
}
