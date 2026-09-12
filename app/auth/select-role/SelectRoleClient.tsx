"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Session } from "next-auth";
import { GraduationCap, School2, BookOpenText } from "lucide-react";
import { Card } from "@/components/ui/card";
import FloatingIcons from "@/components/FloatingIcons";

interface SelectRoleClientProps {
  session: Session;
}

export default function SelectRoleClient({ session }: SelectRoleClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setRole = async (role: "STUDENT" | "TEACHER") => {
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user?.email, role }),
      });

      if (res.ok) {
        router.push(role === "TEACHER" ? "/dashboard/teacher" : "/dashboard/student");
      } else {
        console.error("Failed to set role");
      }
    } catch (error) {
      console.error("Error setting role:", error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-8 overflow-hidden bg-[#0a0e27] text-white p-4">
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-primary/25 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -right-24 w-[420px] h-[420px] bg-secondary/20 rounded-full blur-[100px]" />
      </div>
      <FloatingIcons />
      <Link href="/" className="relative flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">PhysiClub</h1>
      </Link>

      <div className="relative text-center space-y-1">
        <h2 className="text-xl font-semibold text-white">One last step</h2>
        <p className="text-sm text-white/60">Tell us how you&apos;ll use PhysiClub</p>
      </div>

      <div className="relative grid sm:grid-cols-2 gap-4 w-full max-w-md">
        <Card
          onClick={() => !loading && setRole("TEACHER")}
          className="cursor-pointer border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center text-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <School2 className="w-7 h-7 text-white" />
          </div>
          <p className="font-bold text-white">I&apos;m a Teacher</p>
          <p className="text-xs text-white/50">Create classes, lessons and track progress</p>
        </Card>

        <Card
          onClick={() => !loading && setRole("STUDENT")}
          className="cursor-pointer border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center text-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg">
            <BookOpenText className="w-7 h-7 text-white" />
          </div>
          <p className="font-bold text-white">I&apos;m a Student</p>
          <p className="text-xs text-white/50">Join classes and keep up with your work</p>
        </Card>
      </div>

      {loading && (
        <p className="relative text-sm text-white/60">Setting things up…</p>
      )}
    </div>
  );
}
