"use client";

import { useEffect, useState } from "react";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import LoaderSpinner from "@/components/ui/Loader";
import api from "@/services/api";
import LeaveBalance from "@/components/dashboard/LeaveBalance";
import LeaveSummaryCards from "@/components/dashboard/LeaveSummaryCards";

type DashboardStats = {
  totalLeaves: number;
  pending: number;
  approved: number;
  rejected: number;
  balance: {
    casual: number;
    sick: number;
    maternity?: number;
    paternity?: number;
  };
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, userRes, leavesRes] = await Promise.all([
        api.get("/leaves/dashboard"),
        api.get("/profile"),
        api.get("/leaves"),
      ]);
      setStats(statsRes.data);
      setCurrentUser(userRes.data);

      const leaves = leavesRes.data || [];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonth = (l: any) => {
        if (!l.startDate && !l.createdAt) return false;
        const date = new Date(l.startDate || l.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      };

      setMonthlyUsage({
        casual: leaves.filter((l: any) => l.type === "CASUAL" && thisMonth(l)).length,
        sick: leaves.filter((l: any) => l.type === "SICK" && thisMonth(l)).length,
        maternity: leaves.filter((l: any) => l.type === "MATERNITY" && thisMonth(l)).length,
        paternity: leaves.filter((l: any) => l.type === "PATERNITY" && thisMonth(l)).length,
      });

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const cData = months.map(m => ({ month: m, value: 0 }));
      const sData = months.map(m => ({ month: m, value: 0 }));

      leaves.forEach((l: any) => {
        if (!l.startDate && !l.createdAt) return;
        const date = new Date(l.startDate || l.createdAt);
        if (date.getFullYear() === currentYear) {
          const idx = date.getMonth();
          if (l.type === "CASUAL") cData[idx].value += 1;
          if (l.type === "SICK") sData[idx].value += 1;
        }
      });

      setChartData({ casual: cData, sick: sData });

    } catch (err) {
      console.error(err);
    }
  };

  if (!stats || !monthlyUsage || !chartData) return <LoaderSpinner />;

  return (
    <div className="space-y-6">
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2">
          <WelcomeCard name={currentUser?.name ?? "User"} />
        </div>
        <div className="md:col-span-1">
          <LeaveBalance balance={stats.balance} />
        </div>
      </div>
      <div>
        <LeaveSummaryCards
          balance={stats.balance}
          monthlyUsage={monthlyUsage}
          chartData={chartData}
        />
      </div>
    </div>
  );
};

export default Dashboard;
