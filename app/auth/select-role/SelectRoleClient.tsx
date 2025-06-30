"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Session } from "next-auth";

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
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-xl font-semibold">Choose Your Role</h1>
      <button
        className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
        onClick={() => setRole("TEACHER")}
        disabled={loading}
      >
        {loading  ? "Loading..." : "I'm a Teacher"}
      </button>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        onClick={() => setRole("STUDENT")}
        disabled={loading}
      >
        {loading ? "Loading..." : "I'm a Student"}
      </button>
    </div>
  );
}
