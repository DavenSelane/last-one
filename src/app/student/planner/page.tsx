"use client";

import React, { useState, useEffect } from "react";
import { View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import BigCalendar from "@/components/BigCalender";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
}

const PRESET_COLORS = [
  { name: "Blue", value: "#3b82f6", light: "#dbeafe" },
  { name: "Red", value: "#ef4444", light: "#fee2e2" },
  { name: "Green", value: "#10b981", light: "#d1fae5" },
  { name: "Yellow", value: "#f59e0b", light: "#fef3c7" },
  { name: "Purple", value: "#8b5cf6", light: "#ede9fe" },
  { name: "Pink", value: "#ec4899", light: "#fce7f3" },
  { name: "Indigo", value: "#6366f1", light: "#e0e7ff" },
  { name: "Teal", value: "#14b8a6", light: "#ccfbf1" },
];

const EVENT_TYPES = [
  { name: "Study Session", icon: "📚", color: "#3b82f6" },
  { name: "Assignment", icon: "✏️", color: "#ef4444" },
  { name: "Exam", icon: "📝", color: "#f59e0b" },
  { name: "Project", icon: "💻", color: "#8b5cf6" },
  { name: "Meeting", icon: "👥", color: "#10b981" },
  { name: "Break", icon: "☕", color: "#ec4899" },
  { name: "Other", icon: "📌", color: "#6366f1" },
];

