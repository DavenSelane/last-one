import Announcements from "@/components/Announcements";
import ProfileCalendar from "@/components/ProfileCalendar";
import FormModal from "@/components/FormModal";
import Performance from "@/components/Performance";
import Image from "next/image";
import Link from "next/link";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { User, Class, Grade, Subject, Assignment } from "@prisma/client";

type UserWithRelations = User & {
  class: Class | null;
  grade: Grade | null;
  subjectsTaught: Subject[];
  children: User[];
};

const SingleUserPage = async ({ params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);

  const user = (await DB.user.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      class: true,
      grade: true,
      subjectsTaught: true,
      children: true,
    },
  })) as UserWithRelations | null;

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === params.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const isTutor = user.role === "TUTOR";
  const isStudent = user.role === "STUDENT";
  const canEdit = isOwnProfile || isAdmin;

  // Fetch assignments for the user
  let assignments: Assignment[] = [];
  if (isStudent && user.classId) {
    assignments = await DB.assignment.findMany({
      where: {
        Lesson: {
          classId: user.classId,
        },
      },
    });
  } else if (isTutor) {
    assignments = await DB.assignment.findMany({
      where: {
        Lesson: {
          tutorId: user.id,
        },
      },
    });
  }

  // Fetch calendar events from database
  const calendarEvents = await DB.calendarEvent.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      start: 'asc',
    },
  });

  // Create events from assignments
  const assignmentEvents = assignments.map((assignment) => ({
    id: `assignment-${assignment.id}`,
    title: `📝 ${assignment.title}`,
    start: assignment.dueDate,
    end: new Date(assignment.dueDate.getTime() + 60 * 60 * 1000), // 1 hour
    color: '#ef4444', // Red color for assignments
  }));

  // Convert calendar events to the format expected by BigCalendar
  const userCalendarEvents = calendarEvents.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    color: event.color,
  }));

  const allEvents = [...userCalendarEvents, ...assignmentEvents];

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row bg-gray-50">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* USER INFO CARD */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 py-8 px-6 rounded-xl shadow-lg flex-1 flex gap-6 text-white">
            <div className="w-1/3 flex items-center justify-center">
              <div className="relative">
                <Image
                  src={user.image || "/avatar.png"}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={144}
                  height={144}
                  className="w-36 h-36 rounded-full object-cover ring-4 ring-white shadow-xl"
                />
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full ring-4 ring-white"></div>
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.firstName} {user.lastName}
                  </h1>
                  <span className="inline-block mt-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                    {user.role}
                  </span>
                </div>
                {canEdit && (
                  <FormModal
                    table="user"
                    type="update"
                    data={user}
                    relatedData={{
                      grades: await DB.grade.findMany(),
                      subjects: await DB.subject.findMany(),
                    }}
                  />
                )}
              </div>
              <p className="text-sm text-blue-50 line-clamp-2">
                {user.bio || "No bio available"}
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Image
                    src="/mail.png"
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-90"
                  />
                  <span className="text-blue-50">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Image
                      src="/phone.png"
                      alt=""
                      width={16}
                      height={16}
                      className="opacity-90"
                    />
                    <span className="text-blue-50">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* STATS CARDS */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Grade Card */}
            {user.grade && (
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Image
                      src="/singleBranch.png"
                      alt=""
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {user.grade.name}
                    </h3>
                    <span className="text-sm text-gray-500">Grade</span>
                  </div>
                </div>
              </div>
            )}
            {/* Subjects Card */}
            {isTutor && (
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Image
                      src="/singleLesson.png"
                      alt=""
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {user.subjectsTaught?.length || 0}
                    </h3>
                    <span className="text-sm text-gray-500">Subjects</span>
                  </div>
                </div>
              </div>
            )}
            {/* Class Card */}
            {user.class && (
              <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Image
                      src="/singleClass.png"
                      alt=""
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {user.class.name}
                    </h3>
                    <span className="text-sm text-gray-500">Class</span>
                  </div>
                </div>
              </div>
            )}
            {/* Assignments Card */}
            <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Image
                    src="/singleAttendance.png"
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {assignments.length}
                  </h3>
                  <span className="text-sm text-gray-500">Assignments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* SCHEDULE */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {user.firstName}&apos;s Schedule
          </h2>
          <ProfileCalendar events={allEvents} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Upcoming Assignments
          </h2>
          <div className="flex flex-col gap-3">
            {assignments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No upcoming assignments
              </p>
            ) : (
              assignments.slice(0, 5).map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/Assignment/${assignment.id}`}
                  className="p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <Announcements />
      </div>
    </div>
  );
};

export default SingleUserPage;
