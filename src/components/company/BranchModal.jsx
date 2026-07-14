export default function BranchModal({
  open,
  onClose,
  onSave,
  formData,
  setFormData,
  editIndex,
}) {
  if (!open) return null;

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl animate-in fade-in duration-300">
        {/* =========================
            HEADER
        ========================= */}
        <div className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] px-6 py-5 flex justify-between items-center">
          <h2 className="text-white text-2xl font-bold">
            {editIndex !== null ? "Edit Branch" : "Add Branch"}
          </h2>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center transition-all duration-300 hover:bg-red-500 hover:rotate-90 hover:scale-110"
          >
            ✕
          </button>
        </div>

        {/* =========================
            FORM
        ========================= */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Branch Name"
              value={formData.name}
              onChange={handleChange}
              className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* PASSWORD (ONLY FOR CREATE) */}
            {editIndex === null && (
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}

            {/* PHONE */}
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* ADDRESS FIELDS */}
            <input type="text" name="address1" placeholder="Address Line 1" value={formData.address1} onChange={handleChange} className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />

            <input type="text" name="address2" placeholder="Address Line 2" value={formData.address2} onChange={handleChange} className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />

            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />

            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />

            <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />

            <input type="number" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />

            <input type="text" name="longitude" placeholder="Longitude (e.g. 78.0421 or 78.0421 E)" value={formData.longitude} onChange={handleChange} className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />

            <input type="text" name="latitude" placeholder="Latitude (e.g. 27.1751 or 27.1751 N)" value={formData.latitude} onChange={handleChange} className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* =========================
              BUTTONS
          ========================= */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              onClick={onSave}
              className="bg-gradient-to-r from-[#08112d] via-[#1a1d5f] to-[#08112d] text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300"
            >
              {editIndex !== null ? "Update Branch" : "Save Branch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
