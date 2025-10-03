"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "react-toastify";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Thank you for your message! We will get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Navbar />

      {/* Page Header */}
      <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Contact Us
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
                    Contact
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Contact Us
            </h6>
            <h1 className="mb-5">Get In Touch With Us</h1>
          </div>
          <div className="row g-4">
            {/* Contact Info Cards */}
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="h-100">
                <div
                  className="d-flex align-items-center justify-content-center mb-4"
                  style={{ width: "75px", height: "75px" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary"
                    style={{ width: "75px", height: "75px" }}
                  >
                    <i className="fa fa-envelope fa-2x text-white"></i>
                  </div>
                </div>
                <h5>Email</h5>
                <p className="mb-2">
                  <a href="mailto:isinamuvatutoring@gmail.com">
                    isinamuvatutoring@gmail.com
                  </a>
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
              <div className="h-100">
                <div
                  className="d-flex align-items-center justify-content-center mb-4"
                  style={{ width: "75px", height: "75px" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary"
                    style={{ width: "75px", height: "75px" }}
                  >
                    <i className="fa fa-phone-alt fa-2x text-white"></i>
                  </div>
                </div>
                <h5>Phone</h5>
                <p className="mb-2">
                  <a href="tel:0817106031">081 710 6031</a>
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
              <div className="h-100">
                <div
                  className="d-flex align-items-center justify-content-center mb-4"
                  style={{ width: "75px", height: "75px" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary"
                    style={{ width: "75px", height: "75px" }}
                  >
                    <i className="fa fa-users fa-2x text-white"></i>
                  </div>
                </div>
                <h5>Social Media</h5>
                <p className="mb-2">Follow us on our social platforms</p>
                <div className="d-flex gap-2">
                  <a
                    href="https://youtube.com/@isinamuvatutoring3249?si=i8k80_39n_3kt2Aw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fab fa-youtube"></i> YouTube
                  </a>
                  <a
                    href="https://www.tiktok.com/@isinamuva_tutoring"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fab fa-tiktok"></i> TikTok
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="row g-4 mt-5">
            <div className="col-12">
              <div
                className="bg-light rounded p-5 wow fadeInUp"
                data-wow-delay="0.1s"
              >
                <h3 className="mb-4">Send Us a Message</h3>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="name">Your Name</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="email">Your Email</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="subject"
                          name="subject"
                          placeholder="Subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="subject">Subject</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <textarea
                          className="form-control"
                          placeholder="Leave a message here"
                          id="message"
                          name="message"
                          style={{ height: "150px" }}
                          value={formData.message}
                          onChange={handleChange}
                          required
                        ></textarea>
                        <label htmlFor="message">Message</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <button
                        className="btn btn-primary w-100 py-3"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Sending...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
