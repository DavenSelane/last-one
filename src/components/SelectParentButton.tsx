"use client";

import { useSession } from "next-auth/react";

const SelectParentButton = ({
  parentId,
  isSelected,
}: {
  parentId: number;
  isSelected: boolean;
}) => {
  const { data: session } = useSession();

  const handleParentChange = async (userId: number, parentId: number) => {
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, parentId }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        // Optionally update local state if needed
      }
    } catch (error) {
      console.error("Failed to update parent:", error);
    }
  };

  if (session?.user?.role !== "STUDENT" || !session.user.id) return null;

  if (isSelected) {
    return <span className="text-green-600 font-semibold">Selected</span>;
  }

  return (
    <button
      onClick={() => handleParentChange(Number(session.user.id), parentId)}
      className="bg-blue-500 text-white px-2 py-1 rounded"
    >
      Select
    </button>
  );
};

export default SelectParentButton;
