import { Users, Handshake, Globe, Rocket } from "lucide-react";

export default function Partner() {
  const benefits = [
    {
      icon: Users,
      title: "Growing Market",
      desc: "HR tech demand is expanding across global companies.",
    },
    {
      icon: Handshake,
      title: "Revenue Growth",
      desc: "Earn recurring income through partnerships.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      desc: "Serve clients across multiple regions.",
    },
    {
      icon: Rocket,
      title: "Fast Expansion",
      desc: "Scale your business with our HR platform.",
    },
  ];

  const programs = [
    {
      title: "Technology Partner",
      image:
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Integrate your software with Zenova HR ecosystem.",
    },
    {
      title: "Implementation Partner",
      image:
        "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Help companies implement HR solutions effectively.",
    },
    {
      title: "Referral Partner",
      image:
        "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200",
      desc: "Refer clients and earn commission on sales.",
    },
  ];

  return (
    <div className="bg-[#F6F7FB] text-gray-800">
      {/* HERO */}
      <section className="bg-gradient-to-r from-indigo-700 via-blue-700 to-slate-800 text-white py-28">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6">Partner With Zenova HR</h1>

            <p className="text-lg text-white/80 mb-8">
              Join our ecosystem and grow your business with modern HR
              technology.
            </p>

            <button className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
              Become a Partner
            </button>
          </div>

          <img
            src="https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="partner"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* WHY PARTNER */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-14 text-slate-900">
            Why Partner With Zenova HR
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {benefits.map((item, i) => {
              const Icon = item.icon; // ✅ FIX (no warning)

              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                  <Icon className="text-indigo-600 mb-4" size={34} />

                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>

                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-14 text-slate-900">
            Partnership Programs
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((p, i) => (
              <div
                key={i}
                className="bg-[#F6F7FB] border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-52 w-full object-cover"
                />

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{p.title}</h3>

                  <p className="text-gray-600 text-sm mb-4">{p.desc}</p>

                  <button className="text-indigo-600 font-medium hover:underline">
                    Learn more →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-24 bg-[#F6F7FB]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-14 text-slate-900">
            Partner Benefits
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Marketing Support",
                desc: "Co-branded campaigns and sales materials.",
              },
              {
                title: "Technical Training",
                desc: "Product onboarding and training sessions.",
              },
              {
                title: "Revenue Sharing",
                desc: "Competitive commission structure.",
              },
            ].map((b, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Grow With Zenova HR</h2>

          <p className="mb-8 text-white/80 text-lg">
            Join our partner ecosystem and scale your business globally.
          </p>

          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg">
            Apply For Partnership
          </button>
        </div>
      </section>
    </div>
  );
}
