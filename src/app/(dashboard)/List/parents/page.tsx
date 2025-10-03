import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { DB } from "@/lib/prisma";
import { User, UserRole } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import SelectParentButton from "@/components/SelectParentButton";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type ParentListData = User & {
  children: User[];
};

const columns = [
  {
    header: "Parent",
    accessor: "info",
  },
  {
    header: "Email",
    accessor: "email",
    className: "hidden md:table-cell",
  },
  {
    header: "Children",
    accessor: "children",
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

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) => {
  const session = await getServerSession(authOptions);

  const user = session?.user?.id
    ? await DB.user.findUnique({ where: { id: Number(session.user.id) } })
    : null;

  const search = searchParams?.search || "";
  const currentPage = Number(searchParams?.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [parents, totalCount] = await Promise.all([
    DB.user.findMany({
      where: {
        role: UserRole.PARENT,
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      include: {
        children: true,
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: {
        firstName: "asc",
      },
    }),
    DB.user.count({
      where: {
        role: UserRole.PARENT,
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const renderRow = (item: ParentListData) => (
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
        <div className="flex flex-wrap gap-1">
          {item.children && item.children.length > 0 ? (
            item.children.map((child) => (
              <span
                key={child.id}
                className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
              >
                {child.firstName} {child.lastName}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">No children</span>
          )}
        </div>
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
            <>
              <FormModal table="parent" type="update" data={item} />
              <FormModal table="parent" type="delete" id={item.id} />
            </>
          )}
          <SelectParentButton
            parentId={item.id}
            isSelected={user?.parentId === item.id}
          />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm flex-1 m-4 mt-0">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {totalCount} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search parents..." />
            {session?.user?.role === "ADMIN" && (
              <FormModal table="parent" type="create" />
            )}
          </div>
        </div>
      </div>
      <div className="px-6">
        <Table colomns={columns} renderRow={renderRow} data={parents} />
      </div>
      <div className="px-6 pb-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default ParentListPage;
