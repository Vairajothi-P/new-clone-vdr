"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DealSidebar from "@/components/deal/DealSidebar";

export default function BiddingLayout({ children }) {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [projectName, setProjectName] = useState("Project");

  useEffect(() => {
    // In a real app this might come from a context or API
    // For now we load the project name and requests from local storage like page.js does
    // Attempting to extract project name from URL params is tricky in a layout without searchParams
    // So we'll just check local storage or let DealSidebar default to "Project"
    
    // As a simple hack, check if we can parse the project name from other local storage keys
    let foundProject = "Project";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dms_deals_")) {
        foundProject = key.replace("dms_deals_", "");
        break;
      }
    }
    setProjectName(foundProject);

    const savedRequests = localStorage.getItem(`dms_requests_${foundProject}`);
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error("Failed to parse requests", e);
      }
    }
  }, []);

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans overflow-hidden">
      <DealSidebar 
        activeTab="bidding" 
        onTabClick={(tab) => {
          // If they click teaser, deals, or proposals in the sidebar, navigate back to deal setup
          router.push(`/dms/deal?tab=${tab}`);
        }}
        requests={requests}
        projectName={projectName}
      />
      <main className="flex-1 overflow-y-auto relative flex justify-center items-start">
        <div className="w-full h-full bg-white flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
