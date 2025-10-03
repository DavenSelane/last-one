import React from "react";
import Link from "next/link";

import Image from "next/image";
import { getServerSession } from "next-auth";

import OutBtn from "./OutBtn";
import { authOptions } from "@/lib/auth";

export const NavbarFixed = async () => {
  const session = await getServerSession(authOptions);
  const userole = session?.user?.role;

  return (
    <>
      <nav className="navbar  bg-white navbar-light shadow sticky-top p-0">
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
            <Link href="/student" className="nav-item nav-link active">
              Dashboard
            </Link>
            <Link href="/List/subjects" className="nav-item nav-link active">
              Subjects
            </Link>
            <Link href="/List/parents" className="nav-item nav-link active">
              Parents
            </Link>
            <Link href="/studymaterial" className="nav-item nav-link active">
              Study Material
            </Link>
            <Link href="/Assignment" className="nav-item nav-link active">
              Assignments
            </Link>
            <Link href="/studyplanner" className="nav-item nav-link active">
              Study Planner
            </Link>
            <Link href="/chat" className="nav-item nav-link active">
              Chat
            </Link>
            <Link
              href={`/SingleUserPage/${session?.user?.id}`}
              className="nav-item nav-link active"
            >
              Profile
            </Link>
            <OutBtn />
          </>
        )}

        {userole === "TUTOR" && (
          <>
            <a href="/home" className="nav-item nav-link active">
              <i className="fa fa-tachometer-alt me-2"></i>Dashboard
            </a>
            <a href="/content" className="nav-item nav-link active">
              <i></i>Create Content
            </a>
            <a href="/CreateAssignment" className="nav-item nav-link active">
              <i></i>Create Assignment
            </a>
            <a href="/studymaterial" className="nav-item nav-link active">
              <i></i>Study Material
            </a>
            <a href="/List/students" className="nav-item nav-link active">
              <i></i>Students
            </a>
            <a href="/List/parents" className="nav-item nav-link active">
              <i></i>Parents
            </a>
            <a href="/List/tutors" className="nav-item nav-link active">
              <i></i>Tutors
            </a>
            <a href="/List/subjects" className="nav-item nav-link active">
              <i></i>Subjects
            </a>
            <a href="/Assignment" className="nav-item nav-link active">
              <i></i>Assignments
            </a>
            <a href="/chat" className="nav-item nav-link active">
              <i></i>Chat
            </a>
            <Link
              href={`/SingleUserPage/${session?.user?.id}`}
              className="nav-item nav-link"
            >
              <i className="fa fa-user me-2"></i>Profile
            </Link>
            <OutBtn />
          </>
        )}

        {userole === "ADMIN" && (
          <>
            <Link href="/admin" className="nav-item nav-link active">
              Dashboard
            </Link>
            <div className="nav-item dropdown">
              <a
                href="#"
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                Content
              </a>
              <div className="dropdown-menu fade-down m-0">
                <a href="/content" className="nav-item nav-link">
                  <i></i>Create Content
                </a>
                <a href="/CreateAssignment" className="nav-item nav-link">
                  <i></i>Create Assignment
                </a>
                <a href="/studymaterial" className="nav-item nav-link">
                  <i></i>Study Material
                </a>
                <a href="/contentManagement" className="nav-item nav-link">
                  <i></i>Content Management
                </a>
              </div>
            </div>
            <div className="nav-item dropdown">
              <a
                href="#"
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                Users
              </a>
              <div className="dropdown-menu fade-down m-0">
                <a href="/List/students" className="nav-item nav-link">
                  <i></i>Students
                </a>
                <a href="/List/parents" className="nav-item nav-link">
                  <i></i>Parents
                </a>
                <a href="/List/tutors" className="nav-item nav-link">
                  <i></i>Tutors
                </a>
              </div>
            </div>
            <a href="/List/subjects" className="nav-item nav-link active">
              <i></i>Subjects
            </a>
            <a href="/Assignment" className="nav-item nav-link active">
              <i></i>Assignments
            </a>
            <a href="/chat" className="nav-item nav-link active">
              <i></i>Chat
            </a>
            <Link
              href={`/SingleUserPage/${session?.user?.id}`}
              className="nav-item nav-link"
            >
              <i className="fa fa-user me-2"></i>Profile
            </Link>
            <OutBtn />
          </>
        )}

        {userole === "PARENT" && (
          <>
            <Link href="/parent" className="nav-item nav-link active">
              Dashboard
            </Link>
            <Link href="/parent" className="nav-item nav-link active">
              Student Monitoring
            </Link>
            <Link href="/parent" className="nav-item nav-link active">
              Academic Progress
            </Link>
            <Link href="/parent" className="nav-item nav-link active">
              Dashboard
            </Link>
            <Link
              href={`/SingleUserPage/${session?.user?.id}`}
              className="nav-item nav-link active"
            >
              Profile
            </Link>
            <OutBtn />
          </>
        )}

        {!session?.user && (
          <>
            <Link href="/" className="nav-item nav-link active">
              Home
            </Link>
            <Link href="/" className="nav-item nav-link active">
              About
            </Link>
            <Link href="/" className="nav-item nav-link active">
              Contact
            </Link>
            <Link href="/content" className="nav-item nav-link active">
              Help & Support
            </Link>
            <Link href="/sign-in" className="nav-item nav-link active">
              Sign In
            </Link>
            <a
              href="/register"
              className="btn btn-primary py-4 px-lg-5 d-none d-lg-block"
            >
              Sign Up <i className="fa fa-arrow-right ms-3"></i>
            </a>
          </>
        )}
      </nav>
    </>
  );
};
