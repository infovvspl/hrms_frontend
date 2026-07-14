import { FaUsers, FaUserCheck, FaUserClock, FaUserPlus } from "react-icons/fa";

export default function EmployeeStats({
  total = 0,
  active = 0,
  onLeave = 0,
  newHires = 0,
}) {
  const cards = [
    {
      title: "Total Employees",
      value: total,
      icon: <FaUsers size={22} />,
      colorClass: "bg-blue-50 text-blue-600 border-blue-100",
      accent: "bg-blue-500",
      detail: "Active directory list",
    },
    {
      title: "Active",
      value: active,
      icon: <FaUserCheck size={20} />,
      colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accent: "bg-emerald-500",
      detail: "On-duty work status",
    },
    {
      title: "On Leave",
      value: onLeave,
      icon: <FaUserClock size={20} />,
      colorClass: "bg-amber-50 text-amber-600 border-amber-100",
      accent: "bg-amber-500",
      detail: "Approved time off",
    },
    {
      title: "New Hires",
      value: newHires,
      icon: <FaUserPlus size={20} />,
      colorClass: "bg-purple-50 text-purple-600 border-purple-100",
      accent: "bg-purple-500",
      detail: "Joined last 30 days",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="
            relative
            bg-white/90
            backdrop-blur-md
            rounded-3xl
            p-6
            border border-slate-100
            shadow-[0_10px_30px_rgba(0,0,0,0.03)]
            hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]
            hover:-translate-y-1
            transition-all
            duration-300
            overflow-hidden
            group
            cursor-pointer
          "
        >
          {/* Subtle colored accent strip at the top */}
          <div className={`absolute top-0 left-0 w-full h-[4px] ${card.accent}`} />

          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                {card.title}
              </span>
              <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                {card.value}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {card.detail}
              </p>
            </div>

            {/* Icon container with border and hover rotation */}
            <div
              className={`
                p-4
                rounded-2xl
                border
                flex
                items-center
                justify-center
                transition-transform
                duration-300
                group-hover:scale-110
                group-hover:rotate-3
                ${card.colorClass}
              `}
            >
              {card.icon}
            </div>
          </div>

          {/* Decorative background shape */}
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-125 transition-transform duration-500 -z-10 opacity-60"></div>
        </div>
      ))}
    </div>
  );
}
