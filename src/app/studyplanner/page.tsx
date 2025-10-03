import React from "react";
import Image from "next/image";

const studyplanner = () => {
  return (
    <>
      {/* Dashboard Content */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-4">
            {/* Welcome Card */}
            <div className="col-12 wow fadeInUp" data-wow-delay="0.1s">
              <div className="bg-light rounded p-5">
                <h2 className="mb-4">
                  Welcome back, <span className="text-primary">Student</span>!
                </h2>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 bg-primary rounded-circle p-3 me-4">
                    <i className="fa fa-trophy text-white fa-2x"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">Your current progress</h5>
                    <p className="mb-0">
                      You&apos;re on track to achieve your goals this week!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div
              className="col-md-6 col-lg-3 wow fadeInUp"
              data-wow-delay="0.3s"
            >
              <div className="bg-light rounded p-4 text-center">
                <i className="fa fa-book text-primary fa-3x mb-3"></i>
                <h4 className="mb-3">Active Subjects</h4>
                <h1 className="display-5 mb-0" data-toggle="counter-up">
                  4
                </h1>
              </div>
            </div>

            <div
              className="col-md-6 col-lg-3 wow fadeInUp"
              data-wow-delay="0.5s"
            >
              <div className="bg-light rounded p-4 text-center">
                <i className="fa fa-calendar-check text-primary fa-3x mb-3"></i>
                <h4 className="mb-3">Upcoming Sessions</h4>
                <h1 className="display-5 mb-0" data-toggle="counter-up">
                  2
                </h1>
              </div>
            </div>

            {/* More stats ... */}

            {/* Upcoming Sessions */}
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="bg-light rounded p-5">
                <div className="d-flex justify-content-between mb-4">
                  <h4 className="mb-0">Upcoming Sessions</h4>
                  <a href="calendar.html" className="btn btn-sm btn-primary">
                    View All
                  </a>
                </div>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Subject</th>
                        <th scope="col">Tutor</th>
                        <th scope="col">Date</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Mathematics</td>
                        <td>Mr. Khumalo</td>
                        <td>Tomorrow, 15:00</td>
                        <td>
                          <a
                            href="#"
                            className="btn btn-sm btn-outline-primary"
                          >
                            Details
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Physical Science</td>
                        <td>Ms. Ndlovu</td>
                        <td>Friday, 10:00</td>
                        <td>
                          <a
                            href="#"
                            className="btn btn-sm btn-outline-primary"
                          >
                            Details
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Progress */}
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <div className="bg-light rounded p-5">
                <div className="d-flex justify-content-between mb-4">
                  <h4 className="mb-0">Recent Progress</h4>
                  <a
                    href="progress-tracker.html"
                    className="btn btn-sm btn-primary"
                  >
                    View All
                  </a>
                </div>
                <div className="progress mb-4" style={{ height: "25px" }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: "85%" }}
                    aria-valuenow={85}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    Mathematics 85%
                  </div>
                </div>
                {/* More progress bars... */}
              </div>
            </div>

            {/* Recommended Content */}
            <div className="col-12 wow fadeInUp" data-wow-delay="0.5s">
              <div className="bg-light rounded p-5">
                <h4 className="mb-4">Recommended For You</h4>
                <div className="row g-4">
                  <div className="col-lg-3 col-md-6">
                    <div className="course-item bg-white rounded overflow-hidden">
                      <div className="position-relative">
                        <Image
                          className="img-fluid"
                          src="img/math-thumbnail.jpg"
                          alt=""
                          width={300}
                          height={200}
                        />
                        <div className="w-100 d-flex justify-content-center position-absolute bottom-0 start-0 mb-4">
                          <a
                            href="#"
                            className="btn btn-sm btn-primary px-3 border-end"
                            style={{ borderRadius: "30px 0 0 30px" }}
                          >
                            View
                          </a>
                        </div>
                      </div>
                      <div className="text-center p-4">
                        <h5 className="mb-2">Algebra Basics</h5>
                        <small>Mathematics • Grade 11</small>
                      </div>
                    </div>
                  </div>
                  {/* More recommended items... */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default studyplanner;
