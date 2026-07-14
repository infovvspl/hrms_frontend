export default function Partners() {

  const partners = [
    "https://images.unsplash.com/photo-1572021335469-31706a17aaef",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72",
    "https://images.unsplash.com/photo-1551836022-4c4c79ecde51",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-indigo-50 via-purple-50 to-white">

      {/* HEADER */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-indigo-900">
          Our Partners
        </h1>

        <p className="text-purple-700 mt-2">
          Trusted by companies worldwide
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">

        {partners.map((img, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition p-6 flex items-center justify-center"
          >
            <img
              src={img}
              alt={`partner-${i}`}
              className="h-20 w-full object-contain"
              loading="lazy"
            />
          </div>
        ))}

      </div>

    </section>
  );
}