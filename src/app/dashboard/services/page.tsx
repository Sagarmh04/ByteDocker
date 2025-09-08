"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

// Import your components
import ServicesOverview from "@/components/dashboard/services/ServicesOverview";
import DetailedPage from "@/components/dashboard/services/DetailedPage";

export default function DashboardPage() {
  const { theme } = useTheme();
  const [tab, setTab] = useState("overview");

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs Navigation */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList
            className={`flex w-fit rounded-xl px-1 ${
              theme === "dark"
                ? "bg-gray-800 text-gray-200"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <TabsTrigger
              value="overview"
              className="px-4 py-2 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="detailed"
              className="px-4 py-2 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition"
            >
              Detailed Page
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="mt-6">
            <TabsContent value="overview">
              <ServicesOverview />
            </TabsContent>
            <TabsContent value="detailed">
              <DetailedPage />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
