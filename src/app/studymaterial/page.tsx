"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-pdf to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });

// Import pdfjs for worker configuration
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

// Dynamic imports for performance
const CldVideoPlayer = dynamic(
  () =>
    import("next-cloudinary").then((mod) => ({ default: mod.CldVideoPlayer })),
  { ssr: false }
);
const CldImage = dynamic(
  () => import("next-cloudinary").then((mod) => ({ default: mod.CldImage })),
  { ssr: false }
);

interface Content {
  id: number;
  title: string;
  type: string;
  description: string;
  body?: string;
  imageUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  createdAt?: string | Date;
}

const Studymaterial = () => {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/content?page=1&limit=100`); // Fetch all or paginate
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', res.status, errorText);
          throw new Error(`Failed to fetch: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        console.log('Fetched content:', data);
        if (Array.isArray(data.content)) {
          setContentList(data.content);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const openTypeModal = useCallback((type: string) => {
    setSelectedType(type);
    setModalOpen(true);
  }, []);

  const openContentModal = useCallback((content: Content) => {
    setSelectedContent(content);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedType(null);
    setSelectedContent(null);
    setNumPages(null);
    setPageNumber(1);
    setPdfScale(1.0);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  const zoomIn = () => {
    setPdfScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setPdfScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = (content: Content) => {
    console.log('Download clicked for:', content);

    // Check for any media URL
    const mediaUrl = content.documentUrl || content.videoUrl || content.imageUrl;

    if (mediaUrl) {
      // Use proxy API to handle Cloudinary authentication issues
      const downloadUrl = `/api/download/${content.id}`;
      console.log('Opening download URL:', downloadUrl);
      window.open(downloadUrl, '_blank');
    } else if (content.body) {
      // Create HTML file from body content for text documents
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${content.title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>${content.title}</h1>
  <p><strong>Description:</strong> ${content.description}</p>
  <hr>
  ${content.body}
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${content.title}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      console.error('No content found:', content);
      alert('No downloadable content available for this item.');
    }
  };

  const getContentByType = (type: string) => {
    return contentList.filter(
      (content) => content.type.toUpperCase() === type.toUpperCase()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <h3 className="font-bold mb-2">Error Loading Content</h3>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const notesCount = getContentByType("DOCUMENT").filter(
    (c) => !c.documentUrl
  ).length;
  const videosCount = getContentByType("VIDEO").length;
  const quizzesCount = getContentByType("QUIZ").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Learning Resources</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access curriculum-aligned study materials, video lessons, and interactive quizzes designed for your academic success
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Content */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{contentList.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          {/* Recent Additions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {contentList.filter(c => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(c.createdAt || '') > weekAgo;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Subjects Covered */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Notes Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                {notesCount} items
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Study Notes</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive notes with key concepts, formulas, and summaries to help you study effectively
              </p>
              <button
                onClick={() => openTypeModal("DOCUMENT")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>Browse Notes</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Videos Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="relative h-48 bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                {videosCount} videos
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Video Lessons</h3>
              <p className="text-gray-600 mb-6">
                Expert-taught video tutorials covering complex topics with clear explanations and examples
              </p>
              <button
                onClick={() => openTypeModal("VIDEO")}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Watch Videos</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quizzes Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="relative h-48 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                {quizzesCount} quizzes
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Practice Quizzes</h3>
              <p className="text-gray-600 mb-6">
                Test your understanding with interactive quizzes and get instant feedback on your progress
              </p>
              <button
                onClick={() => openTypeModal("QUIZ")}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Take Quiz</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      {/* Enhanced Modal */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedContent
                      ? selectedContent.title
                      : `${selectedType} Content`}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Modal Body */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
                  {selectedContent ? (
                    // Single content view
                    <>
                      {selectedContent.type === "VIDEO" &&
                        selectedContent.videoUrl && (
                          <div className="ratio ratio-16x9">
                            <CldVideoPlayer
                              src={selectedContent.videoUrl}
                              controls
                            />
                          </div>
                        )}
                      {selectedContent.type === "DOCUMENT" &&
                        selectedContent.documentUrl && (
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                              <div className="d-flex gap-2 align-items-center">
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={zoomOut}
                                  disabled={pdfScale <= 0.5}
                                >
                                  <i className="fas fa-search-minus"></i>
                                </button>
                                <span className="badge bg-secondary">{Math.round(pdfScale * 100)}%</span>
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={zoomIn}
                                  disabled={pdfScale >= 2.0}
                                >
                                  <i className="fas fa-search-plus"></i>
                                </button>
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    window.open(selectedContent.documentUrl, "_blank")
                                  }
                                >
                                  <i className="fas fa-external-link-alt me-1"></i>
                                  Open in New Tab
                                </button>
                                <a
                                  href={selectedContent.documentUrl}
                                  download
                                  className="btn btn-outline-primary btn-sm"
                                >
                                  <i className="fas fa-download me-1"></i>
                                  Download
                                </a>
                              </div>
                            </div>

                            <div
                              style={{
                                height: "60vh",
                                width: "100%",
                                overflowY: "auto",
                                overflowX: "auto",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                backgroundColor: "#f8f9fa",
                                display: "flex",
                                justifyContent: "center",
                                padding: "20px"
                              }}
                            >
                              <Document
                                file={selectedContent.documentUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                  <div className="text-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Loading PDF...</span>
                                    </div>
                                    <p className="mt-2">Loading document...</p>
                                  </div>
                                }
                                error={
                                  <div className="alert alert-danger m-3">
                                    <p>Failed to load PDF file.</p>
                                    <a href={selectedContent.documentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                      Open in New Tab
                                    </a>
                                  </div>
                                }
                              >
                                <Page
                                  pageNumber={pageNumber}
                                  scale={pdfScale}
                                  renderTextLayer={true}
                                  renderAnnotationLayer={true}
                                />
                              </Document>
                            </div>

                            {numPages && (
                              <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={previousPage}
                                  disabled={pageNumber <= 1}
                                >
                                  <i className="fas fa-chevron-left me-1"></i>
                                  Previous
                                </button>
                                <span className="badge bg-primary">
                                  Page {pageNumber} of {numPages}
                                </span>
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={nextPage}
                                  disabled={pageNumber >= numPages}
                                >
                                  Next
                                  <i className="fas fa-chevron-right ms-1"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      {selectedContent.type === "DOCUMENT" &&
                        !selectedContent.documentUrl &&
                        selectedContent.body && (
                          <div>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: selectedContent.body,
                              }}
                            />
                          </div>
                        )}
                      {selectedContent.imageUrl && (
                        <div className="text-center">
                          <CldImage
                            src={selectedContent.imageUrl}
                            width={800}
                            height={600}
                            alt={selectedContent.title}
                            className="img-fluid"
                          />
                        </div>
                      )}
                      {selectedContent.type === "QUIZ" && (
                        <p>Quiz functionality coming soon!</p>
                      )}
                    </>
                  ) : selectedType ? (
                    // List view
                    <div>
                      {getContentByType(selectedType).length === 0 ? (
                        <div className="text-center py-12">
                          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-500 text-lg">No {selectedType.toLowerCase()} available yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getContentByType(selectedType).map((content) => (
                            <div key={content.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{content.title}</h3>
                              <p className="text-gray-600 text-sm mb-4">
                                {content.description}
                              </p>
                              <button
                                onClick={() => handleDownload(content)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Studymaterial;
