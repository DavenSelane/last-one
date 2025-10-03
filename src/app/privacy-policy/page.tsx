import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/* eslint-disable react/no-unescaped-entities */

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      {/* Page Header */}
      <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Privacy Policy
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
                    Privacy Policy
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Content */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-12">
              <div className="wow fadeInUp" data-wow-delay="0.1s">
                <h2 className="mb-4">1. Introduction</h2>
                <p>
                  Isinamuva Application (&#34;we,&#34; &#34;our,&#34; or
                  &#34;us&#34;) is committed to collect, use, disclose, and
                  safeguard your information when you use our Platform.
                </p>
                <h2 className="mb-4 mt-5">2. Information We Collect</h2>
                <h4 className="mb-3">2.1 Personal Information</h4>
                <p>
                  We collect personal information that you provide to us,
                  including:
                </p>
                <ul>
                  <li>Name and surname</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Grade level</li>
                  <li>School information</li>
                  <li>Profile picture (optional)</li>
                </ul>

                <h4 className="mb-3 mt-4">2.2 Academic Information</h4>
                <p>
                  We collect information related to your academic activities:
                </p>
                <ul>
                  <li>Subjects enrolled</li>
                  <li>Assignment submissions</li>
                  <li>Test and quiz results</li>
                  <li>Progress tracking data</li>
                  <li>Study materials accessed</li>
                </ul>

                <h4 className="mb-3 mt-4">2.3 Usage Information</h4>
                <p>
                  We automatically collect information about your use of the
                  Platform:
                </p>
                <ul>
                  <li>Login times and frequency</li>
                  <li>Pages visited</li>
                  <li>Features used</li>
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address</li>
                </ul>

                <h2 className="mb-4 mt-5">3. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide and maintain the Platform</li>
                  <li>
                    Track your academic progress and provide personalized
                    learning
                  </li>
                  <li>
                    Communicate with you about your account and Platform updates
                  </li>
                  <li>Improve our services and develop new features</li>
                  <li>Ensure the security and integrity of the Platform</li>
                  <li>
                    Respond to your inquiries and provide customer support
                  </li>
                  <li>Send you educational content and notifications</li>
                </ul>

                <h2 className="mb-4 mt-5">4. How We Share Your Information</h2>
                <p>
                  We do not sell your personal information. We may share your
                  information in the following circumstances:
                </p>
                <ul>
                  <li>
                    <strong>With Tutors:</strong> Your tutors&apos; can access
                    your academic progress, assignment submissions, and results
                    to provide educational support
                  </li>
                  <li>
                    <strong>With Parents/Guardians:</strong> If you are under
                    18, your parent&apos;s or guardian may access your academic
                    information
                  </li>
                  <li>
                    <strong>With Service Providers:</strong> We may share
                    information with third-party service providers who help us
                    operate the Platform
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose
                    information if required by law or to protect our rights
                  </li>
                </ul>

                <h2 className="mb-4 mt-5">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction. However, no
                  method of transmission over the Internet is 100% secure.
                </p>

                <h2 className="mb-4 mt-5">6. Data Retention</h2>
                <p>
                  We retain your personal information for as long as your
                  account is active or as needed to provide you services. We
                  will retain and use your information as necessary to comply
                  with our legal obligations, resolve disputes, and enforce our
                  agreements.
                </p>

                <h2 className="mb-4 mt-5">7. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing of your information</li>
                  <li>Request restriction of processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>

                <h2 className="mb-4 mt-5">8. Children's Privacy</h2>
                <p>
                  Our Platform is designed for high school students (Grades
                  8–12). For users under 18 years of age, we require parental
                  consent before collecting personal information. Parents have
                  the right to review, delete, or refuse further collection of
                  their child&#39;s information.
                </p>

                <h2 className="mb-4 mt-5">
                  9. Cookies and Tracking Technologies
                </h2>
                <p>
                  We use cookies and similar tracking technologies to track
                  activity on our Platform and hold certain information. You can
                  instruct your browser to refuse all cookies or to indicate
                  when a cookie is being sent.
                </p>

                <h2 className="mb-4 mt-5">
                  10. Changes to This Privacy Policy
                </h2>
                <p>
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last Updated" date.
                </p>

                <h2 className="mb-4 mt-5">11. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us:
                </p>
                <ul>
                  <li>Email: isinamuvatutoring@gmail.com</li>
                  <li>Phone: 081 710 6031</li>
                </ul>

                <h2 className="mb-4 mt-5">12. Compliance</h2>
                <p>
                  This Privacy Policy is designed to comply with the Protection
                  of Personal Information Act (POPIA) of South Africa and other
                  applicable data protection laws.
                </p>

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
