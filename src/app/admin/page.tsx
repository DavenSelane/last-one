"use client";

import { useEffect, useState } from "react";
import Announcements from "@/components/Announcements";
import AttendanceChart from "@/components/AttendanceChart";
import CountChart from "@/components/CountChart";
import EventCalendar from "@/components/EventCalendar";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";

const AdminPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 flex flex-col md:flex-row gap-4 items-start">
      {/* LEFT COLUMN */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex flex-wrap gap-4">
          <UserCard
            type="Total Users"
            count={stats?.totalUsers || 0}
            loading={loading}
          />
          <UserCard
            type="Total Lessons"
            count={stats?.totalLessons || 0}
            loading={loading}
          />
          <UserCard
            type="Assignments"
            count={stats?.totalAssignments || 0}
            loading={loading}
          />
          <UserCard
            type="Avg Score"
            count={stats?.averageScore || 0}
            loading={loading}
            trend={stats?.averageScore ? `${stats.averageScore}%` : "N/A"}
          />
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart data={stats?.userRoleCounts} />
          </div>
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChart />
          </div>
        </div>

        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;
