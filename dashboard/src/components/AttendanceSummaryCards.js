"use client";
import { useState, useEffect } from "react";
import { fetchStaffList, fetchTodayAttendance } from "@/services/api";

export function AttendanceSummaryCards() {
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        // Fetch both staff list and attendance data
        const [staffList, attendance] = await Promise.all([
          fetchStaffList(),
          fetchTodayAttendance(),
        ]);

        const total = staffList.length;
        const present = attendance.filter(
          (record) => record.status === "Present"
        ).length;

        setStats({
          total,
          present,
          absent: total - present,
        });
      } catch (error) {
        console.error("Failed to load attendance stats:", error);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <SummaryCard
        title="Total Staff"
        value={stats.total}
        valueClassName="text-blue-600"
      />
      <SummaryCard
        title="Present Today"
        value={stats.present}
        valueClassName="text-green-600"
      />
      <SummaryCard
        title="Absent Today"
        value={stats.absent}
        valueClassName="text-red-600"
      />
    </div>
  );
}

function SummaryCard({ title, value, valueClassName = "" }) {
  return (
    <div className="p-8 rounded-xl border border-gray-200 bg-white shadow-sm">
      <p className="text-base font-medium text-gray-600">{title}</p>
      <p className={`text-4xl font-bold mt-3 ${valueClassName}`}>{value}</p>
    </div>
  );
}
