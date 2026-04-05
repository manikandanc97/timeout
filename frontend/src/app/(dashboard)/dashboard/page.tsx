"use client";

import { useEffect, useState } from "react";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import LoaderSpinner from "@/components/ui/Loader";
import api from "@/services/api";
import LeaveBalance from "@/components/dashboard/LeaveBalance";
import LeaveSummaryCards from "@/components/dashboard/LeaveSummaryCards";
import LeaveHistory from "@/components/dashboard/LeaveHistory";
import UpcomingHolidays from "@/components/dashboard/UpcomingHolidays";

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
  const [history, setHistory] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, userRes, leavesRes, holidaysRes, historyRes] =
        await Promise.allSettled([
          api.get("/leaves/dashboard"),
          api.get("/profile"),
          api.get("/leaves"),
          api.get("/holidays"),
          api.get("/history"),
        ]);

      const stats =
        statsRes.status === "fulfilled" ? statsRes.value.data : null;

      const user = userRes.status === "fulfilled" ? userRes.value.data : null;

      const leaves =
        leavesRes.status === "fulfilled" ? leavesRes.value.data : [];

      const holidays =
        holidaysRes.status === "fulfilled" ? holidaysRes.value.data : [];

      const history =
        historyRes.status === "fulfilled" ? historyRes.value.data : [];

      setStats(stats);
      setCurrentUser(user);
      setHolidays(holidays);
      setHistory(history);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonth = (l: any) => {
        if (!l.startDate && !l.createdAt) return false;
        const date = new Date(l.startDate || l.createdAt);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      };

      setMonthlyUsage({
        casual: leaves.filter((l: any) => l.type === "CASUAL" && thisMonth(l))
          .length,
        sick: leaves.filter((l: any) => l.type === "SICK" && thisMonth(l))
          .length,
        maternity: leaves.filter(
          (l: any) => l.type === "MATERNITY" && thisMonth(l),
        ).length,
        paternity: leaves.filter(
          (l: any) => l.type === "PATERNITY" && thisMonth(l),
        ).length,
      });

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const cData = months.map((m) => ({ month: m, value: 0 }));
      const sData = months.map((m) => ({ month: m, value: 0 }));

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
      <div>
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
          <LeaveHistory leaves={history} />
          <UpcomingHolidays holidays={holidays} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
