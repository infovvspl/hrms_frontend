import { useState } from "react";
import axios from "axios";
import { RefreshCw, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Demo() {
  const navigate = useNavigate();
  // CAPTCHA
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    return Array.from(
      { length: 6 },
      () =>
        chars[globalThis.Math.floor(globalThis.Math.random() * chars.length)],
    ).join("");
  };

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    business_email: "",
    country_code: "+91",
    phone_number: "",
    company_name: "",
    employee_size: "",
    service_provider: "",
    role: "",
    interested_services: [],
    other_services: [],
    requirements: "",
  });

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const exists = prev[field].includes(value);

      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (captchaInput.trim().toUpperCase() !== captcha) {
      alert("Invalid Captcha");
      return;
    }

    try {
      const payload = {
        ...formData,
        interested_services: formData.interested_services.join(", "),
        other_services: formData.other_services.join(", "),
      };

      const res = await axios.post(
        "http://localhost:5000/api/demo/book-demo",
        payload,
      );

      if (res.data.success) {
        alert("Demo Booked Successfully");
        refreshCaptcha();
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="w-full min-h-screen bg-white pt-28 pb-16 px-5 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
        {/* LEFT SIDE */}
        <div>
          {/* TOP TAG */}
          <div className="inline-flex items-center gap-2 bg-[#eef4ff] border border-[#cfe0ff] px-5 py-2 rounded-full">
            <span className="w-2 h-2 bg-[#0B2B63] rounded-full"></span>

            <p className="text-sm font-semibold text-[#0B2B63]">
              Modern HRMS Platform
            </p>
          </div>

          {/* HEADING */}
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mt-8 text-[#071C3F]">
            Simplify Your
            <br />
            <span className="text-[#0B2B63]">HR Operations</span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-8 text-lg leading-9 text-gray-600 max-w-2xl">
            Zenova HR helps businesses automate attendance, payroll, onboarding,
            recruitment, and employee management — all from one intelligent
            cloud-based HRMS platform.
          </p>

          {/* FEATURES */}
          <div className="mt-10 space-y-4">
            {[
              "Manage employees from one dashboard",
              "Automate payroll & attendance tracking",
              "Smart workflows for HR operations",
              "Real-time analytics & reports",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="min-w-[42px] h-[42px] rounded-2xl bg-[#eef4ff] border border-[#dbeafe] flex items-center justify-center">
                  <CheckCircle size={22} className="text-[#0B2B63]" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#071C3F]">
                    {item}
                  </h3>

                  <p className="text-gray-500 mt-1 text-sm">
                    Smart automation tools for modern businesses.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="relative max-w-lg mx-auto w-full">
          {/* GLOW */}
          <div className="absolute inset-0 bg-[#0B2B63]/5 blur-3xl rounded-[35px] opacity-70"></div>

          {/* FORM */}
          <div className="relative bg-white border border-[#dbeafe] rounded-[28px] shadow-xl p-5 lg:p-5">
            {/* TOP */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-[#eef4ff] border border-[#cfe0ff] px-4 py-2 rounded-full mb-4">
                <span className="w-2 h-2 rounded-full bg-[#0B2B63]"></span>

                <p className="text-sm font-semibold text-[#0B2B63]">
                  Free HRMS Consultation
                </p>
              </div>

              <h2 className="text-2xl font-bold text-[#071C3F]">Book a Demo</h2>

              <p className="text-gray-500 mt-1 text-sm leading-6">
                Experience Zenova HR in action
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* NAME + EMAIL */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[#071C3F] block mb-1.5">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    required
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full border border-[#dbeafe] bg-white rounded-2xl px-4 py-2.5 outline-none focus:border-[#0B2B63] focus:ring-4 focus:ring-[#0B2B63]/10 text-[#071C3F] placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#071C3F] block mb-1.5">
                    Business Email *
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    name="business_email"
                    value={formData.business_email}
                    onChange={handleChange}
                    className="w-full border border-[#dbeafe] bg-white rounded-2xl px-4 py-2.5 outline-none focus:border-[#0B2B63] focus:ring-4 focus:ring-[#0B2B63]/10 text-[#071C3F] placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="text-sm font-medium text-[#071C3F] block mb-1.5">
                  Phone Number *
                </label>

                <div className="flex">
                  <select className="border border-[#dbeafe] bg-white rounded-l-2xl px-4 outline-none text-[#071C3F] focus:border-[#0B2B63]">
                    <option>Afghanistan (+93)</option>
                    <option>Albania (+355)</option>
                    <option>Algeria (+213)</option>
                    <option>Argentina (+54)</option>
                    <option>Australia (+61)</option>
                    <option>Austria (+43)</option>
                    <option>Bangladesh (+880)</option>
                    <option>Belgium (+32)</option>
                    <option>Brazil (+55)</option>
                    <option>Canada (+1)</option>
                    <option>China (+86)</option>
                    <option>Denmark (+45)</option>
                    <option>Egypt (+20)</option>
                    <option>Finland (+358)</option>
                    <option>France (+33)</option>
                    <option>Germany (+49)</option>
                    <option>Greece (+30)</option>
                    <option>Hong Kong (+852)</option>
                    <option>Hungary (+36)</option>
                    <option>India (+91)</option>
                    <option>Indonesia (+62)</option>
                    <option>Ireland (+353)</option>
                    <option>Israel (+972)</option>
                    <option>Italy (+39)</option>
                    <option>Japan (+81)</option>
                    <option>Kenya (+254)</option>
                    <option>Malaysia (+60)</option>
                    <option>Mexico (+52)</option>
                    <option>Nepal (+977)</option>
                    <option>Netherlands (+31)</option>
                    <option>New Zealand (+64)</option>
                    <option>Nigeria (+234)</option>
                    <option>Norway (+47)</option>
                    <option>Pakistan (+92)</option>
                    <option>Philippines (+63)</option>
                    <option>Poland (+48)</option>
                    <option>Portugal (+351)</option>
                    <option>Qatar (+974)</option>
                    <option>Russia (+7)</option>
                    <option>Saudi Arabia (+966)</option>
                    <option>Singapore (+65)</option>
                    <option>South Africa (+27)</option>
                    <option>South Korea (+82)</option>
                    <option>Spain (+34)</option>
                    <option>Sri Lanka (+94)</option>
                    <option>Sweden (+46)</option>
                    <option>Switzerland (+41)</option>
                    <option>Thailand (+66)</option>
                    <option>Turkey (+90)</option>
                    <option>UAE (+971)</option>
                    <option>United Kingdom (+44)</option>
                    <option>United States (+1)</option>
                    <option>Vietnam (+84)</option>
                    <option>Wallis and Futuna (+681)</option>
                    <option>Yemen (+967)</option>
                    <option>Zambia (+260)</option>
                    <option>Zimbabwe (+263)</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Enter phone number"
                    required
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full border border-l-0 border-[#dbeafe] bg-white rounded-r-2xl px-4 py-2.5 outline-none focus:border-[#0B2B63] focus:ring-4 focus:ring-[#0B2B63]/10 text-[#071C3F] placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* COMPANY + EMPLOYEE */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[#071C3F] block mb-1.5">
                    Company *
                  </label>

                  <input
                    type="text"
                    placeholder="Company name"
                    required
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full border border-[#dbeafe] bg-white rounded-2xl px-4 py-2.5 outline-none focus:border-[#0B2B63] focus:ring-4 focus:ring-[#0B2B63]/10 text-[#071C3F] placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#071C3F] block mb-1.5">
                    No of Employees *
                  </label>

                  <select
                    name="employee_size"
                    value={formData.employee_size}
                    onChange={handleChange}
                    className="w-full border border-[#dbeafe] bg-white rounded-2xl px-4 py-2.5 outline-none text-[#071C3F] focus:border-[#0B2B63] focus:ring-4 focus:ring-[#0B2B63]/10"
                  >
                    <option value="">Select</option>
                    <option value="0-50">0 - 50</option>
                    <option value="51-100">51 - 100</option>
                    <option value="101-250">101 - 250</option>
                    <option value="251-500">251 - 500</option>
                    <option value="501-1000">501 - 1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>
              </div>

              {/* SERVICE PROVIDER */}
              <div>
                <label className="text-sm font-medium text-[#071C3F] block mb-1.5">
                  Existing service provider *
                </label>

                <select
                  name="service_provider"
                  value={formData.service_provider}
                  onChange={handleChange}
                  className="w-full border border-[#dbeafe] bg-white rounded-2xl px-4 py-2.5 outline-none text-[#071C3F] focus:border-[#0B2B63] focus:ring-4 focus:ring-[#0B2B63]/10"
                >
                  <option>Select your service provider</option>

                  <option>ADP</option>
                  <option>Adrenalin</option>
                  <option>BambooHR</option>
                  <option>Darwinbox</option>
                  <option>GreytHR</option>
                  <option>HROne</option>
                  <option>Keka</option>
                  <option>Namely</option>
                  <option>Paycom</option>
                  <option>Paycor</option>
                  <option>PeopleStrong</option>
                  <option>Sage</option>
                  <option>SAP</option>
                  <option>Workday</option>
                  <option>ZingHR</option>
                  <option>Zoho People</option>
                  <option>Spreadsheets</option>
                  <option>Other</option>
                  <option>None</option>
                </select>
              </div>

              {/* ROLE */}
              <div>
                <label className="text-sm font-medium text-[#071C3F] block mb-1.5">
                  Role *
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-[#dbeafe] bg-white rounded-2xl px-4 py-2.5 outline-none text-[#071C3F] focus:border-[#0B2B63] focus:ring-4 focus:ring-[#0B2B63]/10"
                >
                  <option value="">Select</option>

                  <option>Executive/Director(HR)</option>
                  <option>Executive/Director(Recruiting)</option>
                  <option>Executive/Director(Technology)</option>
                  <option>Executive/Director(Other)</option>
                  <option>Manager(HR)</option>
                  <option>Manager(Recruiting)</option>
                  <option>Manager(Technology)</option>
                  <option>Manager(Other)</option>
                  <option>HR Analyst</option>
                  <option>HR Generalist/Partner</option>
                  <option>Others</option>
                </select>
              </div>

              {/* SERVICES */}
              <div>
                <label className="text-sm font-medium text-[#071C3F] block mb-2">
                  Services you are interested in *
                </label>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700">
                  {[
                    "All Services",
                    "Onboarding & Offboarding HR",
                    "Core HR",
                    "Time and Attendance",
                    "Leave/Time-off",
                    "Performance and Compensation",
                    "LMS",
                    "HR help desk",
                  ].map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <input
                        type="checkbox"
                        value={item}
                        checked={formData.interested_services.includes(item)}
                        onChange={() =>
                          handleCheckboxChange("interested_services", item)
                        }
                        className="accent-[#0B2B63] w-4 h-4"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* OTHER SERVICES */}
              <div>
                <label className="text-sm font-medium text-[#071C3F] block mb-2">
                  Other services you might be interested in
                </label>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700">
                  {[
                    "Zenova Recruit",
                    "Zenova Payroll (India, UAE, KSA)",
                    "Zenova Expense",
                  ].map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <input
                        type="checkbox"
                        value={item}
                        checked={formData.other_services.includes(item)}
                        onChange={() =>
                          handleCheckboxChange("other_services", item)
                        }
                        className="accent-[#0B2B63] w-4 h-4"
                      />

                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* REQUIREMENTS */}
              <div>
                <label className="text-sm font-medium text-[#071C3F] block mb-1.5">
                  Requirements
                </label>

                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Tell us about your requirements..."
                  className="w-full border border-[#dbeafe] bg-white rounded-2xl px-4 py-2.5 resize-none outline-none focus:border-[#0B2B63] focus:ring-4 focus:ring-[#0B2B63]/10 text-[#071C3F] placeholder:text-gray-400"
                />
              </div>

              {/* CAPTCHA */}
              <div>
                <label className="text-sm font-medium text-[#071C3F] block mb-1.5">
                  Enter Captcha *
                </label>

                <div className="flex">
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter captcha"
                    required
                    className="w-full border border-[#dbeafe] bg-white rounded-l-2xl px-4 py-2.5 outline-none focus:border-[#0B2B63] text-[#071C3F] placeholder:text-gray-400"
                  />

                  <div className="bg-[#0B2B63] text-white px-4 flex items-center gap-3 rounded-r-2xl">
                    <span className="font-bold text-base tracking-widest">
                      {captcha}
                    </span>

                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="hover:rotate-180 transition duration-500"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* PRIVACY */}
              <p className="text-xs text-gray-500 leading-5">
                By submitting this form, you agree to our{" "}
                <span className="text-[#0B2B63] font-semibold cursor-pointer hover:underline">
                  Privacy Policy
                </span>
              </p>

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full bg-[#0B2B63] hover:bg-[#123D82] transition-all duration-300 text-white font-semibold py-3 rounded-2xl shadow-lg text-base"
              >
                Schedule Free Demo
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
