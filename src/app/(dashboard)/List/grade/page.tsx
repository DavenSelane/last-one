import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { DB } from "@/lib/prisma";
import { Grade } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type GradeListData = Grade & {
  _count?: {
    classes: number;
    users: number;
  };
};

const columns = [
  {
    header: "Grade Name",
    accessor: "name",
  },
  {
    header: "Classes",
    accessor: "classes",
    className: "hidden md:table-cell",
  },
  {
    header: "Students",
    accessor: "students",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ITEMS_PER_PAGE = 10;

const GradeListPage = async ({
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

  const [grades, totalCount] = await Promise.all([
    DB.grade.findMany({
      where: {
        name: { contains: search, mode: "insensitive" },
      },
      include: {
        _count: {
          select: { classes: true, users: true },
        },
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: {
        name: "asc",
      },
    }),
    DB.grade.count({
      where: {
        name: { contains: search, mode: "insensitive" },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const renderRow = (item: GradeListData) => (
    <tr
      key={item.id}
      className="hover:bg-gray-50 transition-colors duration-150"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900">{item.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
          {item._count?.classes || 0} classes
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
        <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {item._count?.users || 0} students
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          {userRole === "ADMIN" && (
            <>
              <FormModal table="grade" type="update" data={item} />
              <FormModal table="grade" type="delete" id={item.id} />
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
            <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {totalCount} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search grades..." />
            {userRole === "ADMIN" && <FormModal table="grade" type="create" />}
          </div>
        </div>
      </div>
      <div className="px-6">
        <Table colomns={columns} renderRow={renderRow} data={grades} />
      </div>
      <div className="px-6 pb-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default GradeListPage;
