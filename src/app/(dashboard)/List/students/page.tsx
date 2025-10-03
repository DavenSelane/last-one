import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { DB } from "@/lib/prisma";
import { Subject, Class, Grade, UserRole } from "@prisma/client";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type StudentListData = User & {
  children: User[];
  subjectsTaught?: Subject[];
  class?: Class | null;
  grade: Grade | null;
};

const columns = [
  {
    header: "Student",
    accessor: "info",
  },
  {
    header: "Email",
    accessor: "email",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden lg:table-cell",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden lg:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ITEMS_PER_PAGE = 10;

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) => {
  const session = await getServerSession(authOptions);

  const search = searchParams?.search || "";
  const currentPage = Number(searchParams?.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [students, totalCount] = await Promise.all([
    DB.user.findMany({
      where: {
        role: UserRole.STUDENT,
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      include: {
        children: true,
        subjectsTaught: true,
        class: true,
        grade: true,
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: {
        firstName: "asc",
      },
    }),
    DB.user.count({
      where: {
        role: UserRole.STUDENT,
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const renderRow = (item: StudentListData) => (
    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Image
            src={item.image ?? "/avatar.png"}
            alt={`${item.firstName} ${item.lastName}`}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {item.firstName} {item.lastName}
            </div>
            <div className="text-xs text-gray-500">ID: {item.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <div className="text-sm text-gray-600">{item.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
        <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {item.class?.name || "No Class"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
        <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
          {item.grade?.name || "No Grade"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
        <div className="text-sm text-gray-600">{item.phone || "N/A"}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          <Link href={`/SingleUserPage/${item.id}`}>
            <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
              <Image src="/view.png" alt="View" width={16} height={16} />
            </button>
          </Link>
          {session?.user?.role === "ADMIN" && (
            <FormModal table="student" type="delete" id={item.id} />
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
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {totalCount} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search students..." />
            {session?.user?.role === "ADMIN" && (
              <FormModal table="student" type="create" />
            )}
          </div>
        </div>
      </div>
      <div className="px-6">
        <Table colomns={columns} renderRow={renderRow} data={students} />
      </div>
      <div className="px-6 pb-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default StudentListPage;
