"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { z } from "zod";

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().min(1, "Due date is required"),
  subjectId: z.string().min(1, "Subject is required"),
  lessonId: z.string().optional(),
  pdfUrl: z.string().optional(),
  solutionUrl: z.string().optional(),
  imgUrl: z.string().optional(),
});

type AssignmentSchema = z.infer<typeof assignmentSchema>;

interface Subject {
  id: number;
  name: string;
}

interface Lesson {
  id: number;
  topic: string;
  subjectId: number;
  classId: number;
  tutorId: number;
  subject: {
    name: string;
  };
  class: {
    name: string;
    grade: {
      name: string;
    };
  };
}

const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [solutionUrl, setSolutionUrl] = useState<string>("");
  const [img, setImg] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
  });

  // Fetch subjects and lessons on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, lessonsRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch(`/api/lessons${session?.user?.id ? `?tutorId=${session.user.id}` : ''}`),
        ]);

        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          setSubjects(subjectsData);
        }

        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          setAllLessons(lessonsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  // Filter lessons when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const filtered = allLessons.filter(
        (lesson) => lesson.subjectId === parseInt(selectedSubject)
      );
      setFilteredLessons(filtered);
    } else {
      setFilteredLessons([]);
    }
  }, [selectedSubject, allLessons]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSubject(value);
    setValue('subjectId', value);
    setValue('lessonId', ''); // Reset lesson when subject changes
  };

  const handleFileUpload = async (file: File, type: "assignment" | "solution" | "image") => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "document");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      switch (type) {
        case "assignment":
          setPdfUrl(data.url);
          setValue("pdfUrl", data.url);
          break;
        case "solution":
          setSolutionUrl(data.url);
          setValue("solutionUrl", data.url);
          break;
        case "image":
          setImg({ secure_url: data.url });
          setValue("imgUrl", data.url);
          break;
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: AssignmentSchema) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          dueDate: data.dueDate,
          subjectId: data.subjectId ? parseInt(data.subjectId) : undefined,
          lessonId: data.lessonId ? parseInt(data.lessonId) : undefined,
          pdfUrl: pdfUrl || undefined,
          solutionUrl: solutionUrl || undefined,
          imgUrl: img?.secure_url || undefined,
        }),
      });

      if (response.ok) {
        router.push("/List/assignments");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create assignment");
      }
    } catch (err) {
      setError("Error creating assignment");
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.role !== "TUTOR") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only tutors can create assignments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Assignment</h1>
          <p className="text-gray-600">Add a new assignment for your students to complete</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Assignment Title *</label>
            <input
              type="text"
              {...register("title")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., Algebra Problem Set 3"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Subject *</label>
            <select
              {...register("subjectId")}
              onChange={handleSubjectChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="text-sm text-red-600">{errors.subjectId.message}</p>
            )}
          </div>

          {/* Lesson Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Lesson <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <select
              {...register("lessonId")}
              disabled={!selectedSubject}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedSubject ? "Select a subject first" : "Select a lesson (optional)"}
              </option>
              {filteredLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.topic} - {lesson.class.name} ({lesson.class.grade.name})
                </option>
              ))}
            </select>
            {errors.lessonId && (
              <p className="text-sm text-red-600">{errors.lessonId.message}</p>
            )}
            {selectedSubject && filteredLessons.length === 0 && (
              <p className="text-sm text-amber-600">
                <i className="fas fa-info-circle mr-1"></i>
                No lessons found for this subject.
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Due Date *</label>
            <input
              type="datetime-local"
              {...register("dueDate")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
            {errors.dueDate && (
              <p className="text-sm text-red-600">{errors.dueDate.message}</p>
            )}
          </div>

          {/* File Uploads Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attachments (Optional)</h3>

            {/* Assignment PDF Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Assignment PDF</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "assignment");
                  }}
                  disabled={uploading}
                  className="hidden"
                  id="assignment-pdf"
                />
                <label
                  htmlFor="assignment-pdf"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploading
                      ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                      : pdfUrl
                      ? "border-green-300 bg-green-50"
                      : "border-purple-300 bg-purple-50 hover:bg-purple-100"
                  }`}
                >
                  {pdfUrl ? (
                    <>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-700">Assignment PDF uploaded</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {uploading ? "Uploading..." : "Upload assignment PDF"}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Solution PDF Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Solution PDF</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "solution");
                  }}
                  disabled={uploading}
                  className="hidden"
                  id="solution-pdf"
                />
                <label
                  htmlFor="solution-pdf"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploading
                      ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                      : solutionUrl
                      ? "border-green-300 bg-green-50"
                      : "border-purple-300 bg-purple-50 hover:bg-purple-100"
                  }`}
                >
                  {solutionUrl ? (
                    <>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-700">Solution PDF uploaded</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {uploading ? "Uploading..." : "Upload solution PDF"}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cover Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "image");
                  }}
                  disabled={uploading}
                  className="hidden"
                  id="cover-image"
                />
                <label
                  htmlFor="cover-image"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploading
                      ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                      : img
                      ? "border-green-300 bg-green-50"
                      : "border-purple-300 bg-purple-50 hover:bg-purple-100"
                  }`}
                >
                  {img ? (
                    <>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-700">Image uploaded</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {uploading ? "Uploading..." : "Upload cover image"}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Assignment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
