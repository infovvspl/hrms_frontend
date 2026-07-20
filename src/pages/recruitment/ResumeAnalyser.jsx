import { useState, useRef, useCallback } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  FileText,
  Upload,
  Search,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  Star,
  Briefcase,
  GraduationCap,
  Zap,
  Users,
  BarChart2,
  X,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

// =============== SCORE COLOR HELPERS ===============
function getScoreColor(score) {
  if (score >= 70) return { bg: "#10b981", light: "#d1fae5", text: "#065f46", label: "Excellent" }; // Emerald
  if (score >= 50) return { bg: "#3b82f6", light: "#dbeafe", text: "#1e40af", label: "Good" }; // Blue
  if (score >= 35) return { bg: "#f59e0b", light: "#fef3c7", text: "#92400e", label: "Average" }; // Amber
  return { bg: "#ef4444", light: "#fee2e2", text: "#991b1b", label: "Low Match" }; // Red
}

function ScoreBadge({ score }) {
  const color = getScoreColor(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-[70px] h-[70px] rounded-full flex items-center justify-center relative"
        style={{
          background: `conic-gradient(${color.bg} ${score * 3.6}deg, #e2e8f0 ${score * 3.6}deg)`
        }}
      >
        <div className="w-[54px] h-[54px] rounded-full bg-white flex items-center justify-center flex-col shadow-sm">
          <span className="text-base font-bold" style={{ color: color.bg }}>{score}</span>
          <span className="text-[8px] text-slate-400 -mt-1">/ 100</span>
        </div>
      </div>
      <span
        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
        style={{ color: color.text, backgroundColor: color.light }}
      >
        {color.label}
      </span>
    </div>
  );
}

// =============== SKILL CHIP ===============
function SkillChip({ skill }) {
  return (
    <span className="inline-block bg-indigo-50 text-indigo-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-indigo-100 m-0.5">
      {skill}
    </span>
  );
}

