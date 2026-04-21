"use client";

import AuthPageShell from "@/components/auth/AuthPageShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { setAccessToken } from "@/lib/token";
import api from "@/services/api";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

const LOGIN_TOAST_ID = "auth-login-feedback";

const Login = () => {
  const router = useRouter();
  const submitLock = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email && !password) {
      toast.error("Please fill in all fields", { id: LOGIN_TOAST_ID });
      return;
    }

    if (!email) {
      toast.error("Please enter your email", { id: LOGIN_TOAST_ID });
      return;
    }

    if (!password) {
      toast.error("Please enter your password", { id: LOGIN_TOAST_ID });
      return;
    }

    if (submitLock.current) return;
    submitLock.current = true;
    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      setAccessToken(res.data.accessToken);
      const message =
        typeof res.data?.message === "string" && res.data.message.trim()
          ? res.data.message
          : "Login successful";
      toast.success(message, { id: LOGIN_TOAST_ID });

      router.push("/dashboard");
    } catch (error: unknown) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosLike.response?.data?.message ?? "Login failed", {
        id: LOGIN_TOAST_ID,
      });
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      title="Welcome back"
      subtitle="Sign in with your work email to manage leaves and time off."
      leading={
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner ring-1 ring-primary/15">
          <LogIn className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            value={password}
            inputClassName="pr-10"
            onChange={(e) => setPassword(e.target.value)}
            rightElement={
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="!rounded !p-0 !text-card-foreground/90 hover:!bg-transparent hover:!text-primary focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff color="gray" size={18} />
                ) : (
                  <Eye color="gray" size={18} />
                )}
              </Button>
            }
          />
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-sm font-medium text-primary hover:underline focus:outline-none focus:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full py-2.5 text-[15px]"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
        <p className="pt-1 text-center text-sm text-muted-foreground">
          New here?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="cursor-pointer font-medium text-primary underline-offset-4 transition-colors hover:text-primary-dark hover:underline"
          >
            Create an account
          </button>
        </p>

        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            Try Demo Accounts
          </p>
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-auto py-2 sm:py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
              onClick={() => {
                setEmail("admin@acmehrm.com");
                setPassword("demo1234");
              }}
            >
              Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto py-2 sm:py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
              onClick={() => {
                setEmail("manager@acmehrm.com");
                setPassword("demo1234");
              }}
            >
              Manager
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto py-2 sm:py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
              onClick={() => {
                setEmail("employee@acmehrm.com");
                setPassword("demo1234");
              }}
            >
              Employee
            </Button>
          </div>
        </div>
      </form>
    </AuthPageShell>
  );
};

export default Login;
