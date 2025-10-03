"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
  author: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

const Announcements = () => {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.slice(0, 3)); // Show only latest 3
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ title: "", description: "" });
        setShowForm(false);
        fetchAnnouncements();
      } else {
        alert("Failed to create announcement");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("Error creating announcement");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canCreateAnnouncement =
    session?.user?.role === "TUTOR" || session?.user?.role === "ADMIN";

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchAnnouncements();
      } else {
        alert("Failed to delete announcement");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Error deleting announcement");
    }
  };

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <div className="flex gap-2">
          {canCreateAnnouncement && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-xs text-white bg-blue-500 px-3 py-1 rounded-md hover:bg-blue-600"
            >
              {showForm ? "Cancel" : "+ New"}
            </button>
          )}
          <Link
            href="/List/announcements"
            className="text-xs text-gray-400 hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 bg-gray-50 p-4 rounded-md"
        >
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 border rounded-md mb-2"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border rounded-md mb-2"
            rows={3}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Create Announcement
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4 mt-4">
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No announcements yet
          </div>
        ) : (
          announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className={`rounded-md p-4 ${
                index % 3 === 0
                  ? "bg-lamaSkyLight"
                  : index % 3 === 1
                  ? "bg-lamaPurpleLight"
                  : "bg-lamaYellowLight"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{announcement.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-white rounded-md px-2 py-1">
                    {formatDate(announcement.date)}
                  </span>
                  {canCreateAnnouncement && (
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                      title="Delete announcement"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {announcement.description}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                By {announcement.author.firstName}{" "}
                {announcement.author.lastName} ({announcement.author.role})
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
