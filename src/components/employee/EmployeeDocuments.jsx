import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeDashboardLayout from "../../layouts/EmployeeDashboardLayout";
import {
  FileText, Download, Eye, X, Briefcase, Award, LogOut, AlertCircle, RefreshCw
} from "lucide-react";

export default function EmployeeDocuments() {
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null); // { type, label, pdfBase64 }
  const [htmlContent, setHtmlContent] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(false);

  const employee = (() => {
    try { return JSON.parse(localStorage.getItem("employee") || "{}") || {}; } catch { return {}; }
  })();

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const empId = employee.id;

  const SERVER_URL = import.meta.env.VITE_SERVER_ADDRESS || "http://localhost:5000";

  useEffect(() => {
    Promise.resolve().then(() => {
      if (previewDoc && empId) {
        setLoadingHtml(true);
        let endpoint = "";
        if (previewDoc.type === "offer_letter") {
          endpoint = `${SERVER_URL}/api/employees/${empId}/view-offer-letter`;
        } else if (previewDoc.type === "experience_letter") {
          endpoint = `${SERVER_URL}/api/employees/${empId}/view-experience-letter`;
        } else if (previewDoc.type === "relieveing_letter") {
          endpoint = `${SERVER_URL}/api/employees/${empId}/view-relieving-letter`;
        }

        if (endpoint) {
          axios.get(endpoint, { headers })
            .then(res => {
              setHtmlContent(res.data.html || "");
            })
            .catch(err => {
              console.error("Error fetching preview HTML:", err);
              setHtmlContent("");
            })
            .finally(() => {
              setLoadingHtml(false);
            });
        } else {
          setHtmlContent("");
          setLoadingHtml(false);
        }
      } else {
        setHtmlContent("");
      }
    });
  }, [previewDoc, empId]);

  const fetchDocuments = async () => {
    if (!empId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${SERVER_URL}/api/employees/${empId}`, { headers });
      const emp = res.data.employee || res.data;
      setDocuments({
        offer_letter: emp.offer_letter || null,
        experience_letter: emp.experience_letter || null,
        relieveing_letter: emp.relieveing_letter || null
      });
    } catch (err) {
      console.error("Error fetching employee documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchDocuments();
    });
  }, [empId]);

  const downloadPdf = async (type, label) => {
    const endpointMap = {
      offer_letter: "download-offer-letter",
      experience_letter: "download-experience-letter",
      relieveing_letter: "download-relieving-letter"
    };
    const endpoint = endpointMap[type];
    if (!endpoint) return;
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/employees/${empId}/${endpoint}`,
        { headers, responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${label.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      alert("Failed to download document. Please try again.");
      console.error("Download error:", err);
    }
  };

  const docTypes = [
    {
      key: "offer_letter",
      label: "Offer Letter",
      description: "Official employment offer from the company",
      Icon: Briefcase,
      color: "bg-indigo-50 text-indigo-650 border-indigo-100"
    },
    {
      key: "experience_letter",
      label: "Experience Certificate",
      description: "Certificate confirming your employment tenure",
      Icon: Award,
      color: "bg-purple-50 text-purple-650 border-purple-100"
    },
    {
      key: "relieveing_letter",
      label: "Relieving Letter",
      description: "Official letter of relief from employment duties",
      Icon: LogOut,
      color: "bg-teal-50 text-teal-650 border-teal-100"
    }
  ];

  return (
    <EmployeeDashboardLayout>
      <div className="space-y-6 max-w-[1000px] mx-auto p-2 select-none">
        
        {/* Header - Modern White Panel with Colored Icon Accent */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">My Documents</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">View and download your official HR documents</p>
            </div>
          </div>
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-700 hover:text-indigo-650 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-indigo-500" : ""} />
            Refresh
          </button>
        </div>

        {/* 3-Column Grid Layout for Documents */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-24 text-center text-slate-400 font-semibold text-xs shadow-sm">
            <RefreshCw size={20} className="animate-spin mx-auto text-indigo-400 mb-3" />
            Loading your documents...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {docTypes.map(({ key, label, description, Icon, color }) => {
              const dataUrl = documents?.[key];
              const isAvailable = !!dataUrl;

              return (
                <div
                  key={key}
                  className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-350 hover:shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all duration-300 min-h-[260px]"
                >
                  {/* Top: Icon & Status Badge */}
                  <div className="flex items-center justify-between gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 border ${color}`}>
                      <Icon size={20} />
                    </div>
                    {isAvailable ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 uppercase tracking-wider">
                        AVAILABLE
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-50 text-slate-400 border border-slate-200 uppercase tracking-wider">
                        NOT ISSUED
                      </span>
                    )}
                  </div>

                  {/* Middle: Title & Description */}
                  <div className="mt-4 flex-1">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{label}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">{description}</p>
                  </div>

                  {/* Bottom: Action Trigger buttons */}
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    {isAvailable ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setPreviewDoc({ type: key, label, pdfBase64: dataUrl })}
                          className="w-full py-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10 text-slate-700 hover:text-indigo-650 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer bg-white flex items-center justify-center gap-1.5"
                        >
                          <Eye size={13} />
                          Preview
                        </button>
                        <button
                          onClick={() => downloadPdf(key, label)}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Download size={13} />
                          Download PDF
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-amber-650 text-[10px] font-semibold bg-amber-50/40 p-2.5 rounded-xl border border-amber-150 text-center">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Contact HR to request this document</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Preview Fullscreen Overlay */}
        <div className={`fixed inset-0 z-50 w-screen h-screen bg-slate-100 flex flex-col transition-transform duration-300 ease-out transform ${previewDoc ? "translate-x-0" : "translate-x-full"}`}>
          {previewDoc && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-8 py-4.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0 text-indigo-650">
                    <FileText size={17} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{previewDoc.label}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Preview Mode · Read Only</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => downloadPdf(previewDoc.type, previewDoc.label)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition active:scale-95 cursor-pointer"
                  >
                    <Download size={13} />
                    Download PDF
                  </button>
                  <span className="w-px h-6 bg-slate-200 mx-1" />
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="flex items-center gap-1 px-3.5 py-2 border border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <X size={15} />
                    Close
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100/40 p-6 overflow-y-auto flex justify-center items-start">
                {loadingHtml ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-md w-full max-w-[850px] h-full text-center">
                    <RefreshCw size={20} className="animate-spin text-indigo-400 mb-2" />
                    <span className="font-bold text-slate-400 text-xs">Loading Document Layout...</span>
                  </div>
                ) : (
                  <iframe
                    srcDoc={htmlContent}
                    title={previewDoc.label}
                    className="w-full max-w-[850px] h-full border border-slate-200 rounded-2xl shadow-xl bg-white"
                  />
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </EmployeeDashboardLayout>
  );
}
