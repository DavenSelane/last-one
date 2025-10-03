import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { DB } from "@/lib/prisma";
import { Class, Grade, User } from "@prisma/client";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddStudentsToClass from "@/components/AddStudentsToClass";

type ClassListData = Class & {
  grade: Grade;
  supervisor?: User | null;
  _count?: {
    students: number;
  };
};

const columns = [
  {
    header: "Class Name",
    accessor: "name",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Supervisor",
    accessor: "supervisor",
    className: "hidden lg:table-cell",
  },
  {
    header: "Students",
    accessor: "students",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ITEMS_PER_PAGE = 10;

// Revalidate every 60 seconds
export const revalidate = 60;

const ClassListPage = async ({
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

  // Fetch grades, tutors, and students for form dropdowns
  const [grades, tutors, allStudents] = await Promise.all([
    DB.grade.findMany({ select: { id: true, name: true } }),
    DB.user.findMany({
      where: { role: "TUTOR" },
      select: { id: true, firstName: true, lastName: true },
    }),
    DB.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, firstName: true, lastName: true, email: true, classId: true },
    }),
  ]);

  const [classes, totalCount] = await Promise.all([
    DB.class.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { grade: { name: { contains: search, mode: "insensitive" } } },
        ],
      },
      include: {
        grade: true,
        supervisor: true,
        _count: {
          select: { students: true },
        },
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: {
        name: "asc",
      },
    }),
    DB.class.count({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { grade: { name: { contains: search, mode: "insensitive" } } },
        ],
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const renderRow = (item: ClassListData) => {
    // Filter students not in this class
    const availableStudents = allStudents.filter(
      (student) => student.classId !== item.id
    );

    return (
      <tr
        key={item.id}
        className="hover:bg-gray-50 transition-colors duration-150"
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-900">{item.name}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
          <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            {item.grade?.name}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
          <div className="text-sm text-gray-600">
            {item.supervisor
              ? `${item.supervisor.firstName} ${item.supervisor.lastName}`
              : "No supervisor"}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
          <div className="text-sm text-gray-600">
            {item._count?.students || 0} students
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex items-center gap-2">
            {(userRole === "ADMIN" || userRole === "TUTOR") && (
              <AddStudentsToClass
                classId={item.id}
                className={item.name}
                availableStudents={availableStudents}
              />
            )}
            {userRole === "ADMIN" && (
              <>
                <FormModal
                  table="class"
                  type="update"
                  data={item}
                  relatedData={{ grades, tutors }}
                />
                <FormModal table="class" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm flex-1 m-4 mt-0">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {totalCount} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search classes..." />
            {userRole === "ADMIN" && (
              <FormModal
                table="class"
                type="create"
                relatedData={{ grades, tutors }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="px-6">
        <Table
          colomns={columns}
          renderRow={renderRow}
          data={classes}
        />
      </div>
      <div className="px-6 pb-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default ClassListPage;
