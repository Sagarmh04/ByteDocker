"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AdminLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export default function AdminLoginModal({ open, onOpenChange }: AdminLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      toast.info("Logging in...");

      // 1️⃣ Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      toast.success(`Login successful for ${cred.user.email}`);

      // 2️⃣ Firestore role check
      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists()) {
        toast.error("No Firestore record found for this user.");
        return;
      }

      const roles: string[] = userDoc.data().roles || [];
      if (!roles.includes("admin")) {
        toast.error("You do not have admin access.");
        return;
      }

      toast.success("Admin role confirmed ✅");
      // 3️⃣ Set session cookie via API
      const idToken = await cred.user.getIdToken();
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Login failed");
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="sm:max-w-md bg-gray-900 text-gray-100 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center text-white">
            Admin Login
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-5 mt-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
