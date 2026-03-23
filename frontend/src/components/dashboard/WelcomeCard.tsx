import React from "react";
import Button from "../ui/Button";

const HrmIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background blobs / shapes */}
    <circle cx="120" cy="120" r="100" fill="#00a76f" fillOpacity="0.08" />
    <circle cx="160" cy="80" r="40" fill="#00a76f" fillOpacity="0.12" />
    
    {/* Main Dashboard Panel */}
    <rect x="30" y="60" width="180" height="120" rx="12" fill="white" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.05))" />
    <rect x="30" y="60" width="180" height="120" rx="12" stroke="#00a76f" strokeWidth="1" strokeOpacity="0.15"/>
    
    {/* Header of dashboard */}
    <rect x="30" y="60" width="180" height="28" rx="12" fill="#00a76f" fillOpacity="0.05" />
    {/* Window Controls */}
    <circle cx="50" cy="74" r="4" fill="#00a76f" fillOpacity="0.3" />
    <circle cx="64" cy="74" r="4" fill="#00a76f" fillOpacity="0.3" />
    <circle cx="78" cy="74" r="4" fill="#00a76f" fillOpacity="0.3" />

    {/* User profile card */}
    <rect x="46" y="100" width="60" height="66" rx="8" fill="#f8fafc" stroke="#f1f5f9" strokeWidth="1" />
    <circle cx="76" cy="124" r="14" fill="#00a76f" fillOpacity="0.15" />
    <path d="M62 152C62 144.268 68.268 138 76 138C83.732 138 90 144.268 90 152" stroke="#00a76f" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="76" cy="124" r="6" stroke="#00a76f" strokeWidth="2.5" />

    {/* Chart bars */}
    <rect x="124" y="136" width="16" height="30" rx="3" fill="#00a76f" fillOpacity="0.3" />
    <rect x="148" y="116" width="16" height="50" rx="3" fill="#00a76f" fillOpacity="0.6" />
    <rect x="172" y="96" width="16" height="70" rx="3" fill="#00a76f" />

    {/* Floating elements / Notifications */}
    <rect x="10" y="140" width="86" height="44" rx="8" fill="white" filter="drop-shadow(0 4px 6px rgba(0,167,111,0.1))" />
    <rect x="22" y="152" width="24" height="6" rx="3" fill="#00a76f" fillOpacity="0.3" />
    <rect x="22" y="166" width="44" height="4" rx="2" fill="#e2e8f0" />
    <circle cx="76" cy="162" r="10" fill="#00a76f" />
    <path d="M72 162L75 165L80 159" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WelcomeCard = ({
  name,
  greeting,
  todayDate,
}: {
  name: string;
  greeting?: string;
  todayDate?: string;
}) => {
  return (
    <div className="relative bg-linear-to-r from-[#00a76f]/10 via-white to-[#00a76f]/5 rounded-2xl overflow-hidden shadow-sm border border-[#00a76f]/20 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between min-h-[260px]">
      {/* Content - Left Side */}
      <div className="relative z-10 flex flex-col items-start gap-4 max-w-md">
        <div>
          <h1 className="text-[#00a76f] text-2xl font-semibold mb-1">
            Welcome back
          </h1>
          <h2 className="text-gray-900 text-3xl font-bold">{name}</h2>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mt-2">
          If you are going to use a passage of Lorem Ipsum, you need to be sure
          there isn't anything.
        </p>

        <Button className="bg-[#00a76f] hover:bg-[#008f5d] text-white font-bold py-2.5 px-6 rounded-lg transition-colors mt-4 shadow-md shadow-[#00a76f]/20">
          Go now
        </Button>
      </div>

      {/* Illustration - Right Side */}
      <div className="relative z-10 mt-8 md:mt-0 right-0 w-48 h-48 md:w-64 md:h-64 shrink-0 flex items-center justify-center">
        <HrmIllustration />
      </div>
    </div>
  );
};

export default WelcomeCard;
