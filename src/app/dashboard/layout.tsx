"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

// Component Imports
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // --- YOUR ORIGINAL AUTHENTICATION LOGIC (UNCHANGED) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          toast.error("You must be logged in.");
          router.replace("/");
          return;
        }

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          toast.error("No Firestore record for this user.");
          router.replace("/");
          return;
        }

        const roles: string[] = snap.data().roles || [];
        if (!roles.includes("admin")) {
          toast.error("You are not authorized.");
          router.replace("/");
          return;
        }

        toast.success("Welcome, admin ✅");
      } catch (err) {
        console.error("Auth check failed:", err);
        toast.error("Authentication check failed.");
        router.replace("/");
      } finally {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);
  // --- END OF YOUR LOGIC ---

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  // --- RENDER THE CORRECTED DYNAMIC LAYOUT ---
  return (
    // The fix is here: changed h-screen to min-h-screen to allow vertical expansion
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      {/* This column now grows naturally with the content inside it */}
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 sm:px-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}