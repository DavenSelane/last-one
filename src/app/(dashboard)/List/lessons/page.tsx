import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { DB } from "@/lib/prisma";
import { Lesson, Subject, Class, User } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type LessonListData = Lesson & {
  subject: Subject;
  class: Class;
  tutor: User;
};

const columns = [
  {
    header: "Topic",
    accessor: "topic",
  },
  {
    header: "Subject",
    accessor: "subject",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden lg:table-cell",
  },
  {
    header: "Tutor",
    accessor: "tutor",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ITEMS_PER_PAGE = 10;

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  const userRole = session.user.role;
  const search = searchParams?.search || "";
  const currentPage = Number(searchParams?.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch subjects, classes, and tutors for form dropdowns
  const [subjects, classes, tutors] = await Promise.all([
    DB.subject.findMany({ select: { id: true, name: true } }),
    DB.class.findMany({
      select: { id: true, name: true, grade: { select: { name: true } } },
    }),
    DB.user.findMany({
      where: { role: "TUTOR" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const [lessons, totalCount] = await Promise.all([
    DB.lesson.findMany({
      where: {
        OR: [
          { topic: { contains: search, mode: "insensitive" } },
          { subject: { name: { contains: search, mode: "insensitive" } } },
        ],
      },
      include: {
        subject: true,
        class: true,
        tutor: true,
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: {
        id: "desc",
      },
    }),
    DB.lesson.count({
      where: {
        OR: [
          { topic: { contains: search, mode: "insensitive" } },
          { subject: { name: { contains: search, mode: "insensitive" } } },
        ],
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const renderRow = (item: LessonListData) => (
    <tr
      key={item.id}
      className="hover:bg-gray-50 transition-colors duration-150"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900">{item.topic}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {item.subject.name}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
        <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
          {item.class.name}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
        <div className="text-sm text-gray-600">
          {item.tutor.firstName} {item.tutor.lastName}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          {(userRole === "ADMIN" || userRole === "TUTOR") && (
            <>
              <FormModal
                table="lesson"
                type="update"
                data={item}
                relatedData={{ subjects, classes, tutors }}
              />
              <FormModal table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm flex-1 m-4 mt-0">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {totalCount} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search lessons..." />
            {(userRole === "ADMIN" || userRole === "TUTOR") && (
              <FormModal
                table="lesson"
                type="create"
                relatedData={{ subjects, classes, tutors }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="px-6">
        <Table colomns={columns} renderRow={renderRow} data={lessons} />
      </div>
      <div className="px-6 pb-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default LessonListPage;
