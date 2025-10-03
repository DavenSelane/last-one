import React from "react";
import Image from "next/image";

export const Footer = () => {
  return (
    <>
      {/* Footer Start */}
      <div
        className="container-fluid text-light footer pt-5 mt-5 wow fadeIn"
        data-wow-delay="0.1s"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
      >
        <div className="container py-5">
          <div className="row g-5">
            {/* Brand Section */}
            <div className="col-lg-3 col-md-6">
              <div className="d-flex align-items-center mb-3">
                <Image
                  src="/assets/img/isinamuva-logo.jpg"
                  alt="Isinamuva Logo"
                  width={50}
                  height={50}
                  className="me-3 rounded-circle"
                  style={{ border: '2px solid #06BBCC' }}
                />
                <h4 className="text-white mb-0">Isinamuva</h4>
              </div>
              <p className="mb-3">
                Empowering South African high school students (Grades 8–12)
                with comprehensive digital learning solutions.
              </p>
              <div className="d-flex pt-2">
                <a
                  className="btn btn-outline-light btn-social me-2"
                  href="https://youtube.com/@isinamuvatutoring3249?si=i8k80_39n_3kt2Aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Isinamuva Tutoring YouTube"
                  style={{ borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <i className="fab fa-youtube"></i>
                </a>
                <a
                  className="btn btn-outline-light btn-social"
                  href="https://www.tiktok.com/@isinamuva_tutoring"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Isinamuva Tutoring TikTok"
                  style={{ borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <i className="fab fa-tiktok"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-3 col-md-6">
              <h4 className="text-white mb-4">
                <i className="fa fa-link me-2 text-primary"></i>Quick Links
              </h4>
              <a className="btn btn-link text-light" href="/" style={{ textDecoration: 'none' }}>
                <i className="fa fa-angle-right me-2"></i>Home
              </a>
              <a className="btn btn-link text-light" href="/about" style={{ textDecoration: 'none' }}>
                <i className="fa fa-angle-right me-2"></i>About Us
              </a>
              <a className="btn btn-link text-light" href="/contact" style={{ textDecoration: 'none' }}>
                <i className="fa fa-angle-right me-2"></i>Contact Us
              </a>
              <a className="btn btn-link text-light" href="/register" style={{ textDecoration: 'none' }}>
                <i className="fa fa-angle-right me-2"></i>Get Started
              </a>
            </div>

            {/* Contact Info */}
            <div className="col-lg-3 col-md-6">
              <h4 className="text-white mb-4">
                <i className="fa fa-envelope me-2 text-primary"></i>Contact Info
              </h4>
              <p className="mb-3">
                <i className="fa fa-phone-alt me-3 text-primary"></i>
                <a href="tel:0817106031" className="text-light" style={{ textDecoration: 'none' }}>
                  081 710 6031
                </a>
              </p>
              <p className="mb-3">
                <i className="fa fa-envelope me-3 text-primary"></i>
                <a
                  href="mailto:isinamuvatutoring@gmail.com"
                  className="text-light"
                  style={{ textDecoration: 'none', wordBreak: 'break-all' }}
                >
                  isinamuvatutoring@gmail.com
                </a>
              </p>
              <p className="mb-0">
                <i className="fa fa-map-marker-alt me-3 text-primary"></i>
                South Africa
              </p>
            </div>

            {/* Legal */}
            <div className="col-lg-3 col-md-6">
              <h4 className="text-white mb-4">
                <i className="fa fa-shield-alt me-2 text-primary"></i>Legal
              </h4>
              <a className="btn btn-link text-light" href="/privacy-policy" style={{ textDecoration: 'none' }}>
                <i className="fa fa-angle-right me-2"></i>Privacy Policy
              </a>
              <a className="btn btn-link text-light" href="/terms-and-conditions" style={{ textDecoration: 'none' }}>
                <i className="fa fa-angle-right me-2"></i>Terms & Conditions
              </a>
              <div className="mt-3">
                <p className="text-white-50 small mb-0">
                  Developed by <strong className="text-primary">Team 18</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="container">
          <div className="copyright border-top border-secondary pt-4">
            <div className="row">
              <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                <span className="text-light">
                  &copy; {new Date().getFullYear()}{" "}
                  <a className="text-primary fw-bold" href="/" style={{ textDecoration: 'none' }}>
                    Isinamuva Application
                  </a>
                  . All Rights Reserved.
                </span>
              </div>
              <div className="col-md-6 text-center text-md-end">
                <div className="footer-menu">
                  <a href="/" className="text-light me-3" style={{ textDecoration: 'none' }}>Home</a>
                  <a href="/about" className="text-light me-3" style={{ textDecoration: 'none' }}>About</a>
                  <a href="/contact" className="text-light" style={{ textDecoration: 'none' }}>Contact</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer End */}
    </>
  );
};
