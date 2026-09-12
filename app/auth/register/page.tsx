"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import { FormEvent } from 'react';
import { GraduationCap } from "lucide-react";
import PhysicsFloat from "@/components/PhysicsFloat";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const router = useRouter();
  const submiting = async (e: FormEvent<HTMLFormElement> ) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/auth/login");
      toast.success("success, login right now ")
    } else {
  console.log("failed ",form, res)
      const { error } = await res.json();
      toast(error)
    }
  };

  return (
    <div className="relative flex flex-col gap-6 items-center justify-center min-h-screen overflow-hidden bg-[#0a0e27] text-white p-4">
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-secondary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -left-24 w-[420px] h-[420px] bg-primary/25 rounded-full blur-[100px]" />
      </div>
      <PhysicsFloat />

      <Link href="/" className="relative flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">PhysiClub</h1>
      </Link>

      <Card className="relative w-full max-w-sm p-4 border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl text-white">Register</CardTitle>
        </CardHeader>
        <CardContent>

          <form onSubmit={submiting}

            className="space-y-4 w-full justify-center"
          >
            <Input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-primary/40 h-11"
            />
            <Input
              type="email"
              placeholder="Email : exemple@hello.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-primary/40 h-11"
            />
            <Input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-primary/40 h-11"
            />
            <Button
              type="submit"
              className="w-full cursor-pointer text-base h-11 bg-gradient-to-r from-primary to-secondary border-0 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              Register
            </Button>
          </form>

        </CardContent>
      </Card>
      <div className="relative">
        <span className="text-white/50">
          If you have an account?&nbsp;
        </span>
        <Link
          href="/auth/login"
          className="text-white font-semibold underline underline-offset-2 hover:text-secondary transition-colors"
        >
          Sign in.
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
