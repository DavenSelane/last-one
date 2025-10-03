import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import { DB } from "@/lib/prisma";
import { CalendarEvent, User } from "@prisma/client";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type EventWithUser = CalendarEvent & {
  user: User;
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
    header: "Start",
    accessor: "start",
    className: "hidden md:table-cell",
  },
  {
    header: "End",
    accessor: "end",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const EventListPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  const userRole = session.user.role;

  const events = await DB.calendarEvent.findMany({
    include: {
      user: true,
    },
    orderBy: {
      start: "desc",
    },
  });

  const renderRow = (item: EventWithUser) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td className="hidden md:table-cell">{item.description || "N/A"}</td>
      <td className="hidden md:table-cell">
        {new Date(item.start).toLocaleDateString()} {new Date(item.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </td>
      <td className="hidden md:table-cell">
        {new Date(item.end).toLocaleDateString()} {new Date(item.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {userRole === "ADMIN" && (
            <>
              <FormModal table="event" type="update" data={item} />
              <FormModal table="event" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {userRole === "ADMIN" && <FormModal table="event" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table colomns={columns} renderRow={renderRow} data={events} />
    </div>
  );
};

export default EventListPage;
