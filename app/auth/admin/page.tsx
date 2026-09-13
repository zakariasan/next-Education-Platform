"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";
import PhysicsFloat from "@/components/PhysicsFloat";

// Admin access: sign in (any account), then enter the ADMIN_SETUP_KEY from the
// server environment to promote that account to ADMIN.
export default function AdminAccessPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) toast.error("Invalid email or password");
  };

  const promote = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/promote-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(d.error ?? "Failed");
      await update();
      toast.success("You are now an admin");
      router.push("/dashboard/admin");
    } finally {
      setBusy(false);
    }
  };

  const signedIn = status === "authenticated";
  const alreadyAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0e27] text-white bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(50,64,205,0.35),transparent)] p-4">
      <PhysicsFloat />
      <Card className="relative w-full max-w-sm p-4 border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl text-white">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Admin access</CardTitle>
          <p className="text-xs text-white/60">
            {signedIn ? `Signed in as ${session?.user?.email}` : "Sign in, then enter the admin setup key."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!signedIn ? (
            <form onSubmit={login} className="space-y-3">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              <Button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-primary to-secondary border-0 font-semibold">Sign in</Button>
              <p className="text-center text-xs text-white/50">
                No account? <Link href="/auth/register" className="text-white hover:underline">Register</Link> first, then come back here.
              </p>
            </form>
          ) : alreadyAdmin ? (
            <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary border-0 font-semibold">
              <Link href="/dashboard/admin">Open admin dashboard</Link>
            </Button>
          ) : (
            <form onSubmit={promote} className="space-y-3">
              <Input type="password" placeholder="Admin setup key" value={key} onChange={(e) => setKey(e.target.value)} required className="bg-white/10 border-white/20 text-white placeholder:text-white/40" autoComplete="off" />
              <Button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-primary to-secondary border-0 font-semibold">Become admin</Button>
              <p className="text-center text-[11px] text-white/40">The key is set by the server owner (ADMIN_SETUP_KEY).</p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
