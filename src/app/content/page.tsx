"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "react-toastify";
import { ContentSchema } from "../../../public/lib/FormValidationSchema";
import { contentSchema } from "../../../public/lib/FormValidationSchema";
import { ContentType, Subject } from "@prisma/client";
import { DB } from "@/lib/prisma";

const Page = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const router = useRouter();
  const [img, setImg] = useState<any>();
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContentSchema>({
    resolver: zodResolver(contentSchema),
    mode: "onSubmit",
  });

  const selectedType = watch("type");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", selectedType || "document");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedFileName(file.name);

      // Set the appropriate URL based on content type
      switch (selectedType) {
        case "VIDEO":
          setValue("videoUrl", data.url);
          break;
        case "DOCUMENT":
          setValue("documentUrl", data.url);
          break;
        case "QUIZ":
        default:
          setValue("imageUrl", data.url);
          setImg({ secure_url: data.url });
          break;
      }

      console.log("File uploaded successfully:", data.url);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, gradesRes] = await Promise.all([
          fetch("/api/subjects"),
          fetch("/api/grades"),
        ]);

        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          console.log("Fetched subjects:", subjectsData);
          setSubjects(subjectsData);
        }

        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          console.log("Fetched grades:", gradesData);
          setGrades(gradesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: ContentSchema) => {
    setLoading(true);
    setError(null);
    try {
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag)
        : [];
      // Validate authorId before sending request
      if (data.authorId && (isNaN(data.authorId) || data.authorId <= 0)) {
        setError("Invalid author ID. It must be a positive number.");
        setLoading(false);
        return;
      }

      const payload = {
        title: data.title,
        type: data.type,
        subjectId: data.subjectId,
        grades: data.grades,
        description: data.description,
        body: data.body,
        videoUrl: data.videoUrl || null,
        documentUrl: data.documentUrl || null,
        imageUrl: data.imageUrl || img?.secure_url || null,
        tags: tags as any,
        allowComments: data.allowComments,
        featured: data.featured,
        authorId: data.authorId,
      };

      console.log("Submitting content with payload:", payload);

      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create content");
      }

      const createdContent = await response.json();
      toast.success("Content uploaded successfully!");
      router.refresh();
      // Stay on the page after successful upload
    } catch (err) {
      console.error("Failed to save content:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Content</h1>
          <p className="text-gray-600">Add educational materials for students to access</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Content Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-semibold text-gray-900">Select Content Type</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Content Type</label>
                <select {...register("type")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="">Choose a Content Type</option>
                  <option value="VIDEO">📹 Video</option>
                  <option value="DOCUMENT">📄 Document</option>
                  <option value="QUIZ">📝 Quiz</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Upload Media</label>
                <div className="relative">
                  <input
                    id="file-upload"
                    type="file"
                    accept={
                      selectedType === "VIDEO"
                        ? "video/*"
                        : selectedType === "DOCUMENT"
                        ? ".pdf,.doc,.docx,.ppt,.pptx"
                        : "image/*"
                    }
                    onChange={handleFileUpload}
                    disabled={uploading || !selectedType}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploading || !selectedType
                        ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-blue-300 bg-blue-50 hover:bg-blue-100"
                    }`}
                  >
                    <Image src="/upload.png" alt="Upload" width={24} height={24} />
                    <span className="text-sm font-medium text-gray-700">
                      {uploading ? "Uploading..." : uploadedFileName ? `✓ ${uploadedFileName}` : "Choose file"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Content Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <h2 className="text-xl font-semibold text-gray-900">Content Details</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  {...register("title")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter content title"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subject *</label>
                <select {...register("subjectId")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="">Choose a Subject</option>
                  {(subjects || []).map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                {errors.subjectId && (
                  <p className="text-sm text-red-600">{errors.subjectId.message}</p>
                )}
              </div>

              {/* Grades */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Grade *</label>
                <select {...register("grades")} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="">Choose a Grade</option>
                  {(grades || []).map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      Grade {grade.name}
                    </option>
                  ))}
                </select>
                {errors.grades && (
                  <p className="text-sm text-red-600">{errors.grades.message}</p>
                )}
              </div>

              {/* Author ID */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Author ID (optional)</label>
                <input
                  type="number"
                  {...register("authorId")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter author ID"
                />
                {errors.authorId && (
                  <p className="text-sm text-red-600">{errors.authorId.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  {...register("description")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter content description"
                  rows={4}
                ></textarea>
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Body */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Content Body (optional)</label>
                <textarea
                  {...register("body")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter detailed content"
                  rows={6}
                ></textarea>
                {errors.body && (
                  <p className="text-sm text-red-600">{errors.body.message}</p>
                )}
              </div>

              {/* Conditional Fields */}
              {selectedType === "VIDEO" && (
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Video URL</label>
                  <input
                    type="text"
                    {...register("videoUrl")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                    placeholder="Video URL (automatically set after upload)"
                    readOnly
                  />
                  <p className="text-xs text-gray-500">Upload a video file above to set this automatically</p>
                </div>
              )}

              {selectedType === "DOCUMENT" && (
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Document URL</label>
                  <input
                    type="text"
                    {...register("documentUrl")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                    placeholder="Document URL (automatically set after upload)"
                    readOnly
                  />
                  <p className="text-xs text-gray-500">Upload a document file above to set this automatically</p>
                </div>
              )}

              {/* Image URL */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Thumbnail Image</label>
                <input
                  type="text"
                  {...register("imageUrl")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                  placeholder="Image URL (automatically set after upload)"
                  readOnly
                />
                <p className="text-xs text-gray-500">Upload an image file above to set thumbnail (optional)</p>
              </div>

              {/* Tags */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tags (optional)</label>
                <input
                  type="text"
                  {...register("tags")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., algebra, equations, mathematics"
                />
                <p className="text-xs text-gray-500">Separate tags with commas</p>
                {errors.tags && (
                  <p className="text-sm text-red-600">{errors.tags.message}</p>
                )}
              </div>

              {/* Allow Comments & Featured */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("allowComments")}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    defaultChecked
                    id="allowComments"
                  />
                  <label htmlFor="allowComments" className="text-sm font-medium text-gray-700">Allow comments on this content</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("featured")}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    id="featured"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Mark as featured content</label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Publishing...
                </span>
              ) : (
                "Publish Content"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
