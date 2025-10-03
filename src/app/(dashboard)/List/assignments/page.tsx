import Image from "next/image";
import Link from "next/link";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import AssignmentUploadButton from "@/components/AssignmentUploadButton";
import { Assignment, Lesson, Subject, Class, Grade, User, Result } from "@prisma/client";

type AssignmentWithRelations = Assignment & {
  Lesson?: (Lesson & {
    subject: Subject;
    class: Class & {
      grade: Grade;
    };
    tutor: User;
  }) | null;
  // TEMPORARY: Uncomment after Prisma regeneration
  // subject?: Subject | null;
  // createdBy?: User | null;
  results?: Result[];
};

const ITEMS_PER_PAGE = 10;

// Revalidate every 30 seconds (assignments change frequently)
export const revalidate = 30;

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) => {
  const session = await getServerSession(authOptions);

  const search = searchParams?.search || "";
  const currentPage = Number(searchParams?.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get student's enrolled subjects and grade if they're a student
  let studentSubjectIds: number[] = [];
  let studentGradeId: number | null = null;

  if (session?.user?.role === "STUDENT") {
    const student = await DB.user.findUnique({
      where: { id: parseInt(session.user.id!) },
      include: {
        subjectsEnrolled: { select: { id: true } },
        class: { select: { gradeId: true } },
      },
    });

    if (student) {
      studentSubjectIds = student.subjectsEnrolled.map((s) => s.id);
      studentGradeId = student.class?.gradeId || null;
    }
  }

  // Build where clause based on role
  const whereClause: any = {
    OR: [
      { title: { contains: search, mode: "insensitive" } },
      { Lesson: { subject: { name: { contains: search, mode: "insensitive" } } } },
    ],
  };

  // Filter assignments for students by their grade and subjects
  // OR show assignments without a lesson (not linked to grade/subject) to ALL students
  if (session?.user?.role === "STUDENT") {
    whereClause.OR = [
      // Show assignments without a lesson (not linked to grade/subject)
      { lessonId: null },
      // OR show assignments matching student's subjects and grade
      {
        Lesson: {
          AND: [
            // Match student's enrolled subjects
            studentSubjectIds.length > 0
              ? { subjectId: { in: studentSubjectIds } }
              : { subjectId: -1 }, // No match if no subjects enrolled
            // Match student's grade
            studentGradeId
              ? { class: { gradeId: studentGradeId } }
              : { classId: -1 }, // No match if no grade/class
          ],
        },
      },
    ];
  }

  // TEMPORARY: Disabled until Prisma client regenerates with createdById field
  // Run: taskkill /F /IM node.exe
  // Then: npx prisma generate
  // Then uncomment this block
  // if (session?.user?.role === "TUTOR") {
  //   whereClause.createdById = parseInt(session.user.id!);
  // }

  const [assignments, totalCount] = await Promise.all([
    DB.assignment.findMany({
      where: whereClause,
      include: {
        Lesson: {
          include: {
            subject: true,
            class: {
              include: {
                grade: true,
              },
            },
            tutor: true,
          },
        },
        // TEMPORARY: Uncomment after Prisma regeneration
        // subject: true,
        // createdBy: {
        //   select: {
        //     id: true,
        //     firstName: true,
        //     lastName: true,
        //   },
        // },
        results: session?.user?.role === "STUDENT"
          ? {
              where: {
                studentId: parseInt(session.user.id!),
              },
            }
          : false,
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: {
        dueDate: "desc",
      },
    }),
    DB.assignment.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm flex-1 m-4 mt-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {totalCount} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search assignments..." />
            {(session?.user?.role === "ADMIN" ||
              session?.user?.role === "TUTOR") && (
              <Link
                href="/CreateAssignment"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Create Assignment
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-6">
        <table className="w-full mt-4">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                Teacher
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                Due Date
              </th>
              {session?.user?.role === "STUDENT" && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Files
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.length === 0 ? (
              <tr>
                <td
                  colSpan={session?.user?.role === "STUDENT" ? 8 : 7}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No assignments found
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {assignment.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {assignment.Lesson?.subject.name ||
                      // TEMPORARY: Uncomment after Prisma regeneration
                      // assignment.subject?.name ||
                      "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {assignment.Lesson?.class.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                    <div className="text-sm text-gray-600">
                      {assignment.Lesson?.tutor
                        ? `${assignment.Lesson.tutor.firstName} ${assignment.Lesson.tutor.lastName}`
                        // TEMPORARY: Uncomment after Prisma regeneration
                        // : assignment.createdBy
                        // ? `${assignment.createdBy.firstName} ${assignment.createdBy.lastName}`
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-gray-600">
                      {formatDate(assignment.dueDate)}
                    </div>
                  </td>
                  {session?.user?.role === "STUDENT" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.results && assignment.results.length > 0 ? (
                        <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          ✓ Submitted
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {assignment.pdfUrl && (
                        <a
                          href={assignment.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                        >
                          PDF
                        </a>
                      )}
                      {assignment.solutionUrl && (
                        <a
                          href={assignment.solutionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                        >
                          Solution
                        </a>
                      )}
                      {assignment.imgUrl && (
                        <a
                          href={assignment.imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded hover:bg-purple-200 transition-colors"
                        >
                          Image
                        </a>
                      )}
                      {!assignment.pdfUrl && !assignment.solutionUrl && !assignment.imgUrl && (
                        <span className="text-xs text-gray-400">No files</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Link href={`/Assignment/${assignment.id}`}>
                        <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                          <Image
                            src="/view.png"
                            alt="View"
                            width={16}
                            height={16}
                          />
                        </button>
                      </Link>
                      {session?.user?.role === "STUDENT" && (
                        <AssignmentUploadButton
                          assignmentId={assignment.id}
                          assignmentTitle={assignment.title}
                          dueDate={assignment.dueDate}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 pb-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default AssignmentListPage;
