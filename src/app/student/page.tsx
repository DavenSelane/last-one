"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

type Subject = {
  id: number;
  name: string;
};

type ProgressData = {
  name: string;
  value: number;
  fill: string;
};

// Typed wrapper to bypass TS issues with Recharts props
interface MyRadialBarProps {
  minAngle?: number;
  clockWise?: boolean;
  dataKey: string;
  background?: boolean;
  label?: any;
  data?: ProgressData[];
}

const MyRadialBar = (props: MyRadialBarProps) => (
  <RadialBar {...(props as any)} />
);

export default function Page() {
  const { data: session } = useSession();
  const [enrolledSubjects, setEnrolledSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample progress data
  const progressData: ProgressData[] = [
    { name: "Math", value: 80, fill: "#8884d8" },
    { name: "Science", value: 65, fill: "#82ca9d" },
    { name: "History", value: 50, fill: "#ffc658" },
  ];

  useEffect(() => {
    const fetchEnrolledSubjects = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/user/${session.user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setEnrolledSubjects(userData.subjectsEnrolled || []);
        }
      } catch (error) {
        console.error("Error fetching enrolled subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledSubjects();
  }, [session?.user?.id]);

  return (
    <>
      <div className="container-xxl py-5">
        <div className="container">
          {/* Enrolled Subjects Section */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="bg-white rounded shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">
                    <i className="fas fa-graduation-cap text-primary me-2"></i>
                    My Enrolled Subjects
                  </h4>
                  <Link
                    href="/List/subjects"
                    className="btn btn-sm btn-outline-primary rounded-pill"
                  >
                    Manage Subjects
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : enrolledSubjects.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p className="text-muted mb-3">
                      You haven&apos;t enrolled in any subjects yet
                    </p>
                    <Link
                      href="/List/subjects"
                      className="btn btn-primary rounded-pill px-4"
                    >
                      Browse Subjects
                    </Link>
                  </div>
                ) : (
                  <div className="row g-3">
                    {enrolledSubjects.map((subject) => (
                      <div key={subject.id} className="col-md-4 col-sm-6">
                        <div className="border rounded p-3 h-100 d-flex align-items-center justify-content-between hover-shadow transition">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <i className="fas fa-book text-primary"></i>
                            </div>
                            <span className="fw-medium">{subject.name}</span>
                          </div>
                          <i className="fas fa-check-circle text-success"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row g-4 mb-5">
            <div className="col-lg-4 col-md-6">
              <div className="bg-light rounded text-center p-4 h-100">
                <i className="fas fa-book-open fa-3x text-primary mb-3"></i>
                <h5 className="mb-2">Study Materials</h5>
                <p className="mb-3">
                  Access notes, videos, and quizzes tailored to your subjects.
                </p>
                <Link
                  href="/studymaterial"
                  className="btn btn-outline-primary rounded-pill px-4"
                >
                  Explore
                </Link>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="bg-light rounded text-center p-4 h-100">
                <i className="fas fa-pencil-ruler fa-3x text-primary mb-3"></i>
                <h5 className="mb-2">Assessments</h5>
                <p className="mb-3">
                  Take quizzes and mock exams to test your understanding.
                </p>
                <Link
                  href="/Assignment"
                  className="btn btn-outline-primary rounded-pill px-4"
                >
                  Start Quiz
                </Link>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="bg-light rounded text-center p-4 h-100">
                <i className="fas fa-chart-line fa-3x text-primary mb-3"></i>
                <h5 className="mb-2">Progress</h5>
                <p className="mb-3">
                  Track your learning journey, scores, and goals.
                </p>

                {/* RadialBarChart for Progress */}
                <RadialBarChart
                  width={250}
                  height={250}
                  cx="50%"
                  cy="50%"
                  innerRadius="10%"
                  outerRadius="80%"
                  barSize={15}
                  data={progressData}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />
                  <MyRadialBar
                    minAngle={15}
                    clockWise
                    dataKey="value"
                    background
                    label={{ position: "insideStart", fill: "#000" }}
                  />
                </RadialBarChart>

                <Link
                  href="/student/progress"
                  className="btn btn-outline-primary rounded-pill px-4 mt-3"
                >
                  View Stats
                </Link>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="bg-light rounded text-center p-4 h-100">
                <i className="fas fa-calendar-alt fa-3x text-primary mb-3"></i>
                <h5 className="mb-2">Study Planner</h5>
                <p className="mb-3">
                  Organize your schedule and deadlines effectively.
                </p>
                <Link
                  href="/student/planner"
                  className="btn btn-outline-primary rounded-pill px-4"
                >
                  View Planner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
