import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { DB } from "@/lib/prisma";
import { Result, Assignment, User } from "@prisma/client";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type ResultWithRelations = Result & {
  student: User;
  assignment: Assignment | null;
};

const columns = [
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Assignment",
    accessor: "assignment",
    className: "hidden md:table-cell",
  },
  {
    header: "Score",
    accessor: "score",
  },
  {
    header: "Submitted",
    accessor: "submitted",
    className: "hidden md:table-cell",
  },
  {
    header: "Graded",
    accessor: "graded",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ResultListPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  const userRole = session.user.role;
  const userId = parseInt(session.user.id!);

  // Fetch results based on role
  const results = await DB.result.findMany({
    where:
      userRole === "STUDENT"
        ? { studentId: userId }
        : userRole === "PARENT"
        ? {
            student: {
              parentId: userId,
            },
          }
        : {}, // ADMIN and TUTOR see all
    include: {
      student: true,
      assignment: true,
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  const renderRow = (item: ResultWithRelations) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.student.firstName} {item.student.lastName}
      </td>
      <td className="hidden md:table-cell">
        {item.assignment?.title || "N/A"}
      </td>
      <td>{item.score}</td>
      <td className="hidden md:table-cell">
        {new Date(item.submittedAt).toLocaleDateString()}
      </td>
      <td className="hidden md:table-cell">
        {item.gradedAt
          ? new Date(item.gradedAt).toLocaleDateString()
          : "Not graded"}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(userRole === "ADMIN" || userRole === "TUTOR") && (
            <>
              <FormModal table="result" type="update" data={item} />
              <FormModal table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(userRole === "ADMIN" || userRole === "TUTOR") && (
              <FormModal table="result" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table colomns={columns} renderRow={renderRow} data={results} />
    </div>
  );
};

export default ResultListPage;
