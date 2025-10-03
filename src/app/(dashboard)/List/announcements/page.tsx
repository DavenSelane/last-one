import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";

type Announcement = {
  id: number;
  title: string;
  description: string;
  date: Date;
  classId: number | null;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
  };
};

const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Description",
    accessor: "description",
    className: "hidden md:table-cell",
  },
  {
    header: "Author",
    accessor: "author",
    className: "hidden lg:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const AnnouncementListPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  const userRole = session.user.role;
  const userId = parseInt(session.user.id!);

  // Fetch classes for create/update forms
  const classes = await DB.class.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  // Fetch user's class info if student or parent
  let userClassId: number | null = null;
  if (userRole === "STUDENT" || userRole === "PARENT") {
    const user = await DB.user.findUnique({
      where: { id: userId },
      select: { classId: true },
    });
    userClassId = user?.classId || null;
  }

  // Fetch announcements based on role
  const announcements = await DB.announcement.findMany({
    where:
      userRole === "ADMIN" || userRole === "TUTOR"
        ? {} // Admin and tutors see all announcements
        : {
            OR: [
              { classId: null }, // Global announcements
              { classId: userClassId }, // Class-specific announcements
            ],
          },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const renderRow = (item: Announcement) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td className="hidden md:table-cell">{item.description}</td>
      <td className="hidden lg:table-cell">
        {item.author.firstName} {item.author.lastName}
      </td>
      <td className="hidden md:table-cell">
        {new Date(item.date).toLocaleDateString()}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(userRole === "ADMIN" ||
            (userRole === "TUTOR" && item.author.id === userId)) && (
            <>
              <FormModal
                table="announcement"
                type="update"
                data={item}
                relatedData={{ classes }}
              />
              <FormModal table="announcement" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(userRole === "ADMIN" || userRole === "TUTOR") && (
              <FormModal
                table="announcement"
                type="create"
                relatedData={{ classes }}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table colomns={columns} renderRow={renderRow} data={announcements} />
    </div>
  );
};

export default AnnouncementListPage;
