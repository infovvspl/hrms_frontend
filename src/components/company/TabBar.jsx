import { useNavigate } from "react-router-dom";
import {
  Building2,
  GitBranch,
  ShieldCheck,
  BadgeCheck,
  LayoutGrid,
} from "lucide-react";

const TABS = [
  { key: "company", label: "Company", icon: Building2 },
  { key: "branch", label: "Branch", icon: GitBranch },
  { key: "role", label: "Role", icon: ShieldCheck },
  { key: "designation", label: "Designation", icon: BadgeCheck },
  { key: "department", label: "Department", icon: LayoutGrid },
];

export default function TabBar({ activeTab }) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-2 mb-7 shadow-xl overflow-hidden relative">
      <div className="absolute right-0 top-0 h-full w-64 bg-white/5 blur-3xl pointer-events-none" />
      <div className="relative z-10 flex items-center gap-1 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;

          return (
            <button
              key={key}
              onClick={() =>
                navigate(key === "company" ? "/company" : `/${key}`)
              }
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-semibold text-sm transition-all duration-200 flex-1 justify-center ${
                active
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}