"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["ADMIN", "TUTOR", "STUDENT", "PARENT"],
      },
      {
        icon: "/teacher.png",
        label: "Tutors",
        href: "/List/tutors",
        visible: ["ADMIN", "TUTOR"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/List/students",
        visible: ["ADMIN", "TUTOR"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/List/parents",
        visible: ["ADMIN", "TUTOR", "STUDENT"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/List/subjects",
        visible: ["ADMIN", "TUTOR", "STUDENT"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/List/classes",
        visible: ["ADMIN", "TUTOR"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/List/lessons",
        visible: ["ADMIN", "TUTOR"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/List/exams",
        visible: ["ADMIN", "TUTOR", "STUDENT", "PARENT"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/List/assignments",
        visible: ["ADMIN", "TUTOR", "STUDENT", "PARENT"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/List/results",
        visible: ["ADMIN", "TUTOR", "STUDENT", "PARENT"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/List/events",
        visible: ["ADMIN", "TUTOR", "STUDENT", "PARENT"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/List/announcements",
        visible: ["ADMIN", "TUTOR", "STUDENT", "PARENT"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["ADMIN", "TUTOR", "STUDENT", "PARENT"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["ADMIN", "TUTOR", "STUDENT", "PARENT"],
      },
    ],
  },
];

const Menu = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (role && item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
