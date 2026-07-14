import React, { useState } from "react";
import { FaSearch, FaTimes, FaFileCsv, FaInfoCircle, FaFilter } from "react-icons/fa";

// ==========================================
// STATUS TABS COMPONENT
// ==========================================
export function EmployeeStatusTabs({
  status = "",
  setStatus,
  employees = [],
}) {
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
    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex items-center justify-between">
      <div className="flex flex-wrap gap-2 w-full">
        {statusTabs.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`
                px-5 py-3
                rounded-2xl
                text-xs
                font-bold
                transition-all
                duration-200
                flex items-center gap-2.5
                cursor-pointer
                border
                ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 scale-[1.02]"
                    : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                }
              `}
            >
              {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
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
        
        {/* Left Side: Search with help icon */}
        <div className="relative flex-1 min-w-[280px]">
          <div className="flex items-center w-full relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department, branch..."
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 pl-11 pr-20 py-3 rounded-2xl border border-slate-100 outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200 text-xs font-semibold shadow-sm focus:ring-4 focus:ring-indigo-500/5"
            />
            
            {/* Info and Clear controls */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                  title="Clear search"
                >
                  <FaTimes size={10} />
                </button>
              )}
              <div className="relative flex items-center">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                  aria-label="Search parameters"
                >
                  <FaInfoCircle size={14} />
                </button>
                {showTooltip && (
                  <div className="absolute right-0 bottom-full mb-2.5 w-64 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl shadow-xl z-50 pointer-events-none">
                    <p className="font-bold border-b border-white/10 pb-1 mb-1 text-[11px]">Search Fields Included:</p>
                    <ul className="list-disc pl-3.5 space-y-0.5 font-medium text-white/80">
                      <li>First, Middle & Last Names</li>
                      <li>Personal & Work Emails</li>
                      <li>Branch Location & Address</li>
                      <li>Department & Designation</li>
                      <li>Mobile/Work Phone numbers</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">
          
          {/* Department Filter */}
          <div className="relative w-full sm:w-44">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 text-slate-700 text-xs font-bold border border-slate-100 outline-none appearance-none cursor-pointer transition-all duration-200 focus:bg-white focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name || dept.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Branch Filter */}
          <div className="relative w-full sm:w-44">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 text-slate-700 text-xs font-bold border border-slate-100 outline-none appearance-none cursor-pointer transition-all duration-200 focus:bg-white focus:border-indigo-500"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branch_name || b.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Export to CSV */}
          <button
            onClick={onExportClick}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 rounded-2xl text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            title="Export directory records to CSV file"
          >
            <FaFileCsv className="text-emerald-600" size={14} />
            <span>Export CSV</span>
          </button>

          {/* Add New Employee */}
          <button
            onClick={onAddClick}
            className="w-full sm:w-auto bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] text-white font-bold px-5 py-3 rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>+ Add Employee</span>
          </button>

        </div>
      </div>

      {/* Active Filter Tags & Count Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 border-t border-slate-50 text-xs">

        {/* Active Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {hasActiveFilters && (
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mr-1.5 flex items-center gap-1">
              <FaFilter size={8} /> Active Filters:
            </span>
          )}

          {search && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-lg border border-indigo-100 text-[11px]">
              <span>Search: "{search}"</span>
              <button onClick={() => setSearch("")} className="hover:text-indigo-900 cursor-pointer flex items-center justify-center">
                <FaTimes size={8} />
              </button>
            </span>
          )}

          {selectedDepartment && (
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
