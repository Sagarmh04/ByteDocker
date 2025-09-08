"use client";

import { useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "relative hidden h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out md:flex",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <h2 className={cn("text-lg font-semibold", isCollapsed && "sr-only")}>Admin Panel</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav isCollapsed={isCollapsed} />
      </div>
      <div className="mt-auto border-t p-2">
        <Button onClick={toggleSidebar} variant="ghost" size="icon" className="h-10 w-full">
          {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
    </aside>
  );
}