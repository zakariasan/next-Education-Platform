"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React, { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { FormEvent } from 'react';
import { GraduationCap } from "lucide-react";
import PhysicsFloat from "@/components/PhysicsFloat";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleLogin = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      ...form,
      redirect: false,
    });
    if (res?.ok) {
      toast.success("Login Successfully");
      router.push("/dashboard");
    } else {
      toast.error("Login failed", { description: "Invalid email or password" });
    }
  };

  return (
    <div className="relative flex flex-col gap-6 items-center justify-center min-h-screen overflow-hidden bg-[#0a0e27] text-white p-4">
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-primary/25 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -right-24 w-[420px] h-[420px] bg-secondary/20 rounded-full blur-[100px]" />
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
          <CardTitle className="text-center text-xl text-white">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLogin}
            className="space-y-4 w-full justify-center"
          >
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
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex gap-3 pt-5 justify-center text-sm flex-col border-t border-white/10">

      <Button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        variant="outline"
        className="w-full flex items-center justify-center gap-2 font-medium cursor-pointer h-11 bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
      >
        <FcGoogle size={20} />
        Sign in with Google
      </Button>

      <Button
        onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
        className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#145bcc] text-white font-medium cursor-pointer h-11 transition-all active:scale-[0.98]"
      >
        <FaFacebookF size={20} />
        Continue with Facebook
      </Button>

               </CardFooter>
      </Card>
      <div className="relative">
        <span className="text-white/50">
          Do not have an account?
        </span>{" "}
        <Link
          href="/auth/register"
          className="text-white font-semibold underline underline-offset-2 hover:text-secondary transition-colors"
        >
          Register
        </Link>
      </div>

    </div>
  );
};

export default LoginPage;
