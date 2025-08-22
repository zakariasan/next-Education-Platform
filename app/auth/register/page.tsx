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
    <div className="flex flex-col gap-5 items-center justify-center min-h-screen bg-[var(--primary-50)]">

      <h1 className="text-4xl font-bold">PhysiClub</h1>
      <Card className="w-full max-w-sm p-4 shadow-md ">
        <CardHeader>
          <CardTitle className="text-center text-xl">Register</CardTitle>
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
            />
            <Input
              type="email"
              placeholder="Email : exemple@hello.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" variant="outline" className="w-full cursor-pointer border-[var(--primary-600)] text-l">Register</Button>
          </form>

        </CardContent>
      </Card>
      <div>
        <span className="text-muted-foreground">
          If you have an account?&nbsp;
        </span>
        <Link
          href="/auth/login"
          className="text-primary hover:underline"
        >
          Sign in.
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
