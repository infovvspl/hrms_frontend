export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "₹999",
      period: "/month",
      desc: "Best for small teams starting HR automation",
      features: [
        "Employee Database Management",
        "Attendance Tracking",
        "Leave Management",
        "Document Storage",
        "Email Support"
      ]
    },

    {
      name: "Professional",
      price: "₹4,499",
      period: "/month",
      desc: "For growing companies with full HR automation",
      popular: true,
      features: [
        "Everything in Starter",
        "Biometric + Mobile Attendance",
        "GPS Attendance Tracking",
        "Shift & Overtime Management",
        "Payroll (PF, ESI, TDS)",
        "Performance Management"
      ]
    },

    {
      name: "Enterprise",
      price: "₹8,999",
      period: "/month",
      desc: "For large organizations with advanced needs",
      features: [
        "Everything in Professional",
        "Advanced Analytics Dashboard",
        "API Integrations",
        "Role-Based Access Control",
        "Custom Workflows",
        "Dedicated Account Manager"
      ]
    }
  ];

  return (
    <section className="py-24 bg-[#F7FAFF]">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple & Transparent Pricing
          </h1>
          <p className="text-gray-600 text-lg">
            Choose a plan that scales with your business
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">

          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative bg-white rounded-3xl border shadow-md p-8 flex flex-col transition-all duration-300 hover:shadow-xl ${
                plan.popular ? "border-indigo-500" : "border-gray-100"
              }`}
            >

              {/* POPULAR BADGE */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm px-4 py-1 rounded-full shadow">
                  Most Popular
                </div>
              )}

              {/* TITLE */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {plan.name}
              </h2>

              <p className="text-gray-500 text-sm mb-6">
                {plan.desc}
              </p>

              {/* PRICE */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-500 ml-1">
                  {plan.period}
                </span>
              </div>

              {/* FEATURES */}
              <ul className="space-y-3 text-gray-600 mb-8 flex-1">
                {plan.features.map((f, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* BUTTON */}
              <button
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  plan.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                Get Started
              </button>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}