import { useState, useEffect, useRef } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  Video,
  MapPin,
  Mail,
  Send,
  ExternalLink,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid,
  Image,
  PenTool,
  Clock,
  History,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

// =============== TEMPLATES CONFIG ===============
const TEMPLATES = {
  technical: {
    name: "Technical Interview (Online)",
    subject: "Technical Interview Invitation - [Company Name]",
    body: `<p>Dear <strong>[Candidate Name]</strong>,</p>
<p>Thank you for your interest in <strong>[Company Name]</strong>. We have reviewed your application and are pleased to invite you for a <strong>Technical Interview</strong>.</p>
<p>Below are the details for your interview:</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <tbody>
    <tr style="background-color: #f8fafc;">
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #475569;">Date & Time</td>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155;"><strong>[Interview Date]</strong></td>
    </tr>
    <tr>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #475569;">Mode</td>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155;">[Interview Mode]</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #475569;">Meeting Link</td>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; color: #2563eb;"><a href="[Meeting Link]" target="_blank" style="color: #2563eb; text-decoration: underline;">[Meeting Link]</a></td>
    </tr>
  </tbody>
</table>
<p>During this interview, we will assess your technical skills, programming knowledge, and system design expertise. Please ensure you have a stable internet connection, a functional webcam, and your development environment ready.</p>
<p>If you have any questions or need to reschedule, please reply directly to this email.</p>
<p>We look forward to speaking with you!</p>
<p>Best regards,<br/><strong>Recruitment Team</strong><br/>[Company Name]</p>`,
  },
  hr: {
    name: "HR Interview (Online)",
    subject: "HR Interview Invitation - [Company Name]",
    body: `<p>Dear <strong>[Candidate Name]</strong>,</p>
<p>Thank you for participating in our technical screening. We are excited to invite you to the final <strong>HR Interview</strong> with <strong>[Company Name]</strong>.</p>
<p>Below are the details for your interview:</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <tbody>
    <tr style="background-color: #f8fafc;">
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #475569;">Date & Time</td>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155;"><strong>[Interview Date]</strong></td>
    </tr>
    <tr>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #475569;">Mode</td>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155;">[Interview Mode]</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #475569;">Meeting Link</td>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; color: #2563eb;"><a href="[Meeting Link]" target="_blank" style="color: #2563eb; text-decoration: underline;">[Meeting Link]</a></td>
    </tr>
  </tbody>
</table>
<p>This discussion will focus on your career aspirations, cultural alignment, work preferences, and package details. It is expected to last approximately 30 minutes.</p>
<p>If you need to adjust the scheduled time, please let us know as soon as possible.</p>
<p>We look forward to speaking with you!</p>
<p>Best regards,<br/><strong>HR Department</strong><br/>[Company Name]</p>`,
  },
  in_person: {
    name: "In-Person Interview",
    subject: "Onsite Interview Invitation - [Company Name]",
    body: `<p>Dear <strong>[Candidate Name]</strong>,</p>
<p>Thank you for your application to <strong>[Company Name]</strong>. We would like to invite you for an <strong>In-Person Interview</strong> at our office premises.</p>
<p>Below are the details for your interview:</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <tbody>
    <tr style="background-color: #f8fafc;">
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #475569;">Date & Time</td>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155;"><strong>[Interview Date]</strong></td>
    </tr>
    <tr>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #475569;">Interview Mode</td>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155;">[Interview Mode]</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #475569;">Location Link</td>
      <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 13px; color: #2563eb;"><a href="[Location Link]" target="_blank" style="color: #2563eb; text-decoration: underline;">[Location Link]</a></td>
    </tr>
  </tbody>
</table>
<p>Please carry a physical copy of your updated resume and report to the reception desk. If you need any assistance regarding directions or rescheduling, please contact us.</p>
<p>We look forward to meeting you in person!</p>
<p>Best regards,<br/><strong>Human Resources</strong><br/>[Company Name]</p>`,
  },
  custom: {
    name: "Custom Template",
    subject: "Interview Update - [Company Name]",
    body: `<p>Dear <strong>[Candidate Name]</strong>,</p>
<p>Thank you for applying to <strong>[Company Name]</strong>.</p>
<p>We would like to coordinate a meeting to discuss your application. Here are the details:</p>
<p><strong>Interview Schedule:</strong> [Interview Date]</p>
<p><strong>Method/Location:</strong> [Meeting Link]</p>
<p>Please let us know your availability. Thank you.</p>
<p>Best regards,<br/>[Company Name]</p>`,
  },
};

