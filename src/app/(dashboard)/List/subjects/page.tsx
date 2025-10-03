import { DB } from "@/lib/prisma";
import FormContainer from "@/components/FormContainer";
import Table from "@/components/Table";
import Image from "next/image";
import SelectSubjectButton from "@/components/SelectSubjectButton";
import EnrollSubjectButton from "@/components/EnrollSubjectButton";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";

type subjectList = {
  id: number;
  name: string;
  tutors: { firstName: string; lastName: string }[];
};

const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Tutors",
    accessor: "tutors",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ITEMS_PER_PAGE = 10;

// Revalidate every 60 seconds for better performance
export const revalidate = 60;

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) => {
  const session = await getServerSession(authOptions);

  const user = session?.user?.id
    ? await DB.user.findUnique({
        where: { id: Number(session.user.id) },
        include: { subjectsEnrolled: true },
      })
    : null;

  const search = searchParams?.search || "";
  const currentPage = Number(searchParams?.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch subjects with search and pagination
  const [data, totalCount] = await Promise.all([
    DB.subject.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      include: {
        tutors: true,
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: {
        name: "asc",
      },
    }),
    DB.subject.count({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const enrolledSubjectIds = user?.subjectsEnrolled?.map((s) => s.id) || [];

  const renderRow = (item: subjectList) => (
    <tr
      key={item.id}
      className="hover:bg-gray-50 transition-colors duration-150"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {item.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <div className="text-sm text-gray-900">
          {item.tutors && item.tutors.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.tutors.map((tutor, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {tutor.firstName} {tutor.lastName}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">No tutors assigned</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          {session?.user?.role === "ADMIN" && (
            <>
              <FormContainer table="subject" type="update" data={item} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </>
          )}
          {session?.user?.role === "STUDENT" && (
            <EnrollSubjectButton
              subjectId={item.id}
              subjectName={item.name}
              isEnrolled={enrolledSubjectIds.includes(item.id)}
            />
          )}
          {session?.user?.role !== "STUDENT" &&
            session?.user?.role !== "ADMIN" && (
              <SelectSubjectButton
                subjectId={item.id}
                isSelected={enrolledSubjectIds.includes(item.id)}
              />
            )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {totalCount} total
            </span>
            {session?.user?.role === "STUDENT" && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {enrolledSubjectIds.length} enrolled
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search subjects..." />
            {session?.user?.role === "ADMIN" && (
              <FormContainer table="subject" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="px-6">
        <Table colomns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* PAGINATION */}
      <div className="px-6 pb-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default SubjectListPage;
