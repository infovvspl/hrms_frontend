import React, { useState, useRef, useEffect } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Search, 
  Users, 
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getEmployeeAvatarSrc } from "../../utils/companyLogo";

// ==========================================
// RECURSIVE TREE NODE COMPONENT
// ==========================================
function TreeNode({ 
  node, 
  employees, 
  expandedNodes, 
  toggleNode, 
  searchHighlightedId, 
  onView 
}) {
  const children = employees.filter(e => String(e.reporting_manager) === String(node.id));
  const isExpanded = expandedNodes[node.id] !== false; // default to expanded if not set
  const hasChildren = children.length > 0;
  const isHighlighted = String(node.id) === String(searchHighlightedId);

  // Count total reports recursively
  const countReports = (empId) => {
    const direct = employees.filter(e => String(e.reporting_manager) === String(empId));
    let total = direct.length;
    direct.forEach(d => {
      total += countReports(d.id);
    });
    return total;
  };

  const totalReportsCount = countReports(node.id);

  // Status-based colors
  const statusColors = {
    Active: { border: "border-emerald-200 hover:border-emerald-400 bg-white", dot: "bg-emerald-500" },
    "On Leave": { border: "border-amber-200 hover:border-amber-400 bg-white", dot: "bg-amber-500" },
    Inactive: { border: "border-rose-200 hover:border-rose-400 bg-white", dot: "bg-rose-500" },
  };
  const statusConfig = statusColors[node.status] || { border: "border-slate-200 hover:border-slate-400 bg-white", dot: "bg-slate-400" };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Employee Card */}
      <div 
        onClick={() => onView && onView(node)}
        className={`relative flex items-center gap-3 p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer w-[240px] ${
          isHighlighted 
            ? "border-indigo-600 ring-4 ring-indigo-500/20 scale-[1.03] shadow-[0_0_20px_rgba(99,102,241,0.25)] z-10" 
            : statusConfig.border
        }`}
      >
        {/* Glowing Pulse Effect for Highlighted */}
        {isHighlighted && (
          <span className="absolute -inset-0.5 rounded-2xl bg-indigo-600/10 animate-ping -z-10" />
        )}

        {/* Status Dot */}
        <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${statusConfig.dot}`} />

        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner overflow-hidden">
          {node.image ? (
            <img 
              src={getEmployeeAvatarSrc(node.image)} 
              alt={node.name} 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            node.name ? node.name.split(" ").map(w => w[0]).join("").toUpperCase() : "EE"
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 text-left">
          <p className="text-xs font-black text-slate-800 truncate leading-tight">{node.name}</p>
          <p className="text-[10px] font-bold text-indigo-600 mt-0.5 truncate">{node.designation_name || "Employee"}</p>
          <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">{node.department_name || "N/A"}</p>
          
          {totalReportsCount > 0 && (
            <div className="flex items-center gap-1 mt-1 text-[8.5px] font-bold text-slate-500">
              <Users size={9} />
              <span>{totalReportsCount} {totalReportsCount === 1 ? "Report" : "Reports"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Child tree connector lines */}
      {hasChildren && (
        <div className="flex flex-col items-center w-full mt-4">
          {/* Collapsible Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleNode(node.id);
            }}
            className="z-10 -mt-[11px] flex items-center justify-center w-5.5 h-5.5 rounded-full bg-slate-900 border border-slate-700 text-white hover:bg-indigo-600 hover:border-indigo-500 transition-colors shadow-md cursor-pointer text-xs font-black"
          >
            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          {isExpanded && (
            <>
              {/* Vertical line from parent card */}
              <div className="w-0.5 h-6 bg-slate-300" />

              {/* Children Row Container */}
              <div className="flex justify-center gap-6 relative px-4">
                {/* Horizontal row connector */}
                {children.length > 1 && (
                  <div 
                    className="absolute top-0 h-0.5 bg-slate-300" 
                    style={{
                      left: `${100 / (children.length * 2)}%`,
                      right: `${100 / (children.length * 2)}%`
                    }} 
                  />
                )}

                {children.map((child) => (
                  <div key={child.id} className="relative flex flex-col items-center">
                    {/* Vertical line into child */}
                    <div className="w-0.5 h-6 bg-slate-300" />
                    <TreeNode 
                      node={child} 
                      employees={employees} 
                      expandedNodes={expandedNodes} 
                      toggleNode={toggleNode}
                      searchHighlightedId={searchHighlightedId}
                      onView={onView}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAIN ORG TREE VIEW COMPONENT
// ==========================================
export default function OrgTree({ employees = [], onView }) {
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHighlightedId, setSearchHighlightedId] = useState(null);
  
  // Zoom & Pan states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const containerRef = useRef(null);

  // Fetch roots: employees with no reporting manager or whose reporting manager is not in list
  const roots = employees.filter(e => {
    if (!e.reporting_manager) return true;
    return !employees.some(emp => String(emp.id) === String(e.reporting_manager));
  });

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: prev[nodeId] === false ? true : false
    }));
  };

  // Dragging/Panning Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest(".cursor-pointer")) {
      return; // don't drag when interacting with buttons/inputs/cards
    }
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zooming handlers
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.15, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.15, 0.45));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Suggestions search list
  const matchingEmployees = searchQuery.trim()
    ? employees.filter(e => 
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.designation_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // When suggestion selected
  const handleSelectEmployee = (empId) => {
    const selected = employees.find(e => String(e.id) === String(empId));
    if (!selected) return;

    setSearchQuery(selected.name);
    setShowSuggestions(false);
    setSearchHighlightedId(empId);

    // Trace path to root and expand all managers
    const newExpanded = { ...expandedNodes };
    let current = selected;
    while (current && current.reporting_manager) {
      newExpanded[current.reporting_manager] = true;
      current = employees.find(e => String(e.id) === String(current.reporting_manager));
    }
    setExpandedNodes(newExpanded);

    // Recenter view on highlight
    setPosition({ x: 0, y: 100 });
    setScale(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchHighlightedId(null);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative flex flex-col w-full h-[650px] bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden"
    >
      {/* Floating Toolbar & Search */}
      <div className="absolute top-4 left-4 right-4 flex flex-col md:flex-row gap-3 justify-between items-center z-25 pointer-events-none">
        
        {/* Search Input Box */}
        <div className="relative w-full max-w-sm pointer-events-auto shadow-md rounded-2xl">
          <div className="flex items-center w-full relative bg-white rounded-2xl border border-slate-200 px-3 py-2.5">
            <Search className="text-slate-400 mr-2 shrink-0" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search employee in tree..."
              className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none bg-transparent"
            />
            {searchQuery && (
              <button 
                onClick={handleClearSearch}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && matchingEmployees.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto scrollbar-thin z-50">
              {matchingEmployees.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp.id)}
                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between text-left"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{emp.designation_name || "Employee"} • {emp.department_name || "N/A"}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                    emp.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"
                  }`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1 bg-white/95 border border-slate-200 p-1.5 rounded-2xl shadow-md pointer-events-auto select-none">
          <button 
            onClick={zoomIn} 
            className="p-2 rounded-xl text-slate-700 hover:text-indigo-650 hover:bg-slate-50 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          
          <span className="text-[10px] font-black text-slate-500 px-1.5 min-w-[36px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button 
            onClick={zoomOut} 
            className="p-2 rounded-xl text-slate-700 hover:text-indigo-650 hover:bg-slate-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button 
            onClick={resetView} 
            className="p-2 rounded-xl text-slate-700 hover:text-indigo-650 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title="Reset Pan & Zoom"
          >
            <RefreshCw size={14} />
            <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Floating Helper Tip */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/80 text-white/90 backdrop-blur-md px-3.5 py-2 rounded-full text-[10px] font-bold shadow-md select-none z-10">
        <HelpCircle size={12} className="text-indigo-400" />
        <span>Drag workspace to pan • Click card to view profile</span>
      </div>

      {/* Tree Work Area */}
      <div 
        className={`flex-1 overflow-hidden relative cursor-grab select-none ${isDragging ? "cursor-grabbing" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute origin-center transition-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
            top: "40px",
            left: "50%",
            transformOrigin: "top center",
          }}
        >
          {/* Tree Root Flex Wrapper */}
          <div className="relative flex flex-col items-center pb-24 -translate-x-1/2">
            <div className="flex gap-16 relative">
              {roots.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center font-bold text-slate-500 shadow-sm min-w-[300px]">
                  No organizational links found.
                  <p className="text-xs font-semibold text-slate-400 mt-2">
                    Make sure employees have reporting managers set.
                  </p>
                </div>
              ) : (
                roots.map(root => (
                  <TreeNode 
                    key={root.id}
                    node={root}
                    employees={employees}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    searchHighlightedId={searchHighlightedId}
                    onView={onView}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
