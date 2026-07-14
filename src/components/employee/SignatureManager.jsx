import { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Trash2, FileText, Check } from "lucide-react";

export default function SignatureManager() {
  const [signatures, setSignatures] = useState([]);
  const [label, setLabel] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchSignatures = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/company/signatures", { headers });
      setSignatures(res.data.signatures || []);
    } catch (err) {
      console.error("Error fetching signatures:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, SVG).");
      return;
    }

    const maxSizeBytes = 20 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`Signature image size must be under 20KB. Current size is ${(selectedFile.size / 1024).toFixed(1)}KB.`);
      e.target.value = "";
      setFile(null);
      setPreview(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.width < 300 || img.width > 600 || img.height < 90 || img.height > 150) {
        setError(`Signature dimensions must be:\n- Width: 300px to 600px (Current: ${img.width}px)\n- Height: 90px to 150px (Current: ${img.height}px)`);
        e.target.value = "";
        setFile(null);
        setPreview(null);
      } else {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setError("");
      }
    };
    img.src = URL.createObjectURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim()) {
      setError("Please enter a signature label (e.g. CEO, HR Manager).");
      return;
    }
    if (!file) {
      setError("Please upload a signature image.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("label", label.trim());
      formData.append("signature", file);

      const res = await axios.post("http://localhost:5000/api/company/signatures", formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      setSignatures(res.data.signatures || []);
      setLabel("");
      setFile(null);
      setPreview(null);
      setSuccess("Signature added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error adding signature:", err);
      setError(err.response?.data?.message || "Failed to add signature.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this signature signatory?")) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/company/signatures/${index}`, { headers });
      setSignatures(res.data.signatures || []);
    } catch (err) {
      console.error("Error deleting signature:", err);
      alert("Failed to delete signature.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              ✍️
            </span>
            Company Signatories Manager
          </h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            Upload official signatures (CEO, HR, Directors, etc.) to stack in generated documents.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="text-xs font-black text-slate-700">Add New Signatory</div>

          <div>
            <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">
              Signatory Designation *
            </label>
            <input
              type="text"
              placeholder="e.g. HR Manager / CEO"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-350 outline-none rounded-xl text-xs font-bold text-slate-700 placeholder-slate-450 transition"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-450 uppercase mb-1">
              Signature Image *
            </label>
            <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 bg-white transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                required={!preview}
              />
              {preview ? (
                <div className="relative w-full flex flex-col items-center">
                  <img src={preview} alt="Preview" className="h-12 object-contain rounded" />
                  <span className="text-[9px] text-slate-400 font-bold mt-2 truncate max-w-[200px]">
                    {file?.name}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={20} className="text-slate-400 mx-auto mb-1 group-hover:text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-650 group-hover:text-indigo-650">
                    Click or Drag Image
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
          {success && <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><Check size={12} /> {success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-black shadow transition active:scale-95 cursor-pointer"
          >
            {loading ? "Adding..." : "Add Signature"}
          </button>
        </form>

        {/* Signature Stack List */}
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-700">Current Signatories Stack</div>
          {fetching ? (
            <div className="text-xs font-bold text-slate-400 py-6 text-center">Loading signatories...</div>
          ) : signatures.length === 0 ? (
            <div className="text-xs font-bold text-slate-400 py-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
              No signatures uploaded yet. Default fallback "Authorized Signatory" will be shown in letters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {signatures.map((sig, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col justify-between border border-slate-200 bg-white rounded-xl p-4 shadow-sm hover:shadow transition"
                >
                  <button
                    onClick={() => handleDelete(index)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                    title="Delete Signatory"
                  >
                    <Trash2 size={12} />
                  </button>

                  <div className="flex-1 flex items-center justify-center py-2 h-16">
                    <img
                      src={`http://localhost:5000/${sig.signature_path}`}
                      alt={sig.label}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-2 mt-2">
                    <div className="text-xs font-black text-slate-800 truncate">{sig.label}</div>
                    <div className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                      Position {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
