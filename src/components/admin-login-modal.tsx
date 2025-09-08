// components/admin-login-modal.tsx
"use client";

import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/services/firebase";

export default function AdminLoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password && password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdTokenResult();
      if (token.claims.admin) {
        onOpenChange(false);
        router.push("/dashboard");
      } else {
        toast({ title: "Not authorized", description: "This account is not an admin", variant: "destructive" });
      }
    } catch (err: unknown) {
      toast({ title: "Login failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaultAdmin = async () => {
    try {
      const res = await fetch("/api/setup-admin", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Default admin created", description: "Use admin@admin.in / helloo to log in" });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (err: unknown) {
      toast({
        title: "Error creating admin",
        description: (err as Error)?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white p-6 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
          <Button variant="outline" onClick={handleCreateDefaultAdmin}>
            Create Default Admin (dev only)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
