"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Result {
  id: number;
  score: number;
  submittedAt: string;
  assignment: {
    title: string;
    maxScore: number;
    lesson: {
      subject: {
        name: string;
      };
    };
  };
}

interface SubjectProgress {
  subject: string;
  average: number;
  count: number;
  total: number;
  [key: string]: any;
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const ProgressPage = () => {
  const { data: session } = useSession();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"overall" | "subject">("overall");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchResults = useCallback(async () => {
    try {
      if (session?.user?.id) {
        const response = await fetch(
          `/api/user/${session.user.id}/performance`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults, refreshKey]);

  // Auto-refresh every 30 seconds to check for new graded assignments
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate overall average
  const calculateOverallAverage = () => {
    if (results.length === 0) return 0;
    const totalPercentage = results.reduce((sum, result) => {
      const percentage = (result.score / result.assignment.maxScore) * 100;
      return sum + percentage;
    }, 0);
    return Math.round(totalPercentage / results.length);
  };

  // Calculate subject-wise averages
  const calculateSubjectAverages = (): SubjectProgress[] => {
    const subjectMap: Record<
      string,
      { total: number; count: number; sum: number }
    > = {};

    results.forEach((result) => {
      const subject = result.assignment.lesson.subject.name;
      const percentage = (result.score / result.assignment.maxScore) * 100;

      if (!subjectMap[subject]) {
        subjectMap[subject] = { total: 0, count: 0, sum: 0 };
      }

      subjectMap[subject].sum += percentage;
      subjectMap[subject].count += 1;
      subjectMap[subject].total += result.score;
    });

    return Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      average: Math.round(data.sum / data.count),
      count: data.count,
      total: Math.round(data.total),
    }));
  };

  // Prepare data for timeline chart
  const getTimelineData = () => {
    return results
      .slice()
      .sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      )
      .map((result) => ({
        date: new Date(result.submittedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: Math.round((result.score / result.assignment.maxScore) * 100),
        assignment: result.assignment.title,
      }));
  };

  if (loading) {
    return <div className="container mt-5">Loading progress data...</div>;
  }

  const overallAverage = calculateOverallAverage();
  const subjectAverages = calculateSubjectAverages();
  const timelineData = getTimelineData();

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-md-10">
          <h1 className="mb-3">Your Progress</h1>
          <p className="text-muted">
            Track your academic performance and see how you&apos;re doing across
            all subjects.
          </p>
        </div>
        <div className="col-md-2 text-end">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => {
              setLoading(true);
              setRefreshKey((prev) => prev + 1);
            }}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-1"></i>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${
                viewMode === "overall" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setViewMode("overall")}
            >
              Overall Average
            </button>
            <button
              type="button"
              className={`btn ${
                viewMode === "subject" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setViewMode("subject")}
            >
              By Subject
            </button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="alert alert-info">
          <h4 className="alert-heading">No Results Yet</h4>
          <p>
            You haven&apos;t submitted any assignments yet. Complete and submit
            assignments to see your progress here.
          </p>
        </div>
      ) : (
        <>
          {/* Overall View */}
          {viewMode === "overall" && (
            <div className="row">
              {/* Overall Average Card */}
              <div className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h5 className="card-title mb-4">Overall Average</h5>
                    <div
                      className="display-1 mb-3"
                      style={{
                        color:
                          overallAverage >= 75
                            ? "#10b981"
                            : overallAverage >= 50
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      {overallAverage}%
                    </div>
                    <p className="text-muted">
                      Based on {results.length} assignments
                    </p>
                    <div className="progress" style={{ height: "10px" }}>
                      <div
                        className={`progress-bar ${
                          overallAverage >= 75
                            ? "bg-success"
                            : overallAverage >= 50
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                        style={{ width: `${overallAverage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Radial Progress Chart */}
              <div className="col-md-8 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      Performance Distribution
                    </h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadialBarChart
                        innerRadius="30%"
                        outerRadius="100%"
                        data={[
                          {
                            name: "Overall",
                            value: overallAverage,
                            fill: "#3b82f6",
                          },
                        ]}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar
                          background
                          dataKey="value"
                          label={{ position: "insideStart", fill: "#fff" }}
                        />
                        <Legend
                          iconSize={10}
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                        />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="col-12 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Progress Over Time</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Score (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subject View */}
          {viewMode === "subject" && (
            <div className="row">
              {/* Subject Breakdown Cards */}
              <div className="col-12 mb-4">
                <div className="row">
                  {subjectAverages.map((subject, index) => (
                    <div key={subject.subject} className="col-md-4 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">{subject.subject}</h6>
                          <div
                            className="display-4"
                            style={{ color: COLORS[index % COLORS.length] }}
                          >
                            {subject.average}%
                          </div>
                          <p className="text-muted mb-2">
                            {subject.count} assignment
                            {subject.count !== 1 ? "s" : ""}
                          </p>
                          <div className="progress" style={{ height: "8px" }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${subject.average}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Subject Comparison</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={subjectAverages}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="average"
                          fill="#3b82f6"
                          name="Average %"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Assignment Distribution</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={subjectAverages}
                          dataKey="count"
                          nameKey="subject"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {subjectAverages.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Assignments Table */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Recent Assignments</h5>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Assignment</th>
                          <th>Subject</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(b.submittedAt).getTime() -
                              new Date(a.submittedAt).getTime()
                          )
                          .slice(0, 10)
                          .map((result) => {
                            const percentage = Math.round(
                              (result.score / result.assignment.maxScore) * 100
                            );
                            return (
                              <tr key={result.id}>
                                <td>{result.assignment.title}</td>
                                <td>{result.assignment.lesson.subject.name}</td>
                                <td>
                                  {result.score} / {result.assignment.maxScore}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      percentage >= 75
                                        ? "bg-success"
                                        : percentage >= 50
                                        ? "bg-warning"
                                        : "bg-danger"
                                    }`}
                                  >
                                    {percentage}%
                                  </span>
                                </td>
                                <td>
                                  {new Date(
                                    result.submittedAt
                                  ).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressPage;
