export default function DesignationModal({
  open,
  onClose,
  onSave,
  formData,
  setFormData,
  editIndex,
}) {
  if (!open) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-lg shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        
        <div className="relative bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-6 py-5">
          <h2 className="text-white text-2xl font-bold">
            {editIndex ? "Update Designation" : "Add Designation"}
          </h2>

          <p className="text-slate-300 text-sm mt-1">
            Create and manage designation information
          </p>

          <button
            onClick={onClose}
            className="absolute right-5 top-5 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-red-500 hover:rotate-90 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Title
          </label>

          <input
            type="text"
            name="title"
            placeholder="Enter Designation Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              onClick={onSave}
              className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              {editIndex
                ? "Update Designation"
                : "Save Designation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}