// =============== BREAKDOWN BAR ===============
function BreakdownBar({ label, value, icon: Icon }) {
  const color = value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <Icon size={13} className="text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">{label}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// =============== RESULT CARD ===============
function ResultCard({ result, rank, selected, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const color = getScoreColor(result.score);

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 mb-4 ${selected ? "border-indigo-500 shadow-[0_0_0_1px_rgba(99,102,241,1)] shadow-indigo-100" : "border-slate-200 shadow-sm hover:shadow-md"
      }`}>
      {/* Card Header */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank Badge */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${rank <= 3 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm" : "bg-slate-100 border border-slate-200 text-slate-500 font-bold text-sm"
          }`}>
          {rank <= 3 ? <Star size={16} fill="currentColor" /> : `#${rank}`}
        </div>

        {/* Score Circle */}
        <div className="shrink-0">
          <ScoreBadge score={result.score} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="m-0 text-base font-bold text-slate-800 break-words">
              {result.candidateName}
            </h3>
            {result.error && (
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-wide">
                Parse Error
              </span>
            )}
          </div>
          <p className="mt-1 mb-0 text-xs text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1"><FileText size={12} className="text-slate-400" /> {result.filename}</span>
            {result.candidateYears > 0 && (
              <span className="flex items-center gap-1"><Briefcase size={12} className="text-slate-400" /> {result.candidateYears} yr{result.candidateYears !== 1 ? "s" : ""} exp</span>
            )}
          </p>
          {/* Matched skills preview */}
          <div className="mt-2 flex flex-wrap gap-1">
            {result.matchedSkills.slice(0, 5).map((skill) => (
              <SkillChip key={skill} skill={skill} />
            ))}
            {result.matchedSkills.length > 5 && (
              <span className="text-[11px] text-slate-500 px-2 py-1 font-medium bg-slate-50 rounded-full border border-slate-100">
                +{result.matchedSkills.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Select checkbox */}
          <button
            onClick={() => onToggle(result.filename)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${selected
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700"
              }`}
          >
            {selected ? <CheckCircle size={15} className="text-indigo-600" /> : <XCircle size={15} />}
            {selected ? "Selected" : "Select"}
          </button>

          {/* Expand toggle */}
          <button className="bg-transparent border-none text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && !result.error && (
        <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50/50">
          <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Score Breakdown */}
            <div>
              <h4 className="m-0 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Score Breakdown
              </h4>
              <BreakdownBar label="Skills Match" value={result.breakdown.skillScore} icon={Zap} />
              <BreakdownBar label="Experience" value={result.breakdown.experienceScore} icon={Briefcase} />
              <BreakdownBar label="Education" value={result.breakdown.educationScore} icon={GraduationCap} />
              <BreakdownBar label="Keywords" value={result.breakdown.tokenScore} icon={BarChart2} />
            </div>

            {/* All Skills + Education */}
            <div>
              <h4 className="m-0 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Matched Skills ({result.matchedSkills.length})
              </h4>
              <div className="mb-4 flex flex-wrap">
                {result.matchedSkills.length > 0 ? (
                  result.matchedSkills.map((s) => <SkillChip key={s} skill={s} />)
                ) : (
                  <span className="text-slate-400 text-xs italic">No specific skills matched</span>
                )}
              </div>

              {result.educationFound.length > 0 && (
                <>
                  <h4 className="m-0 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider mt-5">
                    Education Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {result.educationFound.map((e) => (
                      <span key={e} className="inline-block bg-teal-50 text-teal-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-teal-100">
                        {e}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-l-indigo-400 shadow-sm">
              <p className="m-0 text-xs text-slate-600 leading-relaxed">
                <span className="text-slate-800 font-bold mr-1">Resume Snippet:</span>
                {result.summary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {expanded && result.error && (
        <div className="px-6 pb-5 border-t border-slate-100 bg-red-50/50">
          <div className="pt-4 flex gap-2.5 items-start bg-white border border-red-100 p-3 rounded-xl shadow-sm">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="m-0 text-sm text-red-600">{result.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============== MAIN PAGE ===============
export default function ResumeAnalyser() {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const fileInputRef = useRef();

  // -------- File handlers --------
  const addFiles = useCallback((newFiles) => {
    const valid = Array.from(newFiles).filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      return ["pdf", "doc", "docx", "txt"].includes(ext);
    });
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      const unique = valid.filter((f) => !existing.has(f.name + f.size));
      return [...prev, ...unique].slice(0, 20);
    });
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // -------- Analyse --------
  const analyse = async () => {
    if (!jobDescription.trim()) { setError("Please enter a job description."); return; }
    if (files.length === 0) { setError("Please upload at least one resume."); return; }

    setError("");
    setLoading(true);
    setResults(null);
    setSelected(new Set());

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      files.forEach((f) => formData.append("resumes", f));

      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/api/resume-analyser/analyse`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------- Select toggle --------
  const toggleSelect = (filename) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(filename) ? next.delete(filename) : next.add(filename);
      return next;
    });
  };

  // -------- Export CSV --------
  const exportCSV = () => {
    if (!results) return;
    const rows = results.results
      .filter((r) => selected.has(r.filename))
      .map((r) => [
        r.candidateName,
        r.filename,
        r.score,
        r.candidateYears,
        r.matchedSkills.join("; "),
        r.educationFound.join("; "),
      ]);

    const header = ["Candidate Name", "File", "Score", "Exp (yrs)", "Matched Skills", "Education"];
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shortlisted_candidates.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------- Save shortlist statuses --------
  const saveSelections = async () => {
    if (!results) return;
    setSaveLoading(true);
    setSaveSuccess("");
    try {
      const shortlisted = results.results
        .filter((r) => r.userId && selected.has(r.filename))
        .map((r) => r.userId);
      const rejected = results.results
        .filter((r) => r.userId && !selected.has(r.filename))
        .map((r) => r.userId);

      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/resume-analyser/update-statuses`,
        { shortlisted, rejected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveSuccess(`✅ ${shortlisted.length} Shortlisted, ${rejected.length} Rejected — statuses saved!`);
    } catch (err) {
      setSaveSuccess("❌ Failed to save statuses. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  // -------- Render --------
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-100 p-6 font-sans">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="m-0 text-2xl font-bold text-slate-800 tracking-tight">
                Bulk Resume Analyser
              </h1>
              <p className="m-0 text-sm text-slate-500 font-medium">
                Upload resumes and match them against your job description
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Panel */}
          <div className="flex flex-col gap-6">
            {/* JD Input */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <FileText size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="m-0 text-lg font-bold text-slate-800">Job Description</h2>
                  <p className="m-0 text-xs text-slate-500 font-medium">Paste the full JD to match resumes against</p>
                </div>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here...&#10;&#10;Example:&#10;We are looking for a Senior React Developer with 3+ years of experience in React.js, Node.js, TypeScript...&#10;Requirements: B.Tech/B.E in Computer Science, strong knowledge of REST APIs, Git, Docker..."
                className="w-full min-h-[260px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans shadow-inner placeholder-slate-400"
              />
              <div className="mt-2 flex justify-end">
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  {jobDescription.length} characters
                </span>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                  <Upload size={20} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="m-0 text-lg font-bold text-slate-800">Upload Resumes</h2>
                  <p className="m-0 text-xs text-slate-500 font-medium">PDF, DOC, DOCX, TXT — max 20 files, 5 MB each</p>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${dragOver ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                  }`}
              >
                <Upload size={32} className={`mx-auto mb-3 transition-colors ${dragOver ? "text-indigo-600" : "text-slate-400"}`} />
                <p className={`m-0 mb-1 text-sm font-bold transition-colors ${dragOver ? "text-indigo-700" : "text-slate-600"}`}>
                  {dragOver ? "Drop files here" : "Drag & drop resumes"}
                </p>
                <p className="m-0 text-xs text-slate-400 font-medium">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between items-center mb-2.5">
                    <p className="m-0 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Selected Files ({files.length})
                    </p>
                    <button
                      onClick={() => setFiles([])}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold bg-transparent border-none cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
                    {files.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 group hover:border-indigo-300 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                          <FileText size={14} className="text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="m-0 text-sm font-semibold text-slate-700 truncate">{f.name}</p>
                          <p className="m-0 text-[10px] font-medium text-slate-400">{(f.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                <AlertCircle size={20} className="text-red-600 shrink-0" />
                <p className="m-0 text-sm font-medium text-red-700 leading-snug">{error}</p>
              </div>
            )}

            {/* Analyse Button */}
            <button
              onClick={analyse}
              disabled={loading}
              className={`w-full p-4 rounded-2xl text-white text-base font-bold flex items-center justify-center gap-2.5 transition-all duration-300 ${loading
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 cursor-pointer"
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing {files.length} resume{files.length !== 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Analyse {files.length > 0 ? `${files.length} Resume${files.length !== 1 ? "s" : ""}` : "Resumes"}
                </>
              )}
            </button>
          </div>

          {/* Right Panel — Results */}
          <div>
            {!results && !loading && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-md h-full min-h-[400px] flex flex-col items-center justify-center border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <BarChart2 size={32} className="text-slate-300" />
                </div>
                <h3 className="m-0 mb-2 text-lg font-bold text-slate-700">
                  Ready to Analyse
                </h3>
                <p className="m-0 text-sm text-slate-500 max-w-xs leading-relaxed">
                  Enter your job description and upload candidate resumes to see intelligent matching scores here.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-md h-full min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 mb-5 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                <h3 className="m-0 mb-2 text-lg font-bold text-slate-800">
                  Analysing Resumes
                </h3>
                <p className="m-0 text-sm text-slate-500 font-medium">
                  Parsing and scoring each resume against your JD...
                </p>
              </div>
            )}

            {results && (
              <div>
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Analysed", value: results.totalResumes, icon: FileText, colorClass: "text-indigo-600", bgClass: "bg-indigo-50" },
                    { label: "JD Skills", value: results.jdSkillsDetected.length, icon: Zap, colorClass: "text-amber-600", bgClass: "bg-amber-50" },
                    { label: "Selected", value: selected.size, icon: CheckCircle, colorClass: "text-emerald-600", bgClass: "bg-emerald-50" },
                  ].map(({ label, value, icon: Icon, colorClass, bgClass }) => (
                    <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                      <div className={`w-10 h-10 mx-auto rounded-full ${bgClass} flex items-center justify-center mb-2`}>
                        <Icon size={18} className={colorClass} />
                      </div>
                      <div className="text-2xl font-black text-slate-800">{value}</div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* JD Skills Detected */}
                {results.jdSkillsDetected.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                    <p className="m-0 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500" /> Skills Detected in JD
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {results.jdSkillsDetected.map((s) => <SkillChip key={s} skill={s} />)}
                    </div>
                  </div>
                )}

                {/* Export / Select All / Save Shortlist */}
                <div className="flex gap-3 mb-5 flex-wrap">
                  <button
                    onClick={() => {
                      if (selected.size === results.results.length) {
                        setSelected(new Set());
                      } else {
                        setSelected(new Set(results.results.map((r) => r.filename)));
                      }
                    }}
                    className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl cursor-pointer text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    {selected.size === results.results.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    onClick={exportCSV}
                    disabled={selected.size === 0}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${selected.size > 0
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 cursor-pointer"
                        : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    <Download size={16} />
                    Export ({selected.size})
                  </button>
                  <button
                    onClick={saveSelections}
                    disabled={saveLoading}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${saveLoading
                        ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 cursor-pointer"
                      }`}
                  >
                    <CheckCircle size={16} />
                    {saveLoading ? "Saving..." : "Save Shortlist"}
                  </button>
                </div>

                {/* Save feedback */}
                {saveSuccess && (
                  <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${saveSuccess.startsWith("✅")
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-red-50 border-red-200 text-red-600"
                    }`}>
                    {saveSuccess}
                  </div>
                )}

                {/* Results Cards */}
                <div className="space-y-4">
                  {results.results.map((result, idx) => (
                    <ResultCard
                      key={result.filename + idx}
                      result={result}
                      rank={idx + 1}
                      selected={selected.has(result.filename)}
                      onToggle={toggleSelect}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </DashboardLayout>
  );
}
