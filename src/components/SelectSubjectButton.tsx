"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const SelectSubjectButton = ({
  subjectId,
  isSelected,
}: {
  subjectId: number;
  isSelected: boolean;
}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubjectChange = async (userId: number, subjectId: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subjectId }),
      });
      if (res.ok) {
        toast.success("Subject selected successfully!");
        router.refresh();
      } else {
        toast.error("Failed to select subject");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error("Failed to update subject:", error);
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.role !== "STUDENT" || !session.user.id) return null;

  if (isSelected) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
        <svg
          className="w-4 h-4 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="text-xs font-medium text-green-700">Enrolled</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => handleSubjectChange(Number(session.user.id), subjectId)}
      disabled={loading}
      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-3 w-3 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Enrolling...</span>
        </>
      ) : (
        <span>Enroll</span>
      )}
    </button>
  );
};

export default SelectSubjectButton;
