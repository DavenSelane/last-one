"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  pdfUrl?: string;
  solutionUrl?: string;
  description?: string;
  maxScore: number;
  lesson: {
    topic: string;
    subject: {
      name: string;
      id: number;
    };
    class: {
      name: string;
      grade: {
        name: string;
      };
    };
  };
}

interface Content {
  id: number;
  title: string;
  type: string;
  description: string;
  body?: string;
  subject: {
    name: string;
    id: number;
  };
  grades: number;
  videoUrl?: string;
  documentUrl?: string;
  difficulty: string;
}

interface Submission {
  id: number;
  submissionUrl?: string;
  status: string;
  submittedAt: string;
  score: number;
}

const AssignmentPage = () => {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentGrade, setStudentGrade] = useState<number | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to refresh countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      // Fetch student's grade
      if (session?.user?.id) {
        const userResponse = await fetch(`/api/user/${session.user.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setStudentGrade(userData.gradeId);
        }
      }

      // Fetch assignments
      const assignmentsResponse = await fetch("/api/assignments");
      if (!assignmentsResponse.ok) throw new Error("Failed to fetch assignments");
      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData);

      // Fetch content
      const contentResponse = await fetch("/api/content");
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setContents(contentData.content || []);
      }

      // Fetch student submissions
      const submissionsResponse = await fetch("/api/results");
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        const submissionsMap: Record<number, Submission> = {};
        submissionsData.forEach((sub: any) => {
          if (sub.assignmentId) {
            submissionsMap[sub.assignmentId] = sub;
          }
        });
        setSubmissions(submissionsMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (assignmentId: number, url: string) => {
    setUploadingId(assignmentId);
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          submissionUrl: url,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Real-time update: Update submissions state
        setSubmissions((prev) => ({
          ...prev,
          [assignmentId]: result,
        }));
        toast.success("Assignment submitted successfully!");
      } else {
        toast.error("Failed to submit assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading)
    return <div className="container mt-5">Loading...</div>;
  if (error)
    return <div className="container mt-5"><div className="text-danger">Error: {error}</div></div>;

  // Filter assignments by student's grade and only show those not yet due
  const filteredAssignments = studentGrade
    ? assignments.filter((assignment) => {
        const matchesGrade = assignment.lesson.class.grade.name.includes(String(studentGrade));
        const notDue = new Date(assignment.dueDate) > new Date(); // Only show if not yet due
        return matchesGrade && notDue;
      })
    : assignments.filter((assignment) => new Date(assignment.dueDate) > new Date());

  // Filter content by student's grade
  const filteredContents = studentGrade
    ? contents.filter((content) => content.grades === studentGrade)
    : contents;

  const getLinkedContent = (assignment: Assignment) => {
    return filteredContents.filter(
      (content) => content.subject.id === assignment.lesson.subject.id
    );
  };

  return (
    <div className="container mt-5 mb-5">
      <h1 className="mb-4">Assignments & Study Materials</h1>

      {/* Assignments Section with Linked Learning Content */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Your Active Assignments</h2>
          <div className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            <small>Assignments automatically hide after the due date</small>
          </div>
        </div>
        {filteredAssignments.length === 0 ? (
          <div className="alert alert-info border-0 shadow-sm">
            <div className="d-flex align-items-center">
              <i className="fas fa-check-circle fa-2x text-success me-3"></i>
              <div>
                <strong>All caught up!</strong>
                <p className="mb-0">No active assignments at the moment. Check back later for new assignments.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="accordion" id="assignmentsAccordion">
            {filteredAssignments.map((assignment, index) => {
              const submission = submissions[assignment.id];
              const linkedContent = getLinkedContent(assignment);
              const dueDate = new Date(assignment.dueDate);
              const now = new Date();
              const timeRemaining = dueDate.getTime() - now.getTime();
              const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
              const daysRemaining = Math.floor(hoursRemaining / 24);

              return (
                <div key={assignment.id} className="card mb-3 border-0 shadow-sm">
                  <div className="card-header border-0" id={`heading${assignment.id}`} style={{ backgroundColor: "#f8f9fa" }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <button
                          className="btn btn-link text-decoration-none fw-bold"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${assignment.id}`}
                          aria-expanded={index === 0}
                          aria-controls={`collapse${assignment.id}`}
                          style={{ color: "#1e293b" }}
                        >
                          <i className="fas fa-file-alt me-2 text-primary"></i>
                          {assignment.title}
                        </button>
                      </h5>
                      <div className="d-flex gap-2 align-items-center">
                        {submission && (
                          <span className={`badge ${
                            submission.status === 'graded' ? 'bg-success' : 'bg-info'
                          } px-3 py-2`}>
                            {submission.status === 'graded'
                              ? `✓ Graded: ${submission.score}/${assignment.maxScore}`
                              : '✓ Submitted'}
                          </span>
                        )}
                        {!submission && (
                          <span className="badge bg-warning text-dark px-3 py-2">
                            <i className="fas fa-clock me-1"></i>
                            Pending Submission
                          </span>
                        )}
                        <span className={`badge ${
                          daysRemaining <= 1 ? 'bg-danger' : daysRemaining <= 3 ? 'bg-warning text-dark' : 'bg-primary'
                        } px-3 py-2`}>
                          <i className="fas fa-calendar me-1"></i>
                          {daysRemaining > 0
                            ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left`
                            : hoursRemaining > 0
                            ? `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} left`
                            : 'Due soon!'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    id={`collapse${assignment.id}`}
                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                    aria-labelledby={`heading${assignment.id}`}
                    data-bs-parent="#assignmentsAccordion"
                  >
                    <div className="card-body">
                      <div className="row">
                        {/* Assignment Details */}
                        <div className="col-md-6">
                          <h6 className="text-primary">Assignment Details</h6>
                          <p>
                            <strong>Lesson:</strong> {assignment.lesson.topic}<br />
                            <strong>Subject:</strong> {assignment.lesson.subject.name}<br />
                            <strong>Class:</strong> {assignment.lesson.class.name} ({assignment.lesson.class.grade.name})<br />
                            <strong>Max Score:</strong> {assignment.maxScore}
                          </p>
                          {assignment.description && (
                            <div className="mb-3">
                              <strong>Description:</strong>
                              <p className="text-muted">{assignment.description}</p>
                            </div>
                          )}

                          {/* Assignment Actions */}
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {assignment.pdfUrl && (
                              <a
                                href={assignment.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-sm shadow-sm"
                                style={{ borderRadius: "8px" }}
                              >
                                <i className="fas fa-download me-1"></i>
                                Download Assignment
                              </a>
                            )}
                            {/* Upload button - always available before due date */}
                            <div suppressHydrationWarning>
                              <CldUploadWidget
                                uploadPreset="Isinamuva"
                                onSuccess={(result: any) =>
                                  handleUpload(assignment.id, result.info.secure_url)
                                }
                              >
                                {({ open }) => (
                                  <button
                                    onClick={() => open()}
                                    className={`btn ${submission ? 'btn-warning' : 'btn-success'} btn-sm shadow-sm`}
                                    style={{ borderRadius: "8px" }}
                                    disabled={uploadingId === assignment.id}
                                  >
                                    <i className={`fas ${uploadingId === assignment.id ? 'fa-spinner fa-spin' : 'fa-upload'} me-1`}></i>
                                    {uploadingId === assignment.id
                                      ? 'Uploading...'
                                      : submission ? 'Update Submission' : 'Submit Assignment'}
                                  </button>
                                )}
                              </CldUploadWidget>
                            </div>
                          </div>

                          {/* Submission Status */}
                          {submission && (
                            <div
                              className="alert border-0 shadow-sm"
                              style={{
                                backgroundColor: submission.status === 'graded' ? '#d1fae5' : '#dbeafe',
                                borderLeft: `4px solid ${submission.status === 'graded' ? '#10b981' : '#3b82f6'}`
                              }}
                            >
                              <div className="d-flex align-items-start">
                                <i className={`fas ${submission.status === 'graded' ? 'fa-check-circle text-success' : 'fa-info-circle text-primary'} me-2 mt-1`}></i>
                                <div>
                                  <strong>
                                    {submission.status === 'graded' ? 'Graded & Submitted' : 'Submission Received'}
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    <i className="fas fa-clock me-1"></i>
                                    {new Date(submission.submittedAt).toLocaleString()}
                                  </small>
                                  {submission.submissionUrl && (
                                    <>
                                      <br />
                                      <a
                                        href={submission.submissionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary mt-2"
                                        style={{ borderRadius: "6px" }}
                                      >
                                        <i className="fas fa-file-download me-1"></i>
                                        View Your Submission
                                      </a>
                                    </>
                                  )}
                                  {submission.status === 'graded' && (
                                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: 'white' }}>
                                      <strong className="text-success">
                                        Score: {submission.score}/{assignment.maxScore} ({Math.round((submission.score / assignment.maxScore) * 100)}%)
                                      </strong>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Warning for unsubmitted assignments */}
                          {!submission && (
                            <div className="alert alert-warning border-0 shadow-sm" style={{ borderLeft: '4px solid #f59e0b' }}>
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              <strong>Not yet submitted!</strong>
                              <span className="ms-2">Upload your work before the deadline.</span>
                            </div>
                          )}
                        </div>

                        {/* Linked Learning Content */}
                        <div className="col-md-6">
                          <h6 className="text-primary">Learning Resources ({assignment.lesson.subject.name})</h6>
                          {linkedContent.length === 0 ? (
                            <p className="text-muted">No learning materials available for this subject.</p>
                          ) : (
                            <div className="list-group">
                              {linkedContent.map((content) => (
                                <div key={content.id} className="list-group-item">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="mb-1">{content.title}</h6>
                                    <span className={`badge ${
                                      content.type === 'VIDEO' ? 'bg-danger' :
                                      content.type === 'DOCUMENT' ? 'bg-info' : 'bg-warning'
                                    }`}>
                                      {content.type}
                                    </span>
                                  </div>
                                  <p className="mb-2 small text-muted">{content.description}</p>
                                  <span className="badge bg-secondary me-2">{content.difficulty}</span>
                                  <div className="mt-2">
                                    {content.videoUrl && (
                                      <a
                                        href={content.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-danger me-2"
                                      >
                                        <i className="fas fa-play me-1"></i>Watch
                                      </a>
                                    )}
                                    {content.documentUrl && (
                                      <a
                                        href={content.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-info"
                                      >
                                        <i className="fas fa-file me-1"></i>View
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Study Materials */}
      <div>
        <h2 className="mb-3">All Study Materials for Your Grade</h2>
        {filteredContents.length === 0 ? (
          <div className="alert alert-info">No study materials available for your grade.</div>
        ) : (
          <div className="row">
            {filteredContents.map((content) => (
              <div key={content.id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title">{content.title}</h5>
                      <span className={`badge ${
                        content.type === 'VIDEO' ? 'bg-danger' :
                        content.type === 'DOCUMENT' ? 'bg-info' : 'bg-warning'
                      }`}>
                        {content.type}
                      </span>
                    </div>
                    <p className="card-text">
                      <strong>Subject:</strong> {content.subject.name}<br />
                      <strong>Difficulty:</strong> {content.difficulty}<br />
                      <small className="text-muted">{content.description}</small>
                    </p>
                    <div className="mt-2">
                      {content.videoUrl && (
                        <a
                          href={content.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm me-2"
                        >
                          <i className="fas fa-play me-1"></i>Watch Video
                        </a>
                      )}
                      {content.documentUrl && (
                        <a
                          href={content.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-info btn-sm"
                        >
                          <i className="fas fa-file me-1"></i>View Document
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentPage;