export default function InterviewScheduler() {
  const [activeTab, setActiveTab] = useState("schedule"); // 'schedule' | 'history'
  const [candidates, setCandidates] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form Fields
  const [selectedTemplate, setSelectedTemplate] = useState("technical");
  const [subject, setSubject] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewMode, setInterviewMode] = useState("Google Meet");
  const [meetingLink, setMeetingLink] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const editorRef = useRef(null);

  // Selected email history preview
  const [previewEmail, setPreviewEmail] = useState(null);

  const [companyInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("company") || "{}");
    } catch {
      return {};
    }
  });

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch Shortlisted Candidates
  const fetchShortlisted = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/resume-analyser/shortlisted`, { headers });
      if (res.data.success) {
        setCandidates(res.data.candidates);
      }
    } catch (err) {
      console.error("Error fetching shortlisted candidates:", err);
      setError("Failed to fetch shortlisted candidates.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Interview Email History
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/resume-analyser/interview-history`, { headers });
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error("Error fetching interview history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlisted();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  // Load and populate template in the editor
  const loadTemplate = () => {
    const companyName = companyInfo.company_name || "Zenova HR";
    const tmpl = TEMPLATES[selectedTemplate];
    if (!tmpl) return;

    let sub = tmpl.subject.replace(/\[Company Name\]/g, companyName);
    setSubject(sub);

    // Format interview date nicely
    let dateStr = "[Interview Date]";
    if (interviewDate) {
      const d = new Date(interviewDate);
      dateStr = d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    let linkStr = meetingLink || (selectedTemplate === "in_person" ? "[Location Link]" : "[Meeting Link]");
    let modeStr = interviewMode;

    let html = tmpl.body
      .replace(/\[Company Name\]/g, companyName)
      .replace(/\[Interview Date\]/g, dateStr)
      .replace(/\[Interview Mode\]/g, modeStr)
      .replace(/\[Meeting Link\]/g, linkStr)
      .replace(/\[Location Link\]/g, linkStr);

    setDescription(html);
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
  };

  // Sync template fields when date/mode/link changes
  useEffect(() => {
    loadTemplate();
  }, [selectedTemplate, interviewDate, interviewMode, meetingLink]);

  // Editor styling helpers
  const execEditorCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = (e) => {
    setDescription(e.currentTarget.innerHTML);
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #e2e8f0;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 11px;">Details</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 11px;">Info</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px;">Interview Topic</td>
            <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px;">[Topic Details]</td>
          </tr>
        </tbody>
      </table>
    `;
    execEditorCommand("insertHTML", tableHtml);
  };

  const insertLogo = () => {
    let logoUrl = "";
    if (companyInfo.logo) {
      logoUrl = companyInfo.logo;
      if (!logoUrl.startsWith("http") && !logoUrl.startsWith("data:")) {
        logoUrl = `${API_BASE}/${logoUrl.replace(/^\//, "")}`;
      }
    }
    if (!logoUrl) {
      logoUrl = "https://placehold.co/120x60?text=Company+Logo";
    }
    const logoHtml = `<img src="${logoUrl}" alt="Company Logo" style="height: 48px; max-height: 48px; display: block; margin: 12px 0;" />`;
    execEditorCommand("insertHTML", logoHtml);
  };

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map((c) => c.id)));
    }
  };

  // Send Scheduling Email
  const handleSchedule = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (selectedCandidates.size === 0) {
      setError("Please select at least one candidate.");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!description.trim() || description.trim() === "<br>") {
      setError("Please enter email body content.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/resume-analyser/schedule-interview`,
        {
          candidateIds: Array.from(selectedCandidates),
          subject: subject.trim(),
          description: description.trim(),
        },
        { headers }
      );

      if (res.data.success) {
        setSuccessMsg(res.data.message || "Interviews scheduled successfully!");
        setSelectedCandidates(new Set());
        setInterviewDate("");
        setMeetingLink("");
        loadTemplate();
        fetchShortlisted();
      }
    } catch (err) {
      console.error("Error scheduling interviews:", err);
      setError(err.response?.data?.message || "Failed to schedule interviews. Verify email credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering shortlisted candidates
  const filteredCandidates = candidates.filter((c) => {
    const fullname = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    return (
      fullname.includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-100 p-6 font-sans">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Mail size={24} className="text-white" />
            </div>
            <div>
              <h1 className="m-0 text-2xl font-bold text-slate-800 tracking-tight">
                Interview Scheduler
              </h1>
              <p className="m-0 text-sm text-slate-500 font-medium">
                Schedule meetings and dispatch email invitations to shortlisted candidates
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => {
              setActiveTab("schedule");
              setError("");
              setSuccessMsg("");
            }}
            className={`pb-3 font-bold text-sm bg-transparent border-none cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "schedule"
                ? "text-indigo-600 border-b-2 border-indigo-600 font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Send size={15} />
            Schedule Interview
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              setError("");
              setSuccessMsg("");
            }}
            className={`pb-3 font-bold text-sm bg-transparent border-none cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "text-indigo-600 border-b-2 border-indigo-600 font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <History size={15} />
            Sent History
          </button>
        </div>

        {activeTab === "schedule" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Shortlisted Candidates Panel */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Users size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="m-0 text-base font-bold text-slate-800">Shortlisted Candidates</h2>
                    <p className="m-0 text-[11px] text-slate-500">Select candidates to send emails to</p>
                  </div>
                </div>
                <button
                  onClick={fetchShortlisted}
                  className="p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  title="Reload Candidates"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {/* Search input */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                />
              </div>

              {/* Select controls */}
              {filteredCandidates.length > 0 && (
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={selectAll}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-transparent border-none cursor-pointer"
                  >
                    {selectedCandidates.size === filteredCandidates.length ? "Deselect All" : "Select All"}
                  </button>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {selectedCandidates.size} of {filteredCandidates.length} Selected
                  </span>
                </div>
              )}

              {/* List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-3 border-slate-100 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">Loading candidates...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed rounded-2xl p-6">
                  <AlertCircle size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600 mb-1">No shortlisted candidates found</p>
                  <p className="text-xs text-slate-400">Mark candidates as Shortlisted in Bulk Resume Analyser first.</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto flex flex-col gap-2.5 pr-1 custom-scrollbar">
                  {filteredCandidates.map((c) => {
                    const id = c.id;
                    const isSelected = selectedCandidates.has(id);
                    const fullname = `${c.first_name || ""} ${c.last_name || ""}`.trim();
                    return (
                      <div
                        key={id}
                        onClick={() => toggleSelect(id)}
                        className={`flex items-center gap-3 p-3 bg-white rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/20 shadow-sm"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="shrink-0">
                          {isSelected ? (
                            <CheckCircle size={18} className="text-indigo-600" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border border-slate-300 bg-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="m-0 text-sm font-bold text-slate-700 truncate">{fullname}</p>
                          <p className="m-0 text-xs text-slate-400 truncate">{c.email}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold text-slate-400 uppercase">
                            Shortlisted {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {c.resume && (
                          <a
                            href={`${API_BASE}${c.resume}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors shadow-sm shrink-0 border border-slate-200"
                            title="View Resume"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scheduling Form Panel */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />

              <div className="flex items-center gap-2.5 mb-5 mt-2">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                  <Calendar size={18} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="m-0 text-base font-bold text-slate-800">Interview Details</h2>
                  <p className="m-0 text-[11px] text-slate-500">Draft interview schedule details and email body</p>
                </div>
              </div>

              {/* Status Feedbacks */}
              {error && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5 shadow-sm">
                  <XCircle size={18} className="text-red-600 shrink-0" />
                  <p className="m-0 text-xs font-bold text-red-700">{error}</p>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 shadow-sm">
                  <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                  <p className="m-0 text-xs font-bold text-emerald-700">{successMsg}</p>
                </div>
              )}

              <form onSubmit={handleSchedule} className="space-y-4">
                {/* Form Row: Template & Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      Select Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-sans"
                    >
                      {Object.keys(TEMPLATES).map((key) => (
                        <option key={key} value={key}>
                          {TEMPLATES[key].name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      Interview Mode
                    </label>
                    <select
                      value={interviewMode}
                      onChange={(e) => setInterviewMode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-sans"
                    >
                      <option value="Google Meet">Google Meet (Online)</option>
                      <option value="Zoom">Zoom Meeting (Online)</option>
                      <option value="In-Person at Office">In-Person (Onsite)</option>
                      <option value="Telephonic Round">Phone Call (Audio)</option>
                    </select>
                  </div>
                </div>

                {/* Form Row: Date/Time & Meeting Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      Interview Date & Time
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="datetime-local"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      {interviewMode.includes("In-Person") ? "Location Link (Google Maps)" : "Meeting Link / Phone Number"}
                    </label>
                    <div className="relative">
                      {interviewMode.includes("In-Person") ? (
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                      ) : (
                        <Video size={16} className="absolute left-3 top-3 text-slate-400" />
                      )}
                      <input
                        type="text"
                        placeholder={
                          interviewMode.includes("In-Person")
                            ? "E.g. https://maps.google.com/?q=..."
                            : "E.g. https://meet.google.com/xyz..."
                        }
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Subject */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Body / Invitation Message
                  </label>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    {/* Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => execEditorCommand("bold")}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                        title="Bold"
                      >
                        <Bold size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("italic")}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                        title="Italic"
                      >
                        <Italic size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("underline")}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                        title="Underline"
                      >
                        <Underline size={13} />
                      </button>
                      <div className="h-4 w-px bg-slate-300 mx-1 font-sans"></div>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("justifyLeft")}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                        title="Align Left"
                      >
                        <AlignLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("justifyCenter")}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                        title="Align Center"
                      >
                        <AlignCenter size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand("justifyRight")}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition"
                        title="Align Right"
                      >
                        <AlignRight size={13} />
                      </button>
                      <div className="h-4 w-px bg-slate-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={insertTable}
                        className="p-1 px-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 rounded-md text-[10px] font-bold transition flex items-center gap-1 bg-white cursor-pointer"
                        title="Insert Table"
                      >
                        <Grid size={11} />
                        Table
                      </button>
                      <button
                        type="button"
                        onClick={insertLogo}
                        className="p-1 px-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 rounded-md text-[10px] font-bold transition flex items-center gap-1 bg-white cursor-pointer"
                        title="Insert Logo"
                      >
                        <Image size={11} />
                        Logo
                      </button>
                    </div>
                    {/* Editable area */}
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorInput}
                      style={{ minHeight: "260px", maxHeight: "400px", overflowY: "auto" }}
                      className="p-4 outline-none text-sm text-slate-700 bg-white leading-relaxed prose prose-slate max-w-none custom-scrollbar font-sans"
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                    <AlertCircle size={12} />
                    <span>
                      Placeholders like <strong>[Candidate Name]</strong> and <strong>[Company Name]</strong> will be dynamically personalized for each candidate.
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={submitting || selectedCandidates.size === 0}
                  className={`w-full p-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md ${
                    submitting || selectedCandidates.size === 0
                      ? "bg-slate-300 border-slate-300 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 cursor-pointer border-none"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Interview Invitations...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Mail to {selectedCandidates.size} Selected Candidate
                      {selectedCandidates.size !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Sent History Tab */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                  <History size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="m-0 text-base font-bold text-slate-800">Interview Mail History</h2>
                  <p className="m-0 text-[11px] text-slate-500">Track sent interview schedule invitations</p>
                </div>
              </div>
              <button
                onClick={fetchHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <RefreshCw size={13} className={historyLoading ? "animate-spin" : ""} />
                Refresh History
              </button>
            </div>

            {historyLoading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">Loading sent history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed rounded-3xl p-6">
                <Mail size={32} className="text-slate-300 mx-auto mb-3" />
                <h3 className="m-0 mb-1 text-base font-bold text-slate-700">No Sent Mail Records</h3>
                <p className="m-0 text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  You haven't scheduled any interviews yet. Go to the "Schedule Interview" tab to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-500">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75">
                      <th className="py-4 px-4 font-bold text-slate-700">Candidate</th>
                      <th className="py-4 px-4 font-bold text-slate-700">Email</th>
                      <th className="py-4 px-4 font-bold text-slate-700">Subject</th>
                      <th className="py-4 px-4 font-bold text-slate-700">Sent Date & Time</th>
                      <th className="py-4 px-4 font-bold text-slate-700 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((item) => {
                      const candidateName = `${item.first_name || ""} ${item.last_name || ""}`.trim();
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 px-4 font-bold text-slate-800">{candidateName}</td>
                          <td className="py-4 px-4">{item.candidate_email}</td>
                          <td className="py-4 px-4 max-w-[240px] truncate">{item.subject}</td>
                          <td className="py-4 px-4">
                            {new Date(item.created_at).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setPreviewEmail(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                            >
                              <Eye size={12} />
                              Preview
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Preview Modal */}
        {previewEmail && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="m-0 text-base font-bold text-slate-800">
                    Interview Invitation Details
                  </h3>
                  <p className="m-0 text-xs text-slate-400">
                    Sent to {previewEmail.first_name} {previewEmail.last_name} ({previewEmail.candidate_email})
                  </p>
                </div>
                <button
                  onClick={() => setPreviewEmail(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer bg-transparent border-none"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 font-sans">
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <div>
                    <span className="block font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Subject</span>
                    <span className="font-bold text-slate-700">{previewEmail.subject}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Sent On</span>
                    <span className="font-bold text-slate-700">
                      {new Date(previewEmail.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Issued By</span>
                    <span className="font-bold text-slate-700">
                      {previewEmail.hr_first_name
                        ? `${previewEmail.hr_first_name} ${previewEmail.hr_last_name || ""}`
                        : "HR Representative"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Content
                  </span>
                  <div
                    className="p-5 border border-slate-200 rounded-2xl bg-white leading-relaxed prose prose-slate max-w-none text-sm font-sans"
                    dangerouslySetInnerHTML={{ __html: previewEmail.description }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end rounded-b-3xl">
                <button
                  onClick={() => setPreviewEmail(null)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95 cursor-pointer border-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
