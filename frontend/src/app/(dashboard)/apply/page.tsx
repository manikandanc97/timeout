"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import React, { useState, useMemo } from "react";
import { CalendarPlus } from "lucide-react";

const ApplyLeave = () => {
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  }, [startDate, endDate]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col bg-white shadow-md p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex justify-center items-center bg-blue-50 rounded-lg w-8 h-8">
            <CalendarPlus size={18} className="text-blue-500" />
          </div>
          <h2 className="font-semibold text-lg">Apply Leave</h2>
        </div>

        <div className="space-y-5">
          <Select
            id="leave-type"
            label="Leave Type"
            placeholder="Select Leave Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { label: "Casual Leave", value: "CASUAL" },
              { label: "Sick Leave", value: "SICK" },
              { label: "Maternity Leave", value: "MATERNITY" },
              { label: "Paternity Leave", value: "PATERNITY" },
            ]}
          />
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <Input
              id="start-date"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              id="end-date"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Input
            id="total-days"
            label="Total Days"
            type="text"
            value={totalDays.toString()}
            onChange={() => {}}
            inputClassName="bg-gray-50 text-gray-400 cursor-not-allowed select-none border-gray-200"
          />

          <div className="relative w-full">
            <textarea
              id="reason"
              className="peer block w-full rounded-md border border-gray-300 bg-transparent px-3 pt-2 pb-2 text-sm text-gray-900 outline-none transition-all duration-150 ease-out focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
              rows={4}
              placeholder="Reason for leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => {}} className="px-6">
              Submit Leave Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
