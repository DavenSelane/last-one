"use client";

import { useState } from "react";
import { toast } from "react-toastify";

interface AssignmentUploadModalProps {
  assignmentId: number;
  assignmentTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignmentUploadModal = ({
  assignmentId,
  assignmentTitle,
  onClose,
  onSuccess,
}: AssignmentUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", assignmentId.toString());

      const response = await fetch("/api/assignments/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Assignment submitted successfully!");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to submit assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
          <div
            className="modal-header border-0 text-white"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "20px 20px 0 0",
            }}
          >
            <h5 className="modal-title fw-bold">
              <i className="fas fa-upload me-2"></i>
              Submit Assignment
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={uploading}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label fw-bold text-muted small">ASSIGNMENT</label>
                <div className="p-3 rounded" style={{ backgroundColor: "#f8fafc" }}>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-file-alt text-primary me-2"></i>
                    <span className="fw-bold">{assignmentTitle}</span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold text-muted small">
                  UPLOAD YOUR WORK *
                </label>
                <input
                  type="file"
                  className="form-control form-control-lg"
                  style={{ borderRadius: "12px", border: "2px solid #e2e8f0" }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                  disabled={uploading}
                />
                <div className="form-text mt-2">
                  <small className="text-muted">
                    Accepted formats: PDF, DOC, DOCX, ZIP, JPG, PNG (Max: 10MB)
                  </small>
                </div>
              </div>

              {file && (
                <div className="mb-3">
                  <div
                    className="p-3 rounded d-flex align-items-center justify-content-between"
                    style={{ backgroundColor: "#dbeafe", border: "2px solid #3b82f6" }}
                  >
                    <div className="d-flex align-items-center">
                      <i className="fas fa-file text-primary me-2"></i>
                      <div>
                        <div className="fw-bold small">{file.name}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setFile(null)}
                      disabled={uploading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer border-0 p-4">
              <button
                type="button"
                className="btn btn-light btn-lg px-4"
                style={{ borderRadius: "12px" }}
                onClick={onClose}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-lg px-4 text-white"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "12px",
                  border: "none",
                }}
                disabled={uploading || !file}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentUploadModal;
