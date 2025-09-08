"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils"; // Assumes you have this from shadcn/ui setup
import { Briefcase, Users, FolderKanban } from "lucide-react";


interface SidebarNavProps {
  isCollapsed?: boolean;
}



const navItems = [
  { href: "/dashboard/services", label: "Services", icon: Briefcase },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
];

export function SidebarNav({ isCollapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col gap-2 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                    isActive && "bg-muted font-medium text-primary",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn("truncate", isCollapsed && "sr-only")}>{item.label}</span>
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={5}>
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}