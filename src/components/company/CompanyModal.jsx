import { useState } from "react";
import { getCompanyInitial, getCompanyLogoSrc } from "../../utils/companyLogo";

const SUPPORTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const SUPPORTED_LOGO_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg"];

export default function CompanyModal({ open, onClose, onSave, editData }) {
  const getInitialData = () => {
    const src = editData && typeof editData === "object" ? editData : {};
    return {
      company_name: src.company_name ?? "",
      sector: src.sector ?? "",
      company_type:
        src.company_type ||
        src.company_type_name ||
        (src.company_type && src.company_type.company_type_name) ||
        "",
      email: src.email ?? "",
      phone: src.phone ?? "",
      password: src.password ?? "******",
      registration_number: src.registration_number ?? "",
      gst_no: src.gst_no ?? "",
      cin_number: src.cin_number ?? "",
      address1: src.address1 ?? "",
      address2: src.address2 ?? "",
      city: src.city ?? "",
      state: src.state ?? "",
      country: src.country ?? "",
      pincode: src.pincode ?? "",
      logo: src.logo ?? src.logo_url ?? src.company_logo ?? "",
      stamp: src.stamp ?? "",
      profile_pic: src.profile_pic ?? "",
    };
  };

  const getMediaSrc = (path) => {
    if (!path) return "";
    if (path.startsWith("data:") || path.startsWith("blob:")) return path;
    return `http://localhost:5000/${path}`;
  };

  // ✅ initialize once (NO useEffect needed)
  const [formData, setFormData] = useState(getInitialData());
  const [logoPreview, setLogoPreview] = useState(getMediaSrc(getInitialData().logo));
  const [logoError, setLogoError] = useState("");
  const [stampPreview, setStampPreview] = useState(getMediaSrc(getInitialData().stamp));
  const [stampError, setStampError] = useState("");

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const hasSupportedType = SUPPORTED_LOGO_TYPES.includes(file.type);
    const hasSupportedExtension = SUPPORTED_LOGO_EXTENSIONS.some((extension) =>
      fileName.endsWith(extension),
    );

    if (!hasSupportedType && !hasSupportedExtension) {
      if (fieldName === "stamp") {
        setStampError(`Please upload a valid image file for stamp.`);
      } else {
        setLogoError(`Please upload a valid image file for ${fieldName}.`);
      }
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (fieldName === "logo") {
      setLogoError("");
      setLogoPreview(previewUrl);
      setFormData((prev) => ({ ...prev, logoFile: file }));
    } else if (fieldName === "stamp") {
      setStampError("");
      setStampPreview(previewUrl);
      setFormData((prev) => ({ ...prev, stampFile: file }));
    }
  };;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { ...formData, id: editData?.id || Date.now() };

    if (editData && payload.password === "******") {
      delete payload.password;
    }

    onSave(payload);
  };

  if (!open) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const inputStyle = `
    w-full
    px-4
    py-3
    border
    border-slate-200
    rounded-xl
    bg-slate-50
    focus:bg-white
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    focus:border-blue-500
    transition-all
    text-sm
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-purple-100 rounded-full blur-3xl opacity-50"></div>

        <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {editData ? "Edit Company Profile" : "Complete Company Profile"}
              </h2>

              <p className="text-blue-100 text-sm mt-1">
                Enter your organization's information and business details
              </p>
            </div>

            <button
              onClick={onClose}
              className="absolute right-5 top-5 h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 hover:bg-red-500 hover:rotate-90"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Company Name *
              </label>
              <input
                name="company_name"
                value={formData.company_name}
                placeholder="Enter company name"
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Company Logo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getCompanyInitial(formData)}</span>
                  )}
                </div>

                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleFileChange(e, "logo")}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              {logoError && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {logoError}
                </p>
              )}
            </div>

            {/* Company Stamp */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Company Stamp
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {stampPreview ? (
                    <img
                      src={stampPreview}
                      alt="Company stamp preview"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-center leading-tight">No Stamp</span>
                  )}
                </div>

                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleFileChange(e, "stamp")}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>
              {stampError && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {stampError}
                </p>
              )}
            </div>



            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Company Type
              </label>

              <select
                name="company_type"
                value={formData.company_type}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select Company Type</option>
                <option value="Private Limited Company">
                  Private Limited Company
                </option>
                <option value="Public Limited Company">
                  Public Limited Company
                </option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Limited Liability Partnership (LLP)">
                  Limited Liability Partnership (LLP)
                </option>
                <option value="One Person Company (OPC)">
                  One Person Company (OPC)
                </option>
                <option value="NGO">Non-Governmental Organization (NGO)</option>
                <option value="Government">Government</option>
                <option value="Startup">Startup</option>
                <option value="MNC">Multi National Company (MNC)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Sector
              </label>
              <input
                name="sector"
                value={formData.sector}
                placeholder="e.g. IT, Finance, Manufacturing"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Company Email
              </label>
              <input
                name="email"
                value={formData.email}
                placeholder="Enter company email"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Phone Number *
              </label>
              <input
                name="phone"
                value={formData.phone}
                placeholder="Enter phone number"
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Account Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Enter your password"
                onChange={handleChange}
                className={inputStyle}
                required={!editData}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Registration Number
              </label>
              <input
                name="registration_number"
                value={formData.registration_number}
                placeholder="Enter registration number"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                GST Number
              </label>
              <input
                name="gst_no"
                value={formData.gst_no}
                placeholder="Enter GST number"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                CIN Number
              </label>
              <input
                name="cin_number"
                value={formData.cin_number}
                placeholder="Enter CIN number"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Address Line 1
              </label>
              <input
                name="address1"
                value={formData.address1}
                placeholder="Address line 1"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Address Line 2
              </label>
              <input
                name="address2"
                value={formData.address2}
                placeholder="Address line 2"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                City
              </label>
              <input
                name="city"
                value={formData.city}
                placeholder="City"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                State
              </label>
              <input
                name="state"
                value={formData.state}
                placeholder="State"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Country
              </label>
              <input
                name="country"
                value={formData.country}
                placeholder="Country"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Pincode
              </label>
              <input
                name="pincode"
                value={formData.pincode}
                placeholder="Pincode"
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold"
            >
              {editData ? "Update Profile" : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
