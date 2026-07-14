import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function EmployeeChart() {
  const data = [
    { month: "Jan", employees: 120 },
    { month: "Feb", employees: 135 },
    { month: "Mar", employees: 150 },
    { month: "Apr", employees: 165 },
    { month: "May", employees: 180 },
    { month: "Jun", employees: 210 },
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Employee Growth
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="employees"
            fill="#2563EB"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}