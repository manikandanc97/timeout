"use client";

import { useEffect, useState } from "react";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import Card from "@/components/ui/Card";
import LoaderSpinner from "@/components/ui/Loader";
import api from "@/services/api";
import LeaveBalance from "@/components/dashboard/LeaveBalance";
import LeaveCountChart from "@/components/dashboard/LeaveSummaryCards";
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, userRes] = await Promise.all([
        api.get("/leaves/dashboard"),
        api.get("/profile"),
      ]);
      setStats(statsRes.data);
      setCurrentUser(userRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <LoaderSpinner />;

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
        <LeaveSummaryCards balance={stats.balance} />
      </div>
    </div>
  );
};

export default Dashboard;
