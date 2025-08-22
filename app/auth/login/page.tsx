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
    <div className="flex flex-col gap-5 items-center justify-center min-h-screen bg-[var(--primary-50)]">
      <h1 className="text-4xl font-bold">PhysiClub</h1>
      <Card className="w-full max-w-sm p-4 shadow-md ">
        <CardHeader>
          <CardTitle className="text-center text-xl">Sign In</CardTitle>
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
            />
            <Input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" variant="outline" className="w-full  cursor-pointer border-[var(--primary-600)] text-l">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex gap-3 pt-5 justify-center text-sm flex-col border-t-1 border-gray-300 ">

      <Button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 border border-gray-300 font-medium cursor-pointer"
      >
        <FcGoogle size={20} />
        Sign in with Google
      </Button>

      <Button
        onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
        className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#145bcc] font-medium"
      >
        <FaFacebookF size={20} />
        Continue with Facebook
      </Button>

               </CardFooter>
      </Card>
      <div>
        <span className="text-muted-foreground">
          Do not have an account?
        </span>
        <Link
          href="/auth/register"
          className="text-primary hover:underline"
        >
          Register
        </Link>
      </div>

    </div>
  );
};

export default LoginPage;
