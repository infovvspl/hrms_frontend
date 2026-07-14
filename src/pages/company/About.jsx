export default function About() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692"
            alt="HR Technology"
            className="rounded-xl shadow-lg"
          />

          <div>
            <h1 className="text-4xl font-bold mb-6 text-gray-900">
              About Zenova HR
            </h1>

            <p className="text-gray-600 mb-4">
              Zenova HR is a modern HRMS platform focused on simplifying human
              resource operations through automation, cloud technology,
              workforce analytics and intelligent business solutions.
            </p>

            <p className="text-gray-600 mb-4">
              Our platform streamlines HR operations with smart automation,
              real-time analytics and scalable workforce management tools
              designed for modern organizations.
            </p>

            <p className="text-gray-600">
              We combine cloud infrastructure, automation and data-driven
              insights to create scalable HR solutions for startups, businesses
              and enterprise organizations.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <div className="p-6 shadow rounded-xl hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To simplify workforce management using modern HR technologies and
              automation.
            </p>
          </div>

          <div className="p-6 shadow rounded-xl hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
            <p className="text-gray-600">
              Creating intelligent workplaces where HR operations are seamless,
              data-driven and scalable.
            </p>
          </div>

          <div className="p-6 shadow rounded-xl hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3">Our Expertise</h3>
            <p className="text-gray-600">
              HRMS platforms, payroll automation, workforce analytics, cloud
              infrastructure and enterprise software development.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
