"use client";

import React from "react";
import Link from "next/link";

import Image from "next/image";
import { useSession } from "next-auth/react";

import OutBtn from "./OutBtn";

export const Navbar = () => {
  const { data: session } = useSession();
  const userole = session?.user?.role;

  return (
    <>
      <nav
        className="navbar bg-white navbar-light shadow fixed-top p-0"
        style={{ zIndex: 1030 }}
      >
        <Link
          href="/home"
          className="navbar-brand d-flex align-items-center px-4 px-lg-5"
        >
          <Image
            src="/assets/img/isinamuva-logo.jpg"
            alt="Isinamuva Logo"
            width={40}
            height={40}
            className="me-2"
          />
          <h2 className="m-0 text-primary">Isinamuva Tutorials</h2>
        </Link>

        {/*student role pages */}

        {userole === "STUDENT" && (
          <>
            <Link href="/student" className="nav-item nav-link">
              Dashboard
            </Link>
            <Link href="/List/subjects" className="nav-item nav-link">
              Subjects
            </Link>
            <Link href="/List/assignments" className="nav-item nav-link">
              Assignments
            </Link>
            <Link href="/studymaterial" className="nav-item nav-link">
              Study Material
            </Link>
            <Link href="/List/parents" className="nav-item nav-link">
              Parents
            </Link>
            <Link href="/student/planner" className="nav-item nav-link">
              Study Planner
            </Link>
            <Link href="/chat" className="nav-item nav-link">
              AI Chat
            </Link>
            <Link
              href={`/SingleUserPage/${session?.user?.id}`}
              className="nav-item nav-link"
            >
              Profile
            </Link>
            <OutBtn />
          </>
        )}

        {userole === "TUTOR" && (
          <>
            <Link href="/tutor" className="nav-item nav-link">
              Dashboard
            </Link>
            <Link href="/List/assignments" className="nav-item nav-link">
              Assignments
            </Link>
            <Link href="/List/lessons" className="nav-item nav-link">
              Lessons
            </Link>
            <Link href="/studymaterial" className="nav-item nav-link">
              Study Materials
            </Link>

            <div className="nav-item dropdown">
              <a
                href="#"
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                Create
              </a>
              <div className="dropdown-menu fade-down m-0">
                <Link href="/content" className="dropdown-item">
                  Create Content
                </Link>
                <Link href="/CreateAssignment" className="dropdown-item">
                  Create Assignment
                </Link>
              </div>
            </div>

            <div className="nav-item dropdown">
              <a
                href="#"
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                Manage
              </a>
              <div className="dropdown-menu fade-down m-0">
                <Link href="/List/students" className="dropdown-item">
                  Students
                </Link>
                <Link href="/List/parents" className="dropdown-item">
                  Parents
                </Link>
                <Link href="/List/subjects" className="dropdown-item">
                  Subjects
                </Link>
                <Link href="/List/classes" className="dropdown-item">
                  Classes
                </Link>
              </div>
            </div>

            <Link href="/chat" className="nav-item nav-link">
              AI Chat
            </Link>

            <Link
              href={`/SingleUserPage/${session?.user?.id}`}
              className="nav-item nav-link"
            >
              Profile
            </Link>
            <OutBtn />
          </>
        )}

        {userole === "ADMIN" && (
          <>
            <div className="nav-item dropdown">
              <a
                href="#"
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                Users
              </a>
              <div className="dropdown-menu fade-down m-0">
                <Link href="/List/students" className="dropdown-item">
                  Students
                </Link>
                <Link href="/List/tutors" className="dropdown-item">
                  Tutors
                </Link>
                <Link href="/List/parents" className="dropdown-item">
                  Parents
                </Link>
              </div>
            </div>

            <div className="nav-item dropdown">
              <a
                href="#"
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                Academic
              </a>
              <div className="dropdown-menu fade-down m-0">
                <Link href="/List/subjects" className="dropdown-item">
                  Subjects
                </Link>
                <Link href="/List/classes" className="dropdown-item">
                  Classes
                </Link>
                <Link href="/List/lessons" className="dropdown-item">
                  Lessons
                </Link>
                <Link href="/List/assignments" className="dropdown-item">
                  Assignments
                </Link>
                <Link href="/List/grade" className="dropdown-item">
                  Grades
                </Link>
              </div>
            </div>

            <Link href="/contentManagement" className="nav-item nav-link">
              Content Management
            </Link>

            <Link href="/List/announcements" className="nav-item nav-link">
              Announcements
            </Link>

            <Link
              href={`/SingleUserPage/${session?.user?.id}`}
              className="nav-item nav-link"
            >
              Profile
            </Link>
            <OutBtn />
          </>
        )}

        {userole === "PARENT" && (
          <>
            <Link href="/parent" className="nav-item nav-link">
              Dashboard
            </Link>
            <Link href="/List/students" className="nav-item nav-link">
              My Children
            </Link>
            <Link href="/List/assignments" className="nav-item nav-link">
              Assignments
            </Link>
            <Link href="/studymaterial" className="nav-item nav-link">
              Study Materials
            </Link>
            <Link href="/List/announcements" className="nav-item nav-link">
              Announcements
            </Link>
            <Link href="/Chat" className="nav-item nav-link">
              AI Chat
            </Link>

            <OutBtn />
          </>
        )}

        {!session?.user && (
          <div className="d-flex align-items-center ms-auto">
            <Link href="/" className="nav-item nav-link">
              Home
            </Link>
            <Link href="/about" className="nav-item nav-link">
              About Us
            </Link>
            <Link href="/contact" className="nav-item nav-link">
              Contact
            </Link>
            <Link href="/sign-in" className="nav-item nav-link">
              Sign In
            </Link>
            <a
              href="/register"
              className="btn btn-primary py-2 px-4 ms-3"
              style={{
                borderRadius: "50px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Get Started <i className="fa fa-arrow-right ms-2"></i>
            </a>
          </div>
        )}
      </nav>
    </>
  );
};
