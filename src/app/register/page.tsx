"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    email: z.string().email({ message: "Invalid email address!" }),
    role: z.string({ message: "Please select a role to Register!" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long!" }),
    firstName: z.string().min(1, { message: "FirstName is required!" }),
    lastName: z.string().min(1, { message: "LastName is required!" }),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email.toLowerCase(),
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        password: values.password,
      }),
    });

    if (response.ok) {
      router.push("/sign-in");
    } else {
      const errorData = await response.json();
      console.error("Registration failed", errorData);
      alert("Registration failed!");
    }
  };

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <h6 className="section-title bg-white text-center text-primary px-3">
            Get Started
          </h6>
          <h1 className="mb-5">Create Your Account</h1>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-lg-6 col-md-8 wow fadeInUp" data-wow-delay="0.3s">
            <div className="bg-light p-5">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                  {/* First Name */}
                  <div className="col-md-6">
                    <input
                      type="text"
                      {...register("firstName")}
                      className="form-control"
                      placeholder="First Name"
                    />
                    {errors.firstName && (
                      <p className="text-danger small">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="col-md-6">
                    <input
                      type="text"
                      {...register("lastName")}
                      className="form-control"
                      placeholder="Last Name"
                    />
                    {errors.lastName && (
                      <p className="text-danger small">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-md-12">
                    <input
                      type="email"
                      {...register("email")}
                      className="form-control"
                      placeholder="Email Address"
                    />
                    {errors.email && (
                      <p className="text-danger small">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="col-12">
                    <select {...register("role")} className="form-control">
                      <option value="" disabled>
                        Choose a Role
                      </option>
                      <option value="student">Learner</option>
                      <option value="parent">Parent</option>
                    </select>
                    {errors.role && (
                      <p className="text-danger small">{errors.role.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="col-md-12">
                    <input
                      type="password"
                      {...register("password")}
                      className="form-control"
                      placeholder="Create Password"
                    />
                    {errors.password && (
                      <p className="text-danger small">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="col-md-12">
                    <input
                      type="password"
                      {...register("confirmPassword")}
                      className="form-control"
                      placeholder="Confirm Password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-danger small">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button className="btn btn-primary w-100 py-3" type="submit">
                    Register Now
                  </button>

                  <div className="col-12 text-center">
                    <p className="mb-0">
                      Already have an account?{" "}
                      <a href="/sign-in">Sign in here</a>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
