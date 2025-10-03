"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Image from "next/image";

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  pdfUrl?: string;
  solutionUrl?: string;
  description?: string;
  maxScore: number;
  imgUrl?: string;
  Lesson?: {
    id: number;
    topic: string;
    subject: {
      id: number;
      name: string;
    };
    class: {
      id: number;
      name: string;
      grade: {
        id: number;
        name: string;
      };
    };
    tutor: {
      id: number;
      firstName: string;
      lastName: string;
    };
  } | null;
  results: Array<{
    id: number;
    score: number;
    submissionUrl?: string;
    status: string;
    submittedAt: string;
    student: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
}

const AssignmentDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mySubmission, setMySubmission] = useState<Assignment["results"][0] | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/assignment/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Assignment not found");
            router.push("/Assignment");
            return;
          }
          throw new Error("Failed to fetch assignment");
        }
        const data = await response.json();
        setAssignment(data);

        // Find current user's submission
        if (session?.user?.id) {
          const userSubmission = data.results?.find(
            (result: any) => result.student.id === parseInt(session.user.id!)
          );
          setMySubmission(userSubmission || null);
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast.error("Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [params.id, session, router]);

  const handleUpload = async (url: string) => {
    setUploading(true);
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment?.id,
          submissionUrl: url,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMySubmission(result);
        toast.success("Assignment submitted successfully!");
        // Refresh assignment data
        window.location.reload();
      } else {
        toast.error("Failed to submit assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Assignment not found</div>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isPastDue = dueDate < now;
  const timeRemaining = dueDate.getTime() - now.getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);

  const isStudent = session?.user?.role === "STUDENT";
  const isTutorOrAdmin = session?.user?.role === "TUTOR" || session?.user?.role === "ADMIN";

  return (
    <div className="container mt-5 mb-5">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="btn btn-outline-secondary mb-4"
      >
        <i className="fas fa-arrow-left me-2"></i>
        Back
      </button>

      {/* Assignment Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="mb-2">{assignment.title}</h1>
              {assignment.Lesson && (
                <p className="text-muted mb-0">
                  <i className="fas fa-book me-2"></i>
                  {assignment.Lesson.subject.name} - {assignment.Lesson.topic}
                </p>
              )}
            </div>
            {mySubmission && (
              <span
                className={`badge ${
                  mySubmission.status === "graded" ? "bg-success" : "bg-info"
                } px-3 py-2`}
              >
                {mySubmission.status === "graded"
                  ? `✓ Graded: ${mySubmission.score}/${assignment.maxScore}`
                  : "✓ Submitted"}
              </span>
            )}
          </div>

          <div className="row">
            <div className="col-md-6">
              {assignment.Lesson && (
                <>
                  <p className="mb-1">
                    <strong>Class:</strong> {assignment.Lesson.class.name} (
                    {assignment.Lesson.class.grade.name})
                  </p>
                  <p className="mb-1">
                    <strong>Tutor:</strong> {assignment.Lesson.tutor.firstName}{" "}
                    {assignment.Lesson.tutor.lastName}
                  </p>
                </>
              )}
              <p className="mb-1">
                <strong>Max Score:</strong> {assignment.maxScore}
              </p>
            </div>
            <div className="col-md-6">
              <p className="mb-1">
                <strong>Due Date:</strong>{" "}
                <span className={isPastDue ? "text-danger" : "text-success"}>
                  {dueDate.toLocaleString()}
                </span>
              </p>
              {!isPastDue && (
                <p className="mb-1">
                  <strong>Time Remaining:</strong>{" "}
                  <span
                    className={
                      daysRemaining <= 1
                        ? "text-danger"
                        : daysRemaining <= 3
                        ? "text-warning"
                        : "text-success"
                    }
                  >
                    {daysRemaining > 0
                      ? `${daysRemaining} day${daysRemaining > 1 ? "s" : ""}`
                      : hoursRemaining > 0
                      ? `${hoursRemaining} hour${hoursRemaining > 1 ? "s" : ""}`
                      : "Due soon!"}
                  </span>
                </p>
              )}
              {isPastDue && (
                <p className="mb-1">
                  <span className="badge bg-danger">Past Due</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Image */}
      {assignment.imgUrl && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Assignment Image</h5>
            <div className="position-relative" style={{ width: "100%", height: "400px" }}>
              <Image
                src={assignment.imgUrl}
                alt={assignment.title}
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {assignment.description && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Description</h5>
            <p className="text-muted">{assignment.description}</p>
          </div>
        </div>
      )}

      {/* Assignment Materials */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Assignment Materials</h5>
          <div className="d-flex flex-wrap gap-2">
            {assignment.pdfUrl ? (
              <a
                href={assignment.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="fas fa-download me-2"></i>
                Download Assignment PDF
              </a>
            ) : (
              <p className="text-muted">No PDF available</p>
            )}
            {assignment.solutionUrl && isPastDue && (
              <a
                href={assignment.solutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                <i className="fas fa-check-circle me-2"></i>
                View Solution
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Student Submission Section */}
      {isStudent && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Your Submission</h5>

            {mySubmission ? (
              <div className="alert alert-success border-0">
                <div className="d-flex align-items-start">
                  <i className="fas fa-check-circle me-3 mt-1"></i>
                  <div className="flex-grow-1">
                    <strong>Submission Received</strong>
                    <p className="mb-2">
                      <small className="text-muted">
                        Submitted: {new Date(mySubmission.submittedAt).toLocaleString()}
                      </small>
                    </p>
                    {mySubmission.submissionUrl && (
                      <a
                        href={mySubmission.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        <i className="fas fa-file-download me-1"></i>
                        View Your Submission
                      </a>
                    )}
                    {mySubmission.status === "graded" && (
                      <div className="mt-2 p-2 bg-white rounded">
                        <strong className="text-success">
                          Score: {mySubmission.score}/{assignment.maxScore} (
                          {Math.round((mySubmission.score / assignment.maxScore) * 100)}%)
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning border-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Not yet submitted!</strong> Upload your work before the deadline.
              </div>
            )}

            {!isPastDue && (
              <div suppressHydrationWarning>
                <CldUploadWidget
                  uploadPreset="Isinamuva"
                  onSuccess={(result: any) => handleUpload(result.info.secure_url)}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      className={`btn ${
                        mySubmission ? "btn-warning" : "btn-success"
                      } shadow-sm`}
                      disabled={uploading}
                    >
                      <i
                        className={`fas ${
                          uploading ? "fa-spinner fa-spin" : "fa-upload"
                        } me-2`}
                      ></i>
                      {uploading
                        ? "Uploading..."
                        : mySubmission
                        ? "Update Submission"
                        : "Submit Assignment"}
                    </button>
                  )}
                </CldUploadWidget>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Submissions (for Tutors/Admins) */}
      {isTutorOrAdmin && assignment.results && assignment.results.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Student Submissions</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Submission</th>
                  </tr>
                </thead>
                <tbody>
                  {assignment.results.map((result) => (
                    <tr key={result.id}>
                      <td>
                        {result.student.firstName} {result.student.lastName}
                      </td>
                      <td>{new Date(result.submittedAt).toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            result.status === "graded" ? "bg-success" : "bg-info"
                          }`}
                        >
                          {result.status}
                        </span>
                      </td>
                      <td>
                        {result.status === "graded"
                          ? `${result.score}/${assignment.maxScore}`
                          : "-"}
                      </td>
                      <td>
                        {result.submissionUrl && (
                          <a
                            href={result.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="fas fa-eye me-1"></i>
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetailPage;
