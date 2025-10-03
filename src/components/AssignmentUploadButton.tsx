"use client";

import { useState } from "react";
import AssignmentUploadModal from "./AssignmentUploadModal";
import Image from "next/image";

interface AssignmentUploadButtonProps {
  assignmentId: number;
  assignmentTitle: string;
  dueDate: Date;
}

const AssignmentUploadButton = ({
  assignmentId,
  assignmentTitle,
  dueDate,
}: AssignmentUploadButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = () => {
    // Refresh the page to show the updated submission status
    window.location.reload();
  };

  // Check if due date has passed
  const isPastDue = new Date() > new Date(dueDate);

  // Don't render button if past due date
  if (isPastDue) {
    return (
      <span className="text-xs text-red-600 font-medium">
        Past Due
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 hover:bg-green-50 rounded-full transition-colors"
        title="Submit Assignment"
      >
        <Image
          src="/upload.png"
          alt="Upload"
          width={16}
          height={16}
        />
      </button>

      {showModal && (
        <AssignmentUploadModal
          assignmentId={assignmentId}
          assignmentTitle={assignmentTitle}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default AssignmentUploadButton;
