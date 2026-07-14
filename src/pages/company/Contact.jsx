export default function Contact() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center mb-14">
        <h1 className="text-4xl font-bold text-slate-900">Contact Zenova HR</h1>
        <p className="text-gray-600 mt-3">
          Get support, demos, or partnership details from our team
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14">
        {/* LEFT INFO */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Get in Touch
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            We help organizations with HRMS implementation, product
            demonstrations, technical support and digital workforce
            transformation solutions.
          </p>

          <div className="space-y-5 text-gray-700">
            <div className="flex items-center gap-3">
              <span>📞</span>
              <span>+91 7894689818</span>
            </div>

            <div className="flex items-center gap-3">
              <span>✉</span>
              <span>support@zenovahr.com</span>
            </div>

            <div className="flex items-start gap-3">
              <span>📍</span>
              <span>
                Block-309/310, ODYSSA Business Center,
                <br />
                Rasulgarh, Bhubaneswar, 751010
              </span>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Send Message
          </h2>

          <form className="space-y-4">
            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Full Name"
            />

            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email Address"
            />

            <input
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Phone Number"
            />

            <textarea
              className="w-full p-3 border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your Message"
            />

            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* MAP */}
      <div className="max-w-7xl mx-auto px-6 mt-20">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
          Our Location
        </h2>

        <iframe
          className="w-full h-[450px] rounded-2xl shadow border"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=Block-309/310,%20ODYSSA%20Business%20Center,%20Rasulgarh,%20Bhubaneswar,%20751010&output=embed"
        />
      </div>
    </section>
  );
}
