"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { yupResolver } from "@hookform/resolvers/yup";
import { Route } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object({
  email: yup
    .string()
    .required("email is required")
    .email("input a valid email"),
  password: yup
    .string()
    .required("password is required")
    .min(8, "minimum of 8 characters"),
});

type RegisterData = yup.InferType<typeof schema>;

const LoginPage = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ resolver: yupResolver(schema), mode: "onChange" });

  const onSubmit = (data: RegisterData) => {
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
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick up where you left off.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            id="email"
            label="email"
            {...register("email")}
            errorMessage={errors.email?.message}
          />
          <Input
            id="password"
            label="password"
            type="password"
            {...register("password")}
            errorMessage={errors.password?.message}
          />

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
