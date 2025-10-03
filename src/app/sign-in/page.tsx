"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import z from "zod";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" }),
});

export default function Login() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await signIn("credentials", {
      email: values.email.toLowerCase(),
      password: values.password,
      callbackUrl: "/home",
    });
  };

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <h6 className="section-title bg-white text-center text-primary px-3">
            Welcome Back
          </h6>
          <h1 className="mb-5">Login to Your Account</h1>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-lg-6 col-md-8 wow fadeInUp" data-wow-delay="0.3s">
            <div className="bg-light p-5">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                  {/* Email */}
                  <div className="col-md-12">
                    <input
                      type="email"
                      {...register("email")}
                      className="form-control"
                      placeholder="Email"
                    />
                    {errors.email && (
                      <p className="text-danger small">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="col-md-12">
                    <input
                      type="password"
                      {...register("password")}
                      className="form-control"
                      placeholder="Password"
                    />
                    {errors.password && (
                      <p className="text-danger small">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <button className="btn btn-primary w-100 py-3" type="submit">
                    Sign-In
                  </button>
                </div>
              </form>
              <div className="mt-3 text-center">
                <p className="text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
