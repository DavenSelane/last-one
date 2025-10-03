import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Page Header */}
      <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                About Us
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item">
                    <a className="text-white" href="/">
                      Home
                    </a>
                  </li>
                  <li
                    className="breadcrumb-item text-white active"
                    aria-current="page"
                  >
                    About
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* About Content */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-12">
              <div className="wow fadeInUp" data-wow-delay="0.1s">
                <h1 className="mb-4 text-center">
                  Empowering South African High School Students Through a
                  Centralised Learning Platform
                </h1>
              </div>
            </div>
          </div>

          <div className="row g-5 mt-4">
            {/* What is Isinamuva? */}
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="h-100">
                <div className="d-flex align-items-center mb-3">
                  <i className="fa fa-book fa-2x text-primary me-3"></i>
                  <h3 className="mb-0">What is Isinamuva?</h3>
                </div>
                <p className="mb-4">
                  Isinamuva is a comprehensive digital platform designed for
                  South African high school learners (Grades 8–12). It equips
                  students with subject-specific content, instructional videos,
                  practice problems, real-time progress tracking, tutor
                  bookings, peer collaboration, and reminders—accessible
                  anytime, anywhere.
                </p>
              </div>
            </div>

            {/* Goal/Mission */}
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <div className="h-100">
                <div className="d-flex align-items-center mb-3">
                  <i className="fa fa-bullseye fa-2x text-primary me-3"></i>
                  <h3 className="mb-0">Our Mission</h3>
                </div>
                <p className="mb-4">
                  To help students excel academically and secure university
                  admission by providing a personalized, adaptive, and
                  student-centered learning experience.
                </p>
              </div>
            </div>
          </div>

          {/* Problem/Background */}
          <div className="row g-5 mt-4">
            <div className="col-lg-12 wow fadeInUp" data-wow-delay="0.5s">
              <div className="bg-light p-5 rounded">
                <div className="d-flex align-items-center mb-4">
                  <i className="fa fa-exclamation-triangle fa-2x text-warning me-3"></i>
                  <h3 className="mb-0">The Problem We Solve</h3>
                </div>
                <p className="mb-0" style={{ fontSize: "1.1rem" }}>
                  The current high school education system fails to meet diverse
                  student needs, relying on traditional teaching methods that
                  hinder engagement, retention, and understanding. Without
                  personalized support or time management tools, students
                  struggle academically, leading to poor performance and
                  increased stress. A more adaptive, student-centered approach
                  is urgently needed to improve outcomes and support long-term
                  success.
                </p>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="row g-5 mt-4">
            <div className="col-lg-12 text-center wow fadeInUp" data-wow-delay="0.7s">
              <div className="bg-primary text-white p-4 rounded">
                <h4 className="text-white mb-2">Developed By</h4>
                <h2 className="text-white mb-0">Team 18</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
