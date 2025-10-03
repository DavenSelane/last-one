// app/components/RequireAuth.tsx
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

const RequireAuth = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in"); // Redirect to login if not authenticated
  }

  return <>{children}</>;
};

export default RequireAuth;
