import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  UserMinus,
  Mail,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  Paperclip,
  Link2,
  Image as ImageIcon,
  Smile,
  Trash2
} from "lucide-react";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";

export default function EmployeeResignation() {
  const [resignationLetters, setResignationLetters] = useState([]);
  const [hrManager, setHrManager] = useState({ name: "HR Manager", email: "" });
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const employee = JSON.parse(localStorage.getItem("employee") || "{}");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchResignationData = async () => {
    if (!employee?.id) return;
    try {
      setLoading(true);
      const [resLetters, resHr] = await Promise.all([
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/employees/${employee.id}/resignation-letters`, { headers }),
        axios.get(`${import.meta.env.VITE_SERVER_ADDRESS}/api/employees/${employee.id}/hr-manager`, { headers })
      ]);
      setResignationLetters(resLetters.data.resignation_letters || []);
      const hr = resHr.data.hr_manager || { name: "HR Manager", email: "" };
      setHrManager(hr);
      if (hr.email) {
        setRecipientEmail(hr.email);
      }
    } catch (err) {
      console.error("Error fetching resignation letters:", err);
      setError(err.response?.data?.message || "Failed to load resignation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignationData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee?.id) return;
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        subject,
        description,
        recipient_email: recipientEmail
      };

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_ADDRESS}/api/employees/${employee.id}/resignation-letter`,
        payload,
        { headers }
      );

      const sentToName = res.data.sent_to?.name || hrManager.name;
      const sentToEmail = res.data.sent_to?.email || recipientEmail || hrManager.email;
      setSuccess(`Resignation email sent to ${sentToName} (${sentToEmail}) successfully!`);
      setSubject("");
      setDescription("");
      const editor = document.getElementById("email-body-editable");
      if (editor) editor.innerHTML = "";
      await fetchResignationData();
    } catch (err) {
      console.error("Submit resignation error:", err);
      setError(err.response?.data?.message || "Failed to send resignation email.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormat = (command, value = null) => {
    const editor = document.getElementById("email-body-editable");
    if (editor) {
      editor.focus();
      document.execCommand(command, false, value);
      setDescription(editor.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      handleFormat("createLink", url);
    }
  };

  const handleImage = () => {
    const imageUrl = prompt("Enter Image URL:", "https://");
    if (imageUrl) {
      handleFormat("insertImage", imageUrl);
    }
  };

  const handleAttachmentClick = () => {
    document.getElementById("attachment-file-input")?.click();
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const editor = document.getElementById("email-body-editable");
      if (editor) {
        editor.focus();
        const badgeHtml = `<span contenteditable="false" style="display: inline-block; background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 6px; font-weight: bold; margin: 4px 0; font-size: 11px; user-select: none;">📎 ${file.name}</span>&nbsp;`;
        document.execCommand("insertHTML", false, badgeHtml);
        setDescription(editor.innerHTML);
      }
    }
  };

  // Get the most recent resignation to show as "Active/Latest"
  const latestResignation = resignationLetters[0];

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 text-slate-800 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                Career Transition
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-slate-800">
                Resignation Portal
              </h1>
              <p className="text-slate-500 text-xs font-semibold">
                Submit and track your resignation letters.
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-purple-600">
              <UserMinus size={28} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            <span className="text-sm font-bold text-slate-600 ml-3">Loading Resignation Data...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Form Column - Left */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              {latestResignation ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold p-4 rounded-xl flex items-start gap-3">
                    <Clock className="shrink-0 text-amber-500 mt-0.5" size={18} />
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">Resignation Submitted</h4>
                      <p className="text-[11px] text-amber-700/90 mt-0.5 font-medium">
                        You have submitted a resignation letter. The administration and management will review it shortly.
                      </p>
                    </div>
                  </div>

                  {/* Letter Details Card */}
                  <div className="border border-slate-100 rounded-2xl bg-slate-50/50 p-6 space-y-4 shadow-inner">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="text-purple-500" size={18} />
                        <span className="font-extrabold text-slate-800 text-sm">Active Resignation Letter</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-100">
                        Submitted: {new Date(latestResignation.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Subject</h4>
                        <p className="text-xs font-bold text-slate-700 mt-1">{latestResignation.subject}</p>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Reason & Description</h4>
                        <div 
                          className="text-xs text-slate-600 mt-2 bg-white p-4 rounded-xl border border-slate-100 leading-relaxed shadow-sm font-medium html-preview"
                          dangerouslySetInnerHTML={{ __html: latestResignation.description }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
                      <AlertCircle className="shrink-0 text-rose-500" size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="shrink-0 text-emerald-500" size={16} />
                      <span>{success}</span>
                    </div>
                  )}

                  {/* Email Composer Window */}
                  <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
                    {/* Window Title Bar */}
                    <div className="bg-[#f8fafc] px-5 py-3.5 border-b border-slate-100 flex justify-between items-center select-none">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 ml-2">New Email Message</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase bg-white border border-slate-100 px-2 py-0.5 rounded">Resignation Draft</span>
                    </div>

                    {/* Email Fields */}
                    <div className="divide-y divide-slate-100 text-xs">
                      {/* From Field */}
                      <div className="flex items-center gap-3 px-5 py-3">
                        <span className="text-slate-400 font-bold w-12 text-right">From:</span>
                        <div className="flex-1 font-semibold text-slate-700">
                          {employee?.first_name} {employee?.last_name} <span className="text-slate-400 font-medium">&lt;{employee?.email || employee?.work_email || "my-email@company.com"}&gt;</span>
                        </div>
                      </div>

                      {/* To Field */}
                      <div className="flex items-center gap-3 px-5 py-3">
                        <span className="text-slate-400 font-bold w-12 text-right">To:</span>
                        <div className="flex-1 flex items-center">
                          <input
                            type="email"
                            placeholder="HR/Recipient Email Address"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            className="w-full max-w-md font-semibold text-slate-800 outline-none border border-slate-200 rounded px-2.5 py-1 text-xs focus:border-purple-400 focus:ring-1 focus:ring-purple-400 placeholder:text-slate-300 bg-transparent"
                            required
                          />
                        </div>
                      </div>

                      {/* Subject Field */}
                      <div className="flex items-center gap-3 px-5 py-2">
                        <span className="text-slate-400 font-bold w-12 text-right">Subject:</span>
                        <input
                          type="text"
                          placeholder="Resignation Letter - [Your Name]"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="flex-1 font-bold text-slate-700 outline-none border-none py-1.5 focus:ring-0 placeholder:text-slate-300 bg-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Message Body */}
                    <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white">
                      <div className="px-5 py-4">
                        <div
                          id="email-body-editable"
                          contentEditable
                          className="w-full text-slate-600 outline-none min-h-[200px] leading-relaxed text-xs focus:ring-0 p-0 font-medium bg-transparent select-text"
                          placeholder="Dear HR Manager,&#10;&#10;Please accept this email as formal notification that I am resigning from my position..."
                          onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                          style={{ whiteSpace: "pre-wrap" }}
                        />
                        <input 
                          type="file" 
                          id="attachment-file-input" 
                          style={{ display: "none" }} 
                          onChange={handleAttachmentChange} 
                        />
                      </div>

                      {/* Formatting Bar & Footer controls */}
                      <div className="bg-[#f8fafc] px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Mock Text Formatting Controls */}
                        <div className="flex items-center gap-2 text-slate-400">
                          <button type="button" onClick={() => handleFormat("bold")} className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-600 transition" title="Bold"><Bold size={13} /></button>
                          <button type="button" onClick={() => handleFormat("italic")} className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-600 transition" title="Italic"><Italic size={13} /></button>
                          <button type="button" onClick={() => handleFormat("underline")} className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-600 transition" title="Underline"><Underline size={13} /></button>
                          <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                          <button type="button" onClick={handleAttachmentClick} className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-600 transition" title="Attach file"><Paperclip size={13} /></button>
                          <button type="button" onClick={handleLink} className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-600 transition" title="Insert link"><Link2 size={13} /></button>
                          <button type="button" onClick={handleImage} className="p-1 rounded hover:bg-slate-200/60 hover:text-slate-600 transition" title="Insert image"><ImageIcon size={13} /></button>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              className={`p-1 rounded hover:bg-slate-200/60 hover:text-slate-600 transition ${showEmojiPicker ? "bg-slate-200 text-slate-600" : ""}`}
                              title="Emoji"
                            >
                              <Smile size={13} />
                            </button>
                            {showEmojiPicker && (
                              <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-slate-200 rounded-xl shadow-lg flex gap-1.5 z-30">
                                {["😊", "👍", "🎉", "🙏", "❤️", "👋", "💼"].map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      const editor = document.getElementById("email-body-editable");
                                      if (editor) {
                                        editor.focus();
                                        document.execCommand("insertText", false, emoji);
                                        setDescription(editor.innerHTML);
                                      }
                                      setShowEmojiPicker(false);
                                    }}
                                    className="hover:scale-125 transition text-base p-1"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Send Action */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => { 
                              setSubject(""); 
                              setDescription(""); 
                              const editor = document.getElementById("email-body-editable");
                              if (editor) editor.innerHTML = "";
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                            title="Discard Draft"
                          >
                            <Trash2 size={14} />
                          </button>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-2 px-5 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01]"
                          >
                            {submitting ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                            ) : (
                              <>
                                <Send size={11} />
                                Send Message
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Column - Right */}
            <div className="lg:col-span-4 space-y-6">
              {/* History list */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Resignation History</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Submission History</p>
                </div>

                {resignationLetters.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                    <FileText className="mx-auto text-slate-300 mb-2" size={24} />
                    <p className="text-[11px] font-semibold text-slate-400">No resignation records found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resignationLetters.map((letter) => (
                      <div
                        key={letter.id}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/80 transition duration-150"
                      >
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                          <Calendar size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-700 truncate">{letter.subject}</h4>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(letter.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <ChevronRight className="text-slate-300" size={14} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <style>{`
          #email-body-editable:empty:before {
            content: attr(placeholder);
            color: #cbd5e1;
            pointer-events: none;
            display: block;
          }
        `}</style>
      </div>
    </EmployeeDashboardLayout>
  );
}
