"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Content {
  id: number;
  title: string;
  type: string;
  description: string;
  grades: number;
  subjectId: number;
  updatedAt: string;
  difficulty?: string;
}

interface Grade {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

const ContentManagement = () => {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterGrade, setFilterGrade] = useState<string>("ALL");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, gradesRes, subjectsRes] = await Promise.all([
          fetch(`/api/content?page=1&limit=100`),
          fetch("/api/grades"),
          fetch("/api/subjects"),
        ]);

        if (contentRes.ok) {
          const data = await contentRes.json();
          if (Array.isArray(data.content)) {
            setContentList(data.content);
            setFilteredContent(data.content);
          } else {
            throw new Error("Invalid content API response format");
          }
        } else {
          throw new Error(`Failed to fetch content: ${contentRes.status}`);
        }

        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          setGrades(gradesData);
        }

        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          setSubjects(subjectsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter content based on search and filters
  useEffect(() => {
    let filtered = contentList;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (content) =>
          content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "ALL") {
      filtered = filtered.filter((content) => content.type === filterType);
    }

    // Grade filter
    if (filterGrade !== "ALL") {
      filtered = filtered.filter(
        (content) => content.grades === parseInt(filterGrade)
      );
    }

    setFilteredContent(filtered);
  }, [searchTerm, filterType, filterGrade, contentList]);

  const getGradeName = (gradeId: number) => {
    const grade = grades.find((g) => g.id === gradeId);
    return grade ? grade.name : `Grade ${gradeId}`;
  };

  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : `Subject ${subjectId}`;
  };

  const handleEdit = (id: number) => {
    router.push(`/content?edit=${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this content?")) {
      try {
        const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
        if (res.ok) {
          const contentRes = await fetch(`/api/content?page=1&limit=100`);
          if (contentRes.ok) {
            const data = await contentRes.json();
            if (Array.isArray(data.content)) {
              setContentList(data.content);
            }
          }
        } else {
          alert("Failed to delete content");
        }
      } catch (err) {
        alert("Error deleting content");
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "VIDEO":
        return "fa-video";
      case "DOCUMENT":
        return "fa-file-alt";
      case "QUIZ":
        return "fa-question-circle";
      default:
        return "fa-book";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "VIDEO":
        return "bg-danger";
      case "DOCUMENT":
        return "bg-info";
      case "QUIZ":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Statistics
  const stats = {
    total: contentList.length,
    videos: contentList.filter((c) => c.type === "VIDEO").length,
    documents: contentList.filter((c) => c.type === "DOCUMENT").length,
    quizzes: contentList.filter((c) => c.type === "QUIZ").length,
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger border-0 shadow-sm" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="mb-1 fw-bold" style={{ color: "#1e293b" }}>
              <i className="fas fa-book-open me-2" style={{ color: "#667eea" }}></i>
              Content Management
            </h2>
            <p className="text-muted mb-0">Manage your teaching materials and resources</p>
          </div>
          <Link
            href="/content"
            className="btn btn-lg text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              border: "none",
            }}
          >
            <i className="fas fa-plus me-2"></i>
            Create Content
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px", backgroundColor: "#e0e7ff" }}
                  >
                    <i className="fas fa-book text-primary fa-lg"></i>
                  </div>
                  <div>
                    <p className="mb-0 text-muted small">Total Content</p>
                    <h3 className="mb-0 fw-bold">{stats.total}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px", backgroundColor: "#fee2e2" }}
                  >
                    <i className="fas fa-video text-danger fa-lg"></i>
                  </div>
                  <div>
                    <p className="mb-0 text-muted small">Videos</p>
                    <h3 className="mb-0 fw-bold">{stats.videos}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px", backgroundColor: "#dbeafe" }}
                  >
                    <i className="fas fa-file-alt text-info fa-lg"></i>
                  </div>
                  <div>
                    <p className="mb-0 text-muted small">Documents</p>
                    <h3 className="mb-0 fw-bold">{stats.documents}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px", backgroundColor: "#d1fae5" }}
                  >
                    <i className="fas fa-question-circle text-success fa-lg"></i>
                  </div>
                  <div>
                    <p className="mb-0 text-muted small">Quizzes</p>
                    <h3 className="mb-0 fw-bold">{stats.quizzes}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-5">
                <div className="position-relative">
                  <i
                    className="fas fa-search position-absolute text-muted"
                    style={{ left: "15px", top: "50%", transform: "translateY(-50%)" }}
                  ></i>
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: "10px", border: "2px solid #e2e8f0" }}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ borderRadius: "10px", border: "2px solid #e2e8f0" }}
                >
                  <option value="ALL">All Types</option>
                  <option value="VIDEO">Videos</option>
                  <option value="DOCUMENT">Documents</option>
                  <option value="QUIZ">Quizzes</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  style={{ borderRadius: "10px", border: "2px solid #e2e8f0" }}
                >
                  <option value="ALL">All Grades</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-1">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("ALL");
                    setFilterGrade("ALL");
                  }}
                  style={{ borderRadius: "10px" }}
                  title="Clear filters"
                >
                  <i className="fas fa-redo"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-5">
          <div
            className="d-inline-block p-4 rounded-circle mb-3"
            style={{ backgroundColor: "#f1f5f9" }}
          >
            <i className="fas fa-inbox fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted mb-2">No content found</h4>
          <p className="text-muted mb-4">
            {searchTerm || filterType !== "ALL" || filterGrade !== "ALL"
              ? "Try adjusting your filters"
              : "Get started by creating your first content"}
          </p>
          <Link
            href="/content"
            className="btn btn-primary"
            style={{ borderRadius: "10px" }}
          >
            <i className="fas fa-plus me-2"></i>
            Create Content
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredContent.map((content) => (
            <div key={content.id} className="col-xl-4 col-lg-6 col-md-6">
              <div
                className="card border-0 shadow-sm h-100 position-relative overflow-hidden"
                style={{
                  borderRadius: "16px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                {/* Type Badge */}
                <div
                  className="position-absolute top-0 start-0 m-3"
                  style={{ zIndex: 1 }}
                >
                  <span className={`badge ${getTypeBadgeColor(content.type)} px-3 py-2`}>
                    <i className={`fas ${getTypeIcon(content.type)} me-1`}></i>
                    {content.type}
                  </span>
                </div>

                {/* Card Header with Icon */}
                <div
                  className="card-header border-0 pt-4 pb-0"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    height: "120px",
                  }}
                >
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <i
                      className={`fas ${getTypeIcon(content.type)} text-white`}
                      style={{ fontSize: "3rem", opacity: "0.8" }}
                    ></i>
                  </div>
                </div>

                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-2" style={{ color: "#1e293b" }}>
                    {content.title}
                  </h5>
                  <p
                    className="card-text text-muted mb-3"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontSize: "0.9rem",
                    }}
                  >
                    {content.description}
                  </p>

                  {/* Metadata */}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span
                      className="badge bg-light text-dark px-3 py-2"
                      style={{ borderRadius: "8px" }}
                    >
                      <i className="fas fa-graduation-cap me-1"></i>
                      {getGradeName(content.grades)}
                    </span>
                    <span
                      className="badge bg-light text-dark px-3 py-2"
                      style={{ borderRadius: "8px" }}
                    >
                      <i className="fas fa-book me-1"></i>
                      {getSubjectName(content.subjectId)}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <small className="text-muted">
                      <i className="far fa-clock me-1"></i>
                      {formatDate(content.updatedAt)}
                    </small>
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="Edit"
                        onClick={() => handleEdit(content.id)}
                        style={{ borderRadius: "8px 0 0 8px" }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Delete"
                        onClick={() => handleDelete(content.id)}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
