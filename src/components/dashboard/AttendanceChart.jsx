import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AttendanceChart() {
  const data = [
    { name: "Present", value: 220 },
    { name: "Absent", value: 15 },
    { name: "Leave", value: 8 },
    { name: "Late", value: 5 },
  ];

  const COLORS = [
    "#10B981",
    "#EF4444",
    "#F59E0B",
    "#3B82F6",
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Attendance Overview
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}