// components/footer.tsx
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/services/firebase";
import AdminLoginModal from "@/components/admin-login-modal";
import { useRouter } from "next/navigation";

export function Footer() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await getIdTokenResult(user);
        if (token.claims.admin) {
          // Already logged in as admin → go directly to dashboard
          router.push("/dashboard");
        }
      }
    });
    return () => unsub();
  }, [router]);

  return (
    <footer className="w-full p-8 mt-20 border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h3 className="font-bold text-lg mb-2">Contact Us</h3>
          <p>management@bytedocker.com</p>
          <p>+91 99809 36762</p>
        </div>
        <div className="text-center md:text-right">
          <h3 className="font-bold text-lg mb-2">Follow Us</h3>
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/company/bytedocker"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/bytedocker"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Logo at footer bottom */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-muted-foreground hover:underline"
        >
          © ByteDocker
        </button>
      </div>

      <AdminLoginModal open={open} onOpenChange={setOpen} />
    </footer>
  );
}
