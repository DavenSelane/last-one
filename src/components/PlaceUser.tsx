"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PlaceUserProps {
  userRole: string;
}

export default function PlaceUser({ userRole }: PlaceUserProps) {
  const router = useRouter();

  useEffect(() => {
    if (!userRole) return;

    switch (userRole) {
      case "STUDENT":
        router.push("/student");
        break;
      case "TUTOR":
        router.push("/tutor");
        break;
      case "PARENT":
        router.push("/parent");
        break;
      default:
        router.push("/"); // fallback
    }
  }, [userRole, router]);

  return null; // no UI, purely redirect logic
}
