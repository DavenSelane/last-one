import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/* eslint-disable react/no-unescaped-entities */

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navbar />

      {/* Page Header */}
      <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Terms & Conditions
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
                    Terms & Conditions
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Content */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-12">
              <div className="wow fadeInUp" data-wow-delay="0.1s">
                <h2 className="mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using the Isinamuva Application ("Platform"),
                  you accept and agree to be bound by the terms and provision of
                  this agreement. If you do not agree to these Terms and
                  Conditions, please do not use our Platform.
                </p>

                <h2 className="mb-4 mt-5">2. Use of the Platform</h2>
                <p>
                  Isinamuva is a comprehensive digital platform designed for
                  South African high school learners (Grades 8–12). The Platform
                  provides subject-specific content, instructional videos,
                  practice problems, real-time progress tracking, tutor
                  bookings, peer collaboration, and reminders.
                </p>
                <p>You agree to:</p>
                <ul>
                  <li>
                    Use the Platform only for lawful purposes and in accordance
                    with these Terms
                  </li>
                  <li>
                    Not use the Platform in any way that violates any applicable
                    national or international law or regulation
                  </li>
                  <li>
                    Not engage in any conduct that restricts or inhibits
                    anyone's use or enjoyment of the Platform
                  </li>
                  <li>
                    Not transmit any material that is defamatory, offensive, or
                    otherwise objectionable
                  </li>
                </ul>

                <h2 className="mb-4 mt-5">3. User Accounts</h2>
                <p>
                  When you create an account with us, you must provide
                  information that is accurate, complete, and current at all
                  times. Failure to do so constitutes a breach of the Terms,
                  which may result in immediate termination of your account.
                </p>
                <p>
                  You are responsible for safeguarding the password that you use
                  to access the Platform and for any activities or actions under
                  your password.
                </p>

                <h2 className="mb-4 mt-5">4. Intellectual Property</h2>
                <p>
                  The Platform and its original content, features, and
                  functionality are and will remain the exclusive property of
                  Isinamuva and its licensors. The Platform is protected by
                  copyright, trademark, and other laws.
                </p>

                <h2 className="mb-4 mt-5">5. User Content</h2>
                <p>
                  Users may submit content including but not limited to
                  assignments, questions, and comments. You retain ownership of
                  any content you submit, but you grant Isinamuva a worldwide,
                  non-exclusive, royalty-free license to use, reproduce, and
                  distribute such content in connection with the Platform.
                </p>

                <h2 className="mb-4 mt-5">6. Prohibited Activities</h2>
                <p>You may not:</p>
                <ul>
                  <li>
                    Modify, copy, or create derivative works based on the
                    Platform
                  </li>
                  <li>
                    Reverse engineer or attempt to extract the source code of
                    the Platform
                  </li>
                  <li>
                    Remove, alter, or obscure any copyright or proprietary
                    notices
                  </li>
                  <li>
                    Use the Platform for any commercial purpose without our
                    written permission
                  </li>
                  <li>Share your account credentials with others</li>
                </ul>

                <h2 className="mb-4 mt-5">7. Termination</h2>
                <p>
                  We may terminate or suspend your account immediately, without
                  prior notice or liability, for any reason whatsoever,
                  including without limitation if you breach the Terms. Upon
                  termination, your right to use the Platform will immediately
                  cease.
                </p>

                <h2 className="mb-4 mt-5">8. Limitation of Liability</h2>
                <p>
                  In no event shall Isinamuva, nor its directors, employees,
                  partners, agents, suppliers, or affiliates, be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages arising out of your access to or use of the Platform.
                </p>

                <h2 className="mb-4 mt-5">9. Changes to Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. We will provide notice of any
                  significant changes by posting the new Terms on this page.
                </p>

                <h2 className="mb-4 mt-5">10. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact
                  us:
                </p>
                <ul>
                  <li>Email: isinamuvatutoring@gmail.com</li>
                  <li>Phone: 081 710 6031</li>
                </ul>

                <p className="mt-5">
                  <em>Last updated: {new Date().toLocaleDateString()}</em>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