const StudyPlannerPage = () => {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>(Views.WEEK);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    allDay: false,
    color: "#3b82f6",
    type: "Study Session",
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/calendar");
        if (response.ok) {
          const data = await response.json();
          const formattedEvents = data.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load calendar events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [session]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setShowModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      allDay: event.allDay,
      color: event.color,
      type:
        EVENT_TYPES.find((t) => t.color === event.color)?.name ||
        "Study Session",
    });
    setSelectedSlot({ start: event.start, end: event.end });
  };

  const updateEvent = async () => {
    if (!eventForm.title || !editingEvent) {
      toast.error("Please enter an event title");
      return;
    }

    try {
      const response = await fetch(`/api/calendar/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description,
          start: selectedSlot?.start || editingEvent.start,
          end: selectedSlot?.end || editingEvent.end,
          allDay: eventForm.allDay,
          color: eventForm.color,
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === editingEvent.id
              ? {
                  ...updatedEvent,
                  start: new Date(updatedEvent.start),
                  end: new Date(updatedEvent.end),
                }
              : event
          )
        );
        toast.success("Event updated successfully!");
        setEditingEvent(null);
        setSelectedEvent(null);
        setEventForm({
          title: "",
          description: "",
          allDay: false,
          color: "#3b82f6",
          type: "Study Session",
        });
      } else {
        toast.error("Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  const duplicateEvent = async (event: CalendarEvent) => {
    try {
      const newStart = new Date(event.start);
      newStart.setDate(newStart.getDate() + 7); // Duplicate to next week
      const newEnd = new Date(event.end);
      newEnd.setDate(newEnd.getDate() + 7);

      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event.title + " (Copy)",
          description: event.description,
          start: newStart,
          end: newEnd,
          allDay: event.allDay,
          color: event.color,
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents((prevEvents) => [
          ...prevEvents,
          {
            ...newEvent,
            start: new Date(newEvent.start),
            end: new Date(newEvent.end),
          },
        ]);
        toast.success("Event duplicated to next week!");
      } else {
        toast.error("Failed to duplicate event");
      }
    } catch (error) {
      console.error("Error duplicating event:", error);
      toast.error("Failed to duplicate event");
    }
  };

  const exportCalendar = () => {
    const calendarData = events.map((event) => ({
      title: event.title,
      description: event.description,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      allDay: event.allDay,
      color: event.color,
    }));

    const dataStr = JSON.stringify(calendarData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `study-planner-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    toast.success("Calendar exported successfully!");
  };

  const createEvent = async () => {
    if (!eventForm.title || !selectedSlot) {
      toast.error("Please enter an event title");
      return;
    }

    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description,
          start: selectedSlot.start,
          end: selectedSlot.end,
          allDay: eventForm.allDay,
          color: eventForm.color,
        }),
      });

      if (response.ok) {
        const newEvent = await response.json();
        // Real-time update: Immediately add to events state
        setEvents((prevEvents) => [
          ...prevEvents,
          {
            ...newEvent,
            start: new Date(newEvent.start),
            end: new Date(newEvent.end),
          },
        ]);
        toast.success("Event created successfully!");
        setShowModal(false);
        setEventForm({
          title: "",
          description: "",
          allDay: false,
          color: "#3b82f6",
          type: "Study Session",
        });
        setSelectedSlot(null);
      } else {
        toast.error("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  const deleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Real-time update: Immediately remove from events state
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
        toast.success("Event deleted successfully!");
      } else {
        toast.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleEventDrop = async (data: {
    event: any;
    start: Date;
    end: Date;
  }) => {
    try {
      const response = await fetch(`/api/calendar/${data.event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.event.title,
          description: data.event.description,
          start: data.start,
          end: data.end,
          allDay: data.event.allDay,
          color: data.event.color,
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        // Real-time update: Update the event in state
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === data.event.id
              ? {
                  ...event,
                  start: new Date(updatedEvent.start),
                  end: new Date(updatedEvent.end),
                }
              : event
          )
        );
        toast.success("Event time updated!");
      } else {
        toast.error("Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  const handleEventResize = async (data: {
    event: any;
    start: Date;
    end: Date;
  }) => {
    try {
      const response = await fetch(`/api/calendar/${data.event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.event.title,
          description: data.event.description,
          start: data.start,
          end: data.end,
          allDay: data.event.allDay,
          color: data.event.color,
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        // Real-time update: Update the event in state
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === data.event.id
              ? {
                  ...event,
                  start: new Date(updatedEvent.start),
                  end: new Date(updatedEvent.end),
                }
              : event
          )
        );
        toast.success("Event duration updated!");
      } else {
        toast.error("Failed to resize event");
      }
    } catch (error) {
      console.error("Error resizing event:", error);
      toast.error("Failed to resize event");
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your study planner...</p>
        </div>
      </div>
    );
  }

  const todayEvents = events.filter((event) => {
    const today = new Date();
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === today.toDateString();
  });

  // Filter events based on type and search
  const filteredEvents = events.filter((event) => {
    const matchesType =
      filterType === "all" ||
      EVENT_TYPES.find((t) => t.name === filterType)?.color === event.color;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const upcomingEvents = filteredEvents
    .filter((event) => new Date(event.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  return (
    <div className="container-fluid mt-4 mb-5">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="d-flex align-items-center mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <i className="fas fa-calendar-alt fa-2x text-white"></i>
            </div>
            <div>
              <h1
                className="mb-1"
                style={{ fontWeight: "700", color: "#1e293b" }}
              >
                My Study Planner
              </h1>
              <p className="text-muted mb-0">
                Plan your study schedule and stay organized 📚
              </p>
            </div>
          </div>
        </div>
        <div className="col-lg-4 text-end">
          <div className="d-flex gap-2 justify-content-end">
            <button
              className="btn btn-outline-primary"
              onClick={exportCalendar}
              title="Export Calendar"
            >
              <i className="fas fa-download"></i>
            </button>
            <button
              className="btn btn-lg text-white shadow-sm"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "12px",
              }}
              onClick={() => {
                setSelectedSlot({
                  start: new Date(),
                  end: new Date(new Date().getTime() + 60 * 60 * 1000),
                });
                setShowModal(true);
              }}
            >
              <i className="fas fa-plus me-2"></i>
              Add New Event
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: "12px" }}
          >
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">
                    SEARCH EVENTS
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: "8px" }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">
                    FILTER BY TYPE
                  </label>
                  <select
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="all">All Events</option>
                    {EVENT_TYPES.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(searchTerm || filterType !== "all") && (
                <div className="mt-3">
                  <span className="badge bg-primary me-2">
                    {filteredEvents.length} event
                    {filteredEvents.length !== 1 ? "s" : ""} found
                  </span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          {/* Today's Events */}
          <div
            className="card border-0 shadow-sm mb-4"
            style={{ borderRadius: "16px" }}
          >
            <div
              className="card-header border-0 text-white"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "16px 16px 0 0",
              }}
            >
              <h6 className="mb-0 fw-bold">
                <i className="fas fa-clock me-2"></i>Today&apos;s Schedule
              </h6>
            </div>
            <div
              className="card-body"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {todayEvents.length === 0 ? (
                <p className="text-muted small mb-0">
                  No events scheduled for today
                </p>
              ) : (
                todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 mb-2 rounded"
                    style={{
                      backgroundColor: event.color + "20",
                      borderLeft: `4px solid ${event.color}`,
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div
                          className="fw-bold small"
                          style={{ color: event.color }}
                        >
                          {event.title}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {moment(event.start).format("h:mm A")} -{" "}
                          {moment(event.end).format("h:mm A")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div
            className="card border-0 shadow-sm mb-4"
            style={{ borderRadius: "16px" }}
          >
            <div
              className="card-header border-0 text-white"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                borderRadius: "16px 16px 0 0",
              }}
            >
              <h6 className="mb-0 fw-bold">
                <i className="fas fa-calendar-week me-2"></i>Upcoming
              </h6>
            </div>
            <div
              className="card-body"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {upcomingEvents.length === 0 ? (
                <p className="text-muted small mb-0">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 mb-2 rounded"
                    style={{
                      backgroundColor: event.color + "20",
                      borderLeft: `4px solid ${event.color}`,
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div
                      className="fw-bold small"
                      style={{ color: event.color }}
                    >
                      {event.title}
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {moment(event.start).format("MMM D, h:mm A")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: "16px" }}
          >
            <div className="card-body text-center">
              <div className="mb-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: "80px",
                    height: "80px",
                    background:
                      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                  }}
                >
                  <h2 className="mb-0 fw-bold" style={{ color: "#d97757" }}>
                    {events.length}
                  </h2>
                </div>
                <p className="text-muted small mb-0">Total Events</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="col-lg-9">
          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: "16px", overflow: "hidden" }}
          >
            <div className="card-body p-4">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div className="text-muted small">
                  <i className="fas fa-info-circle me-1"></i>
                  <strong>Drag & drop</strong> to reschedule •{" "}
                  <strong>Resize</strong> to adjust duration
                </div>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn ${
                      view === Views.MONTH
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setView(Views.MONTH)}
                  >
                    Month
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      view === Views.WEEK
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setView(Views.WEEK)}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      view === Views.DAY ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setView(Views.DAY)}
                  >
                    Day
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      view === Views.AGENDA
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setView(Views.AGENDA)}
                  >
                    Agenda
                  </button>
                </div>
              </div>
              <div style={{ height: "600px" }}>
                <BigCalendar
                  events={events}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  onEventDrop={handleEventDrop}
                  onEventResize={handleEventResize}
                  selectable={true}
                  editable={true}
                  views={["month", "week", "day", "agenda"]}
                  defaultView={view}
                  eventPropGetter={eventStyleGetter}
                  style={{ height: "100%" }}
                  min={new Date(0, 0, 0, 6, 0, 0)}
                  max={new Date(0, 0, 0, 23, 0, 0)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "20px" }}
            >
              <div
                className="modal-header border-0 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "20px 20px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-calendar-plus me-2"></i>
                  Create New Event
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div
                className="modal-body p-4"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                {/* Event Type Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small">
                    EVENT TYPE
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type.name}
                        type="button"
                        className={`btn btn-sm ${
                          eventForm.type === type.name
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        style={{
                          borderRadius: "20px",
                          border:
                            eventForm.type === type.name
                              ? "2px solid " + type.color
                              : "",
                          backgroundColor:
                            eventForm.type === type.name ? type.color : "",
                        }}
                        onClick={() =>
                          setEventForm({
                            ...eventForm,
                            type: type.name,
                            color: type.color,
                          })
                        }
                      >
                        <span className="me-1">{type.icon}</span>
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title Input */}
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">
                    TITLE *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                    }}
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    placeholder="e.g., Mathematics Study Session"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">
                    DESCRIPTION
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                    }}
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Add notes, topics, or reminders..."
                  />
                </div>

                {/* Time Display */}
                {selectedSlot && (
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted small">
                      TIME
                    </label>
                    <div
                      className="p-3 rounded"
                      style={{ backgroundColor: "#f8fafc" }}
                    >
                      <div className="d-flex align-items-center">
                        <i className="fas fa-clock text-primary me-2"></i>
                        <span>
                          {moment(selectedSlot.start).format(
                            "MMM D, YYYY - h:mm A"
                          )}
                          {" → "}
                          {moment(selectedSlot.end).format("h:mm A")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">
                    COLOR
                  </label>
                  <div className="d-flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        type="button"
                        className={`btn position-relative ${
                          eventForm.color === colorOption.value
                            ? "border-3"
                            : ""
                        }`}
                        style={{
                          backgroundColor: colorOption.value,
                          width: "50px",
                          height: "50px",
                          borderRadius: "12px",
                          border:
                            eventForm.color === colorOption.value
                              ? "3px solid #1e293b"
                              : "2px solid #e2e8f0",
                        }}
                        onClick={() =>
                          setEventForm({
                            ...eventForm,
                            color: colorOption.value,
                          })
                        }
                      >
                        {eventForm.color === colorOption.value && (
                          <i className="fas fa-check text-white"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Day Toggle */}
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="allDayCheck"
                    style={{ width: "50px", height: "25px", cursor: "pointer" }}
                    checked={eventForm.allDay}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, allDay: e.target.checked })
                    }
                  />
                  <label
                    className="form-check-label ms-2 fw-bold text-muted"
                    htmlFor="allDayCheck"
                    style={{ cursor: "pointer" }}
                  >
                    All Day Event
                  </label>
                </div>
              </div>
              <div className="modal-footer border-0 p-4">
                <button
                  type="button"
                  className="btn btn-light btn-lg px-4"
                  style={{ borderRadius: "12px" }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-lg px-4 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "12px",
                    border: "none",
                  }}
                  onClick={createEvent}
                >
                  <i className="fas fa-check me-2"></i>
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "20px" }}
            >
              <div
                className="modal-header border-0 text-white"
                style={{
                  background: `linear-gradient(135deg, ${selectedEvent.color} 0%, ${selectedEvent.color}dd 100%)`,
                  borderRadius: "20px 20px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-calendar-check me-2"></i>
                  Event Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedEvent(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <h4 className="mb-3 fw-bold">{selectedEvent.title}</h4>

                {selectedEvent.description && (
                  <div className="mb-3">
                    <p className="text-muted mb-1 small fw-bold">DESCRIPTION</p>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-muted mb-1 small fw-bold">TIME</p>
                  <div className="d-flex align-items-center">
                    <i
                      className="fas fa-clock me-2"
                      style={{ color: selectedEvent.color }}
                    ></i>
                    <span>
                      {moment(selectedEvent.start).format(
                        "MMM D, YYYY - h:mm A"
                      )}
                      {!selectedEvent.allDay && (
                        <>
                          {" → "}
                          {moment(selectedEvent.end).format("h:mm A")}
                        </>
                      )}
                      {selectedEvent.allDay && " (All Day)"}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-muted mb-1 small fw-bold">COLOR</p>
                  <div
                    className="d-inline-block rounded"
                    style={{
                      backgroundColor: selectedEvent.color,
                      width: "40px",
                      height: "40px",
                      border: "2px solid #e2e8f0",
                    }}
                  ></div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4">
                <button
                  type="button"
                  className="btn btn-light btn-lg px-4"
                  style={{ borderRadius: "12px" }}
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-lg px-4"
                  style={{ borderRadius: "12px" }}
                  onClick={() => {
                    if (window.confirm(`Delete "${selectedEvent.title}"?`)) {
                      deleteEvent(selectedEvent.id);
                      setSelectedEvent(null);
                    }
                  }}
                >
                  <i className="fas fa-trash me-2"></i>
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlannerPage;
