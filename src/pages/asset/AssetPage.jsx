import { useEffect, useState, useRef } from "react";
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaTimes, FaBox,
  FaWrench, FaUserCheck, FaFilePdf, FaFileImage, FaUpload,
} from "react-icons/fa";
import DashboardLayout from "../../layouts/DashboardLayout";
import axios from "axios";

const BASE = import.meta.env.VITE_SERVER_ADDRESS;
const API = `${BASE}/api/assets`;
const EMPLOYEES_API = `${BASE}/api/employees`;
const BRANCHES_API = `${BASE}/api/branch`;

// ─────────────────────────────────────────────────────────────
// HELPER: auth headers
// ─────────────────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-700 text-lg">{title}</h3>
      <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL WRAPPER
// ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, onSave, saveLabel = "Save" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-6 py-5 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition">
            <FaTimes />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">{children}</div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm font-medium">
            Cancel
          </button>
          <button onClick={onSave} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0b163d] to-[#20287d] text-white hover:scale-105 transition text-sm font-medium shadow-lg">
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORM FIELD
// ─────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50";

// ─────────────────────────────────────────────────────────────
// BILL FILE INPUT COMPONENT
// ─────────────────────────────────────────────────────────────
function BillUpload({ billFile, setBillFile, existingBillUrl }) {
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) setBillFile(f);
  };

  const fileIcon = billFile
    ? (billFile.type === "application/pdf" ? <FaFilePdf className="text-red-500" /> : <FaFileImage className="text-blue-500" />)
    : null;

  return (
    <div
      className="border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition group"
      onClick={() => fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      {billFile ? (
        <div className="flex items-center gap-3">
          <div className="text-2xl">{fileIcon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{billFile.name}</p>
            <p className="text-xs text-slate-400">{(billFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setBillFile(null); fileRef.current.value = ""; }}
            className="text-slate-400 hover:text-red-500 transition"
          >
            <FaTimes size={12} />
          </button>
        </div>
      ) : existingBillUrl ? (
        <div className="flex items-center gap-3">
          <div className="text-2xl text-slate-400">
            {existingBillUrl.toLowerCase().endsWith(".pdf") ? <FaFilePdf className="text-red-400" /> : <FaFileImage className="text-blue-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 truncate">Current: {existingBillUrl.split("/").pop()}</p>
            <p className="text-xs text-indigo-500">Click to replace</p>
          </div>
          <a href={existingBillUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-indigo-600 underline">View</a>
        </div>
      ) : (
        <div className="flex flex-col items-center py-2 text-slate-400 group-hover:text-indigo-500 transition">
          <FaUpload size={20} className="mb-2" />
          <p className="text-sm font-medium">Upload Bill</p>
          <p className="text-xs mt-0.5">PDF, PNG, JPG up to 5MB</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB BUTTON
// ─────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-[#0b163d] to-[#20287d] text-white shadow-lg scale-105"
          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
      }`}
    >
      {icon}
      {label}
      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
        {count}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// TABLE CARD
// ─────────────────────────────────────────────────────────────
function TableCard({ title, subtitle, total, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200">
      <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">{title}</h2>
          <p className="text-slate-300 text-sm">{subtitle}</p>
        </div>
        <div className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium">Total: {total}</div>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCH BAR
// ─────────────────────────────────────────────────────────────
function SearchBar({ search, setSearch, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 60); }, [open]);
  return (
    <>
      <button onClick={() => setOpen((s) => !s)} className="h-11 w-11 rounded-xl bg-gradient-to-r from-[#08112d] to-[#1a1d5f] text-white shadow-lg flex items-center justify-center hover:scale-105 transition">
        <FaSearch />
      </button>
      <div className={`relative transition-all duration-200 ${open ? "w-72" : "w-0 overflow-hidden"}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="flex items-center w-full">
            <input ref={ref} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} className="w-full bg-white/90 text-slate-800 placeholder-slate-400 px-4 py-2 rounded-xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {search && (
              <button onClick={() => setSearch("")} className="-ml-10 mr-2 p-1 rounded-full bg-white/80 text-slate-600"><FaTimes /></button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const thCls = "px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap";
const tdCls = "px-6 py-5 text-slate-600 text-sm whitespace-nowrap";

// ═══════════════════════════════════════════════════════════════
// ======================== ASSETS TAB ==========================
// ═══════════════════════════════════════════════════════════════
function AssetsTab({ assets, branches, onRefresh }) {
  const emptyForm = { asset_name: "", branch_id: "", purchase_date: "", vendor_name: "", price: "" };
  const [form, setForm] = useState(emptyForm);
  const [billFile, setBillFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editBillUrl, setEditBillUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = assets.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.asset_name?.toLowerCase().includes(q) || a.vendor_name?.toLowerCase().includes(q) || a.branch_name?.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(emptyForm); setBillFile(null); setEditId(null); setEditBillUrl(""); setShowModal(true); };
  const openEdit = (item) => {
    setForm({
      asset_name: item.asset_name || "",
      branch_id: item.branch_id || "",
      purchase_date: item.purchase_date ? item.purchase_date.slice(0, 10) : "",
      vendor_name: item.vendor_name || "",
      price: item.price || "",
    });
    setBillFile(null);
    setEditBillUrl(item.bill || "");
    setEditId(item.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.asset_name.trim()) return alert("Asset name is required");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
      if (billFile) fd.append("bill", billFile);

      const config = { headers: { ...getHeaders(), "Content-Type": "multipart/form-data" } };

      if (editId) {
        await axios.put(`${API}/${editId}`, fd, config);
      } else {
        await axios.post(API, fd, config);
      }
      setShowModal(false);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try { await axios.delete(`${API}/${id}`, { headers: getHeaders() }); onRefresh(); }
    catch (e) { alert(e.response?.data?.message || "Delete failed"); }
  };

  return (
    <>
      <div className="flex items-center justify-end mb-4 gap-2">
        <SearchBar search={search} setSearch={setSearch} placeholder="Search assets..." />
        <button onClick={openAdd} className="h-11 bg-gradient-to-r from-[#0b163d] to-[#20287d] hover:scale-105 duration-300 text-white px-4 rounded-xl shadow-lg flex items-center gap-2">
          <FaPlus /><span className="text-sm">Add Asset</span>
        </button>
      </div>

      <TableCard title="Asset List" subtitle="Manage all company assets" total={filtered.length}>
        {filtered.length === 0 ? (
          <EmptyState icon="📦" title="No Assets Found" subtitle="Add your first asset to get started." />
        ) : (
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className={thCls + " sticky left-0 z-20 bg-slate-50 border-r border-slate-100"}>Asset Name</th>
                <th className={thCls}>Branch</th>
                <th className={thCls}>Purchase Date</th>
                <th className={thCls}>Vendor</th>
                <th className={thCls}>Price (₹)</th>
                <th className={thCls}>Bill</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 group">
                  <td className="px-6 py-5 sticky left-0 z-10 bg-white border-r border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {item.asset_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{item.asset_name}</p>
                        <p className="text-xs text-slate-400">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className={tdCls}>{item.branch_name || <span className="text-slate-300">—</span>}</td>
                  <td className={tdCls}>{item.purchase_date ? item.purchase_date.slice(0, 10) : <span className="text-slate-300">—</span>}</td>
                  <td className={tdCls}>{item.vendor_name || <span className="text-slate-300">—</span>}</td>
                  <td className={tdCls}>
                    {item.price ? <span className="font-semibold text-emerald-600">₹{parseFloat(item.price).toLocaleString("en-IN")}</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className={tdCls}>
                    {item.bill ? (
                      <a href={item.bill} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                        {item.bill.toLowerCase().endsWith(".pdf") ? <FaFilePdf /> : <FaFileImage />}
                        View Bill
                      </a>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setViewItem(item)} className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"><FaEye size={13} /></button>
                      <button onClick={() => openEdit(item)} className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white transition flex items-center justify-center"><FaEdit size={13} /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit Asset" : "Add Asset"} onSave={handleSave}>
        <Field label="Asset Name" required>
          <input className={inputCls} value={form.asset_name} onChange={(e) => setForm({ ...form, asset_name: e.target.value })} placeholder="e.g. Dell Laptop" />
        </Field>
        <Field label="Branch">
          <select className={inputCls} value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
            <option value="">Select Branch (optional)</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="Purchase Date">
          <input type="date" className={inputCls} value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
        </Field>
        <Field label="Vendor Name">
          <input className={inputCls} value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} placeholder="e.g. TechMart" />
        </Field>
        <Field label="Price (₹)">
          <input type="number" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
        </Field>
        <Field label="Bill (PDF / Image)">
          <BillUpload billFile={billFile} setBillFile={setBillFile} existingBillUrl={editBillUrl} />
        </Field>
      </Modal>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-6 py-5 flex items-center justify-between">
              <h2 className="text-white text-xl font-bold">Asset Details</h2>
              <button onClick={() => setViewItem(null)} className="text-white/70 hover:text-white"><FaTimes /></button>
            </div>
            <div className="p-6 space-y-3 text-sm text-slate-700">
              {[
                ["Asset Name", viewItem.asset_name],
                ["Branch", viewItem.branch_name || "—"],
                ["Purchase Date", viewItem.purchase_date ? viewItem.purchase_date.slice(0, 10) : "—"],
                ["Vendor", viewItem.vendor_name || "—"],
                ["Price", viewItem.price ? `₹${parseFloat(viewItem.price).toLocaleString("en-IN")}` : "—"],
                ["Created At", viewItem.created_at ? new Date(viewItem.created_at).toLocaleDateString() : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-500">{k}</span>
                  <span className="text-slate-800 font-semibold">{v}</span>
                </div>
              ))}
              {viewItem.bill && (
                <div className="pt-2">
                  <a href={viewItem.bill} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                    {viewItem.bill.toLowerCase().endsWith(".pdf") ? <FaFilePdf /> : <FaFileImage />}
                    View Bill Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ====================== ASSIGN TAB ============================
// ═══════════════════════════════════════════════════════════════
function AssignTab({ assignments, assets, employees, onRefresh }) {
  const emptyForm = { user_id: "", asset_id: "", assign_date: "" };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = assignments.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.asset_name?.toLowerCase().includes(q) || a.employee_name?.toLowerCase().includes(q) || a.employee_email?.toLowerCase().includes(q);
  });

  // Assets not yet assigned (for new assignment)
  const assignedAssetIds = new Set(assignments.map((a) => a.asset_id));
  const availableAssets = editId
    ? assets
    : assets.filter((a) => !assignedAssetIds.has(a.id));

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (item) => {
    setForm({
      user_id: item.user_id || "",
      asset_id: item.asset_id || "",
      assign_date: item.assign_date ? item.assign_date.slice(0, 10) : "",
    });
    setEditId(item.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.user_id || !form.asset_id) return alert("Please select both an employee and an asset");
    try {
      const cfg = { headers: getHeaders() };
      if (editId) {
        await axios.put(`${API}/assign/${editId}`, form, cfg);
      } else {
        await axios.post(`${API}/assign/create`, form, cfg);
      }
      setShowModal(false);
      onRefresh();
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Unassign this asset?")) return;
    try { await axios.delete(`${API}/assign/${id}`, { headers: getHeaders() }); onRefresh(); }
    catch (e) { alert(e.response?.data?.message || "Delete failed"); }
  };

  return (
    <>
      <div className="flex items-center justify-end mb-4 gap-2">
        <SearchBar search={search} setSearch={setSearch} placeholder="Search assignments..." />
        <button onClick={openAdd} className="h-11 bg-gradient-to-r from-[#0b163d] to-[#20287d] hover:scale-105 duration-300 text-white px-4 rounded-xl shadow-lg flex items-center gap-2">
          <FaPlus /><span className="text-sm">Assign Asset</span>
        </button>
      </div>

      <TableCard title="Asset Assignments" subtitle="Track which assets are assigned to employees" total={filtered.length}>
        {filtered.length === 0 ? (
          <EmptyState icon="👤" title="No Assignments Found" subtitle="Assign an asset to an employee." />
        ) : (
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className={thCls + " sticky left-0 z-20 bg-slate-50 border-r border-slate-100"}>Employee</th>
                <th className={thCls}>Asset</th>
                <th className={thCls}>Vendor</th>
                <th className={thCls}>Price (₹)</th>
                <th className={thCls}>Assign Date</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 group">
                  <td className="px-6 py-5 sticky left-0 z-10 bg-white border-r border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm">
                        {item.employee_name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{item.employee_name}</p>
                        <p className="text-xs text-slate-400">{item.employee_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={tdCls}><span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">{item.asset_name}</span></td>
                  <td className={tdCls}>{item.vendor_name || <span className="text-slate-300">—</span>}</td>
                  <td className={tdCls}>
                    {item.price ? <span className="font-semibold text-emerald-600">₹{parseFloat(item.price).toLocaleString("en-IN")}</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className={tdCls}>{item.assign_date ? item.assign_date.slice(0, 10) : <span className="text-slate-300">—</span>}</td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(item)} className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white transition flex items-center justify-center"><FaEdit size={13} /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit Assignment" : "Assign Asset"} onSave={handleSave}>
        <Field label="Employee" required>
          <select className={inputCls} value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
            <option value="">— Select Employee —</option>
            {employees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} {u.email ? `(${u.email})` : ""}
              </option>
            ))}
          </select>
          {employees.length === 0 && <p className="text-xs text-amber-500 mt-1">⚠ No employees found. Please add employees first.</p>}
        </Field>
        <Field label="Asset" required>
          <select className={inputCls} value={form.asset_id} onChange={(e) => setForm({ ...form, asset_id: e.target.value })}>
            <option value="">— Select Asset —</option>
            {availableAssets.map((a) => (
              <option key={a.id} value={a.id}>{a.asset_name}{a.vendor_name ? ` (${a.vendor_name})` : ""}</option>
            ))}
          </select>
          {availableAssets.length === 0 && !editId && <p className="text-xs text-amber-500 mt-1">⚠ All assets are already assigned.</p>}
        </Field>
        <Field label="Assign Date">
          <input
            type="date"
            className={inputCls}
            value={form.assign_date}
            onChange={(e) => setForm({ ...form, assign_date: e.target.value })}
          />
        </Field>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ====================== REPAIR TAB ============================
// ═══════════════════════════════════════════════════════════════
function RepairTab({ repairs, assets, onRefresh }) {
  const emptyForm = { asset_id: "", repair_date: "", vendor_name: "", repair_price: "", description: "" };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = repairs.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.asset_name?.toLowerCase().includes(q) || r.vendor_name?.toLowerCase().includes(q) || r.repaired_by_name?.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (item) => {
    setForm({
      asset_id: item.asset_id || "",
      repair_date: item.repair_date ? item.repair_date.slice(0, 10) : "",
      vendor_name: item.vendor_name || "",
      repair_price: item.repair_price || "",
      description: item.description || "",
    });
    setEditId(item.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.asset_id) return alert("Asset is required");
    try {
      const cfg = { headers: getHeaders() };
      if (editId) {
        await axios.put(`${API}/repair/${editId}`, form, cfg);
      } else {
        await axios.post(`${API}/repair/create`, form, cfg);
      }
      setShowModal(false);
      onRefresh();
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this repair record?")) return;
    try { await axios.delete(`${API}/repair/${id}`, { headers: getHeaders() }); onRefresh(); }
    catch (e) { alert(e.response?.data?.message || "Delete failed"); }
  };

  return (
    <>
      <div className="flex items-center justify-end mb-4 gap-2">
        <SearchBar search={search} setSearch={setSearch} placeholder="Search repairs..." />
        <button onClick={openAdd} className="h-11 bg-gradient-to-r from-[#0b163d] to-[#20287d] hover:scale-105 duration-300 text-white px-4 rounded-xl shadow-lg flex items-center gap-2">
          <FaPlus /><span className="text-sm">Log Repair</span>
        </button>
      </div>

      <TableCard title="Repair Records" subtitle="Track all asset maintenance and repair logs" total={filtered.length}>
        {filtered.length === 0 ? (
          <EmptyState icon="🔧" title="No Repair Records" subtitle="Log a repair to get started." />
        ) : (
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className={thCls + " sticky left-0 z-20 bg-slate-50 border-r border-slate-100"}>Asset</th>
                <th className={thCls}>Repair Date</th>
                <th className={thCls}>Vendor</th>
                <th className={thCls}>Cost (₹)</th>
                <th className={thCls}>Done By</th>
                <th className={thCls}>Description</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 group">
                  <td className="px-6 py-5 sticky left-0 z-10 bg-white border-r border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center">
                        <FaWrench size={12} />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">{item.asset_name}</p>
                    </div>
                  </td>
                  <td className={tdCls}>{item.repair_date ? item.repair_date.slice(0, 10) : <span className="text-slate-300">—</span>}</td>
                  <td className={tdCls}>{item.vendor_name || <span className="text-slate-300">—</span>}</td>
                  <td className={tdCls}>{item.repair_price ? <span className="font-semibold text-orange-600">₹{parseFloat(item.repair_price).toLocaleString("en-IN")}</span> : <span className="text-slate-300">—</span>}</td>
                  <td className={tdCls}><span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">{item.repaired_by_name || "—"}</span></td>
                  <td className={tdCls}><span className="max-w-[200px] truncate block text-slate-500 text-xs">{item.description || <span className="text-slate-300">—</span>}</span></td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setViewItem(item)} className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"><FaEye size={13} /></button>
                      <button onClick={() => openEdit(item)} className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white transition flex items-center justify-center"><FaEdit size={13} /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit Repair Record" : "Log Repair"} onSave={handleSave}>
        <Field label="Asset" required>
          <select className={inputCls} value={form.asset_id} onChange={(e) => setForm({ ...form, asset_id: e.target.value })}>
            <option value="">— Select Asset —</option>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.asset_name}</option>)}
          </select>
        </Field>
        <Field label="Repair Date">
          <input type="date" className={inputCls} value={form.repair_date} onChange={(e) => setForm({ ...form, repair_date: e.target.value })} />
        </Field>
        <Field label="Vendor / Service Centre">
          <input className={inputCls} value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} placeholder="e.g. TechFix Centre" />
        </Field>
        <Field label="Repair Cost (₹)">
          <input type="number" className={inputCls} value={form.repair_price} onChange={(e) => setForm({ ...form, repair_price: e.target.value })} placeholder="0.00" />
        </Field>
        <Field label="Description">
          <textarea rows={3} className={inputCls + " resize-none"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the repair work..." />
        </Field>
      </Modal>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-6 py-5 flex items-center justify-between">
              <h2 className="text-white text-xl font-bold">Repair Details</h2>
              <button onClick={() => setViewItem(null)} className="text-white/70 hover:text-white"><FaTimes /></button>
            </div>
            <div className="p-6 space-y-3 text-sm text-slate-700">
              {[
                ["Asset", viewItem.asset_name],
                ["Repair Date", viewItem.repair_date ? viewItem.repair_date.slice(0, 10) : "—"],
                ["Vendor", viewItem.vendor_name || "—"],
                ["Repair Cost", viewItem.repair_price ? `₹${parseFloat(viewItem.repair_price).toLocaleString("en-IN")}` : "—"],
                ["Done By", viewItem.repaired_by_name || "—"],
                ["Description", viewItem.description || "—"],
                ["Logged On", viewItem.created_at ? new Date(viewItem.created_at).toLocaleDateString() : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-500">{k}</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ======================== MAIN PAGE ===========================
// ═══════════════════════════════════════════════════════════════
export default function AssetPage() {
  const [activeTab, setActiveTab] = useState("assets");
  const [assets, setAssets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const cfg = { headers: getHeaders() };
      const [aRes, asRes, rRes, empRes, bRes] = await Promise.allSettled([
        axios.get(API, cfg),
        axios.get(`${API}/assign/list`, cfg),
        axios.get(`${API}/repair/list`, cfg),
        axios.get(EMPLOYEES_API, cfg),
        axios.get(BRANCHES_API, cfg),
      ]);

      if (aRes.status === "fulfilled") setAssets(aRes.value.data.assets || []);
      if (asRes.status === "fulfilled") setAssignments(asRes.value.data.assignments || []);
      if (rRes.status === "fulfilled") setRepairs(rRes.value.data.repairs || []);
      if (empRes.status === "fulfilled") {
        // API returns { employees: [...] } or raw array
        const raw = empRes.value.data;
        setEmployees(raw.employees || raw || []);
      }
      if (bRes.status === "fulfilled") setBranches(bRes.value.data.branches || []);
    } catch (e) {
      console.error("fetchAll error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-100 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Asset Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage company assets, assignments and repair records</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Assets", value: assets.length, icon: "📦", color: "from-indigo-500 to-blue-600" },
            { label: "Assigned", value: assignments.length, icon: "👤", color: "from-purple-500 to-pink-500" },
            { label: "Repair Logs", value: repairs.length, icon: "🔧", color: "from-orange-500 to-red-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${s.color} flex items-center justify-center text-2xl shadow-lg`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-slate-400 text-sm">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-5">
          <TabBtn active={activeTab === "assets"} onClick={() => setActiveTab("assets")} icon={<FaBox size={13} />} label="Assets" count={assets.length} />
          <TabBtn active={activeTab === "assign"} onClick={() => setActiveTab("assign")} icon={<FaUserCheck size={13} />} label="Assignments" count={assignments.length} />
          <TabBtn active={activeTab === "repair"} onClick={() => setActiveTab("repair")} icon={<FaWrench size={13} />} label="Repairs" count={repairs.length} />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "assets" && <AssetsTab assets={assets} branches={branches} onRefresh={fetchAll} />}
            {activeTab === "assign" && <AssignTab assignments={assignments} assets={assets} employees={employees} onRefresh={fetchAll} />}
            {activeTab === "repair" && <RepairTab repairs={repairs} assets={assets} onRefresh={fetchAll} />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
