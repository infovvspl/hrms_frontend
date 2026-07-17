import { useState, useRef, useCallback } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/Sidebar";
import {
  FileText,
  Upload,
  Trash2,
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
  if (score >= 70) return { bg: "#0d7c3d", light: "#d1fae5", text: "#065f46", label: "Excellent" };
  if (score >= 50) return { bg: "#0369a1", light: "#dbeafe", text: "#1e40af", label: "Good" };
  if (score >= 35) return { bg: "#b45309", light: "#fef3c7", text: "#92400e", label: "Average" };
  return { bg: "#b91c1c", light: "#fee2e2", text: "#991b1b", label: "Low Match" };
}

function ScoreBadge({ score }) {
  const color = getScoreColor(score);
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
    }}>
      <div style={{
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: `conic-gradient(${color.bg} ${score * 3.6}deg, #e5e7eb ${score * 3.6}deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <div style={{
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          background: "#1e293b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: color.bg }}>{score}</span>
          <span style={{ fontSize: "8px", color: "#94a3b8" }}>/ 100</span>
        </div>
      </div>
      <span style={{
        fontSize: "11px",
        fontWeight: 600,
        color: color.bg,
        background: color.light,
        padding: "2px 8px",
        borderRadius: "20px",
      }}>{color.label}</span>
    </div>
  );
}

// =============== SKILL CHIP ===============
function SkillChip({ skill }) {
  return (
    <span style={{
      display: "inline-block",
      background: "linear-gradient(135deg, #334155, #1e293b)",
      color: "#38bdf8",
      fontSize: "11px",
      fontWeight: 500,
      padding: "3px 10px",
      borderRadius: "20px",
      border: "1px solid #334155",
      margin: "2px",
    }}>{skill}</span>
  );
}

// =============== BREAKDOWN BAR ===============
function BreakdownBar({ label, value, icon: Icon }) {
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon size={13} color="#94a3b8" />
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>{label}</span>
        </div>
        <span style={{ fontSize: "12px", fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: "5px", background: "#1e293b", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${value}%`,
          background: color,
          borderRadius: "3px",
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

// =============== RESULT CARD ===============
function ResultCard({ result, rank, selected, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const color = getScoreColor(result.score);

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      border: `1px solid ${selected ? color.bg : "#334155"}`,
      borderRadius: "16px",
      overflow: "hidden",
      transition: "all 0.2s ease",
      boxShadow: selected ? `0 0 20px ${color.bg}40` : "0 4px 20px rgba(0,0,0,0.3)",
      marginBottom: "16px",
    }}>
      {/* Card Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "20px 24px",
        cursor: "pointer",
      }} onClick={() => setExpanded(!expanded)}>
        {/* Rank Badge */}
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: rank <= 3 ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#1e293b",
          border: rank <= 3 ? "none" : "2px solid #334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {rank <= 3 ? (
            <Star size={16} color="#fff" fill="#fff" />
          ) : (
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>#{rank}</span>
          )}
        </div>

        {/* Score Circle */}
        <div style={{ flexShrink: 0 }}>
          <ScoreBadge score={result.score} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#f1f5f9", wordBreak: "break-word" }}>
              {result.candidateName}
            </h3>
            {result.error && (
              <span style={{ background: "#450a0a", color: "#f87171", fontSize: "11px", padding: "2px 8px", borderRadius: "10px" }}>
                Parse Error
              </span>
            )}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
            📄 {result.filename}
            {result.candidateYears > 0 && (
              <span style={{ marginLeft: "12px" }}>💼 {result.candidateYears} yr{result.candidateYears !== 1 ? "s" : ""} exp</span>
            )}
          </p>
          {/* Matched skills preview */}
          <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {result.matchedSkills.slice(0, 5).map((skill) => (
              <SkillChip key={skill} skill={skill} />
            ))}
            {result.matchedSkills.length > 5 && (
              <span style={{ fontSize: "11px", color: "#64748b", padding: "3px 8px" }}>
                +{result.matchedSkills.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {/* Select checkbox */}
          <button
            onClick={() => onToggle(result.filename)}
            style={{
              background: selected ? color.bg : "transparent",
              border: `2px solid ${selected ? color.bg : "#475569"}`,
              borderRadius: "8px",
              padding: "6px 14px",
              cursor: "pointer",
              color: selected ? "#fff" : "#94a3b8",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            {selected ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {selected ? "Selected" : "Select"}
          </button>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && !result.error && (
        <div style={{ padding: "0 24px 24px", borderTop: "1px solid #1e293b" }}>
          <div style={{ paddingTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Score Breakdown */}
            <div>
              <h4 style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Score Breakdown
              </h4>
              <BreakdownBar label="Skills Match" value={result.breakdown.skillScore} icon={Zap} />
              <BreakdownBar label="Experience" value={result.breakdown.experienceScore} icon={Briefcase} />
              <BreakdownBar label="Education" value={result.breakdown.educationScore} icon={GraduationCap} />
              <BreakdownBar label="Keywords" value={result.breakdown.tokenScore} icon={BarChart2} />
            </div>

            {/* All Skills + Education */}
            <div>
              <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Matched Skills ({result.matchedSkills.length})
              </h4>
              <div style={{ marginBottom: "16px" }}>
                {result.matchedSkills.length > 0 ? (
                  result.matchedSkills.map((s) => <SkillChip key={s} skill={s} />)
                ) : (
                  <span style={{ color: "#475569", fontSize: "13px" }}>No specific skills matched</span>
                )}
              </div>

              {result.educationFound.length > 0 && (
                <>
                  <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Education Keywords
                  </h4>
                  <div>
                    {result.educationFound.map((e) => (
                      <span key={e} style={{
                        display: "inline-block",
                        background: "#1e3a5f",
                        color: "#93c5fd",
                        fontSize: "11px",
                        fontWeight: 500,
                        padding: "3px 10px",
                        borderRadius: "20px",
                        margin: "2px",
                      }}>{e}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div style={{ marginTop: "16px", padding: "12px 16px", background: "#0f172a", borderRadius: "10px", borderLeft: "3px solid #334155" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                <span style={{ color: "#94a3b8", fontWeight: 600 }}>Resume Snippet: </span>
                {result.summary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {expanded && result.error && (
        <div style={{ padding: "0 24px 20px", borderTop: "1px solid #1e293b" }}>
          <div style={{ paddingTop: "16px", display: "flex", gap: "10px", alignItems: "flex-start", background: "#450a0a", padding: "12px 16px", borderRadius: "10px" }}>
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0, fontSize: "13px", color: "#f87171" }}>{result.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============== MAIN PAGE ===============
export default function ResumeAnalyser() {
  const [collapsed, setCollapsed] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
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

  // -------- Render --------
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div style={{
        flex: 1,
        marginLeft: collapsed ? "72px" : "260px",
        transition: "margin-left 0.3s ease",
        padding: "32px",
        overflowY: "auto",
        minHeight: "100vh",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px #6366f130",
            }}>
              <Users size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
                Bulk Resume Analyser
              </h1>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                Upload resumes and match them against your job description
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Left Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* JD Input */}
            <div style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={18} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>Job Description</h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Paste the full JD to match resumes against</p>
                </div>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here...&#10;&#10;Example:&#10;We are looking for a Senior React Developer with 3+ years of experience in React.js, Node.js, TypeScript...&#10;Requirements: B.Tech/B.E in Computer Science, strong knowledge of REST APIs, Git, Docker..."
                style={{
                  width: "100%",
                  minHeight: "280px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  padding: "16px",
                  color: "#e2e8f0",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "'Inter', 'Segoe UI', sans-serif",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: "12px", color: "#475569" }}>
                  {jobDescription.length} characters
                </span>
              </div>
            </div>

            {/* Upload Zone */}
            <div style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={18} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>Upload Resumes</h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>PDF, DOC, DOCX, TXT — max 20 files, 5 MB each</p>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#8b5cf6" : "#334155"}`,
                  borderRadius: "14px",
                  padding: "32px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? "#1e1b4b20" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <Upload size={36} color={dragOver ? "#8b5cf6" : "#475569"} style={{ marginBottom: "12px" }} />
                <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 600, color: dragOver ? "#a78bfa" : "#94a3b8" }}>
                  {dragOver ? "Drop files here" : "Drag & drop resumes"}
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: "none" }}
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#64748b" }}>
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </p>
                  <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {files.map((f, idx) => (
                      <div key={idx} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        background: "#0f172a",
                        borderRadius: "10px",
                        border: "1px solid #1e293b",
                      }}>
                        <FileText size={16} color="#8b5cf6" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: "13px", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                          <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>{(f.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#475569", padding: "4px", borderRadius: "6px" }}
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
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "#450a0a", border: "1px solid #7f1d1d",
                borderRadius: "12px", padding: "14px 18px",
              }}>
                <AlertCircle size={18} color="#f87171" />
                <p style={{ margin: 0, fontSize: "14px", color: "#f87171" }}>{error}</p>
              </div>
            )}

            {/* Analyse Button */}
            <button
              onClick={analyse}
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: loading
                  ? "#1e293b"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: loading ? "none" : "0 8px 24px #6366f140",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    border: "3px solid #475569",
                    borderTopColor: "#6366f1",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
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
              <div style={{
                background: "linear-gradient(135deg, #1e293b, #0f172a)",
                border: "1px dashed #334155",
                borderRadius: "20px",
                padding: "60px 24px",
                textAlign: "center",
                color: "#475569",
              }}>
                <BarChart2 size={48} color="#334155" style={{ marginBottom: "16px" }} />
                <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#64748b" }}>
                  Results will appear here
                </h3>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  Enter a JD, upload resumes, and click Analyse
                </p>
              </div>
            )}

            {loading && (
              <div style={{
                background: "linear-gradient(135deg, #1e293b, #0f172a)",
                border: "1px solid #334155",
                borderRadius: "20px",
                padding: "60px 24px",
                textAlign: "center",
              }}>
                <div style={{
                  width: "56px", height: "56px", margin: "0 auto 20px",
                  border: "4px solid #1e293b",
                  borderTopColor: "#8b5cf6",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>
                  Analysing Resumes
                </h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                  Parsing and scoring each resume against your JD...
                </p>
              </div>
            )}

            {results && (
              <div>
                {/* Stats Bar */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  marginBottom: "20px",
                }}>
                  {[
                    { label: "Analysed", value: results.totalResumes, icon: FileText, color: "#6366f1" },
                    { label: "JD Skills", value: results.jdSkillsDetected.length, icon: Zap, color: "#f59e0b" },
                    { label: "Selected", value: selected.size, icon: CheckCircle, color: "#22c55e" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} style={{
                      background: "linear-gradient(135deg, #1e293b, #0f172a)",
                      border: "1px solid #334155",
                      borderRadius: "14px",
                      padding: "16px",
                      textAlign: "center",
                    }}>
                      <Icon size={20} color={color} style={{ marginBottom: "6px" }} />
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#f1f5f9" }}>{value}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* JD Skills Detected */}
                {results.jdSkillsDetected.length > 0 && (
                  <div style={{
                    background: "linear-gradient(135deg, #1e293b, #0f172a)",
                    border: "1px solid #334155",
                    borderRadius: "14px",
                    padding: "16px",
                    marginBottom: "20px",
                  }}>
                    <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Skills Detected in JD
                    </p>
                    <div>
                      {results.jdSkillsDetected.map((s) => <SkillChip key={s} skill={s} />)}
                    </div>
                  </div>
                )}

                {/* Export / Select All */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                  <button
                    onClick={() => {
                      if (selected.size === results.results.length) {
                        setSelected(new Set());
                      } else {
                        setSelected(new Set(results.results.map((r) => r.filename)));
                      }
                    }}
                    style={{
                      flex: 1, padding: "10px", background: "#1e293b", border: "1px solid #334155",
                      borderRadius: "10px", cursor: "pointer", color: "#94a3b8",
                      fontSize: "13px", fontWeight: 600,
                    }}
                  >
                    {selected.size === results.results.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    onClick={exportCSV}
                    disabled={selected.size === 0}
                    style={{
                      flex: 1, padding: "10px",
                      background: selected.size > 0 ? "linear-gradient(135deg, #059669, #047857)" : "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "10px", cursor: selected.size > 0 ? "pointer" : "not-allowed",
                      color: selected.size > 0 ? "#fff" : "#475569",
                      fontSize: "13px", fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    }}
                  >
                    <Download size={14} />
                    Export Selected ({selected.size})
                  </button>
                </div>

                {/* Results Cards */}
                <div>
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

      {/* Spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}
