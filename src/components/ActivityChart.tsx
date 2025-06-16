
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { name: "Mon", users: 1200 },
  { name: "Tue", users: 1900 },
  { name: "Wed", users: 800 },
  { name: "Thu", users: 1500 },
  { name: "Fri", users: 2000 },
  { name: "Sat", users: 1700 },
  { name: "Sun", users: 1400 },
];

export function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="users" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
