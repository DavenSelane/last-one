"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type EnrollSubjectButtonProps = {
  subjectId: number;
  subjectName: string;
  isEnrolled: boolean;
};

const EnrollSubjectButton = ({
  subjectId,
  subjectName,
  isEnrolled: initialEnrolled,
}: EnrollSubjectButtonProps) => {
  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnrollment = async () => {
    setLoading(true);
    try {
      const endpoint = isEnrolled ? "/api/student/unenroll" : "/api/student/enroll";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subjectId }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEnrolled(!isEnrolled);
        toast.success(
          isEnrolled
            ? `Unenrolled from ${subjectName}`
            : `Enrolled in ${subjectName}`
        );
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update enrollment");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnrollment}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
        isEnrolled
          ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
          : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {isEnrolled ? "Unenrolling..." : "Enrolling..."}
        </span>
      ) : isEnrolled ? (
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Enrolled
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Enroll
        </span>
      )}
    </button>
  );
};

export default EnrollSubjectButton;
