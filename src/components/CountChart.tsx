"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CountChartProps {
  data?: {
    ADMIN: number;
    TUTOR: number;
    PARENT: number;
    STUDENT: number;
  };
}

const CountChart = ({ data }: CountChartProps) => {
  const chartData = data
    ? [
        {
          name: "Students",
          count: data.STUDENT,
          fill: "#3B82F6", // Blue
        },
        {
          name: "Tutors",
          count: data.TUTOR,
          fill: "#10B981", // Green
        },
        {
          name: "Parents",
          count: data.PARENT,
          fill: "#F59E0B", // Yellow
        },
        {
          name: "Admins",
          count: data.ADMIN,
          fill: "#EF4444", // Red
        },
      ]
    : [];

  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">User Distribution</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {/* CHART */}
      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={chartData}
          >
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-600">
          {total}
        </div>
      </div>
      {/* BOTTOM */}
      <div className="flex justify-center gap-4 flex-wrap">
        {chartData.map((item) => (
          <div key={item.name} className="flex flex-col gap-1 items-center">
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <h1 className="font-bold">{item.count}</h1>
            <h2 className="text-xs text-gray-500">
              {item.name} (
              {total > 0 ? Math.round((item.count / total) * 100) : 0}%)
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountChart;
