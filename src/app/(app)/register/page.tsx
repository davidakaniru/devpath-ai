"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegisterInput, registerSchema } from "@/lib/validation/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Route } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

const RegisterPage = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ resolver: yupResolver(registerSchema), mode: "onChange" });

  const onSubmit = (data: RegisterInput) => {
    console.log("register user data", data);
  };
  return (
    <div
      className="dark flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="w-full max-w-md surface-card p-8">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg path-glow">
            <Route className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold">DevPath AI</span>
        </Link>
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start your personalized learning journey.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="fullname"
            label="Fullname"
            placeholder="David Lee"
            {...register("fullName")}
            errorMessage={errors.fullName?.message}
          />
          <Input
            id="email"
            label="email"
            placeholder="you@example.com"
            {...register("email")}
            errorMessage={errors.email?.message}
          />
          <Input
            id="password"
            label="password"
            type="password"
            placeholder="min. 8 characters"
            {...register("password")}
            errorMessage={errors.password?.message}
          />

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have one?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
