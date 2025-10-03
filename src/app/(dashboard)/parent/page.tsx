import Announcements from "@/components/Announcements";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const ParentPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Fetch parent user with children
  const parent = await DB.user.findUnique({
    where: { id: parseInt(session.user.id) },
    include: {
      children: {
        include: {
          class: {
            include: {
              grade: true,
            },
          },
          grade: true,
          studentResults: {
            include: {
              assignment: {
                include: {
                  Lesson: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              submittedAt: 'desc',
            },
            take: 5,
          },
        },
      },
    },
  });

  if (!parent) {
    redirect("/sign-in");
  }

  // Calculate statistics for each child
  const childrenStats = parent.children.map((child) => {
    const totalAssignments = child.studentResults.length;
    const gradedAssignments = child.studentResults.filter((r) => r.status === 'graded').length;
    const avgScore = gradedAssignments > 0
      ? child.studentResults
          .filter((r) => r.status === 'graded')
          .reduce((sum, r) => sum + r.score, 0) / gradedAssignments
      : 0;

    return {
      ...child,
      totalAssignments,
      gradedAssignments,
      avgScore,
    };
  });

  return (
    <div className="flex-1 p-6 flex gap-6 flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <i className="fas fa-users fa-2x text-white"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Parent Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {parent.firstName} {parent.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Children Section */}
      {parent.children.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <i className="fas fa-user-friends fa-3x text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Children Linked</h3>
          <p className="text-gray-500">No students are currently linked to your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {childrenStats.map((child) => (
            <div key={child.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Child Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image
                      src={child.image || "/avatar.png"}
                      alt={`${child.firstName} ${child.lastName}`}
                      width={64}
                      height={64}
                      className="rounded-full ring-4 ring-white"
                    />
                    <div>
                      <h2 className="text-2xl font-bold">
                        {child.firstName} {child.lastName}
                      </h2>
                      <p className="text-blue-100">
                        {child.class?.name || "No Class"} - {child.grade?.name || "No Grade"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/SingleUserPage/${child.id}`}
                    className="btn btn-light btn-sm"
                  >
                    <i className="fas fa-external-link-alt me-2"></i>
                    View Profile
                  </Link>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <i className="fas fa-tasks text-blue-600"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Submissions</p>
                      <p className="text-2xl font-bold text-gray-900">{child.totalAssignments}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <i className="fas fa-check-circle text-green-600"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Graded</p>
                      <p className="text-2xl font-bold text-gray-900">{child.gradedAssignments}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <i className="fas fa-chart-line text-purple-600"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {child.avgScore > 0 ? child.avgScore.toFixed(1) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Results */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Recent Assignments
                </h3>
                {child.studentResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No submissions yet</p>
                ) : (
                  <div className="space-y-3">
                    {child.studentResults.map((result) => (
                      <div
                        key={result.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {result.assignment?.title || "Unknown Assignment"}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Subject: {result.assignment?.Lesson?.subject?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              <i className="fas fa-clock me-1"></i>
                              Submitted: {new Date(result.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            {result.status === "graded" ? (
                              <div>
                                <div className="text-2xl font-bold text-green-600">
                                  {result.score}
                                </div>
                                <p className="text-xs text-gray-500">
                                  out of {result.assignment?.maxScore || 100}
                                </p>
                                <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Graded
                                </span>
                              </div>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                {result.status}
                              </span>
                            )}
                          </div>
                        </div>
                        {result.submissionUrl && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <a
                              href={result.submissionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              <i className="fas fa-file-download me-1"></i>
                              View Submission
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Announcements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
