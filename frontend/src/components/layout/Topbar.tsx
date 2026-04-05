"use client";

import { usePathname } from "next/navigation";
import React, { useState } from "react";
import Button from "../ui/Button";
import { Bell, Moon, Settings, User } from "lucide-react";
import RightPanel from "./RightPanel";

const Topbar = () => {
  const pathname = usePathname();

  const [activePanel, setActivePanel] = useState<string | null>(null);

  const getTitle = () => {
    if (pathname === "/dashboard") {
      return "Dashboard";
    }
    if (pathname === "/leaves") {
      return "My Leaves";
    }
    if (pathname === "/apply") {
      return "Apply Leave";
    }
    if (pathname === "/team") {
      return "Team Leaves";
    }
    if (pathname === "/policy") {
      return "Leave Policy";
    }
    return "Dashboard";
  };

  return (
    <div className="flex justify-between items-center bg-white shadow-md p-4">
      <div>
        <h1 className="font-bold text-2xl">{getTitle()}</h1>
      </div>
      <div className="flex gap-2">
        <Button className="bg-transparent! hover:bg-gray-200 p-2 rounded-full">
          <Moon size={20} color="gray" />
        </Button>
        <Button
          onClick={() => {
            (setActivePanel("notifications"), console.log("clicked"));
          }}
          className="bg-transparent! hover:bg-gray-200 ml-2 p-2 rounded-full"
        >
          <Bell size={20} color="gray" />
        </Button>
        <Button
          onClick={() => setActivePanel("settings")}
          className="bg-transparent! hover:bg-gray-200 ml-2 p-2 rounded-full"
        >
          <Settings size={20} color="gray" />
        </Button>
        <Button
          onClick={() => setActivePanel("profile")}
          className="hover:bg-gray-200 ml-2 p-2 rounded-full"
        >
          <User size={20} />
        </Button>
      </div>

      <RightPanel
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
};

export default Topbar;
