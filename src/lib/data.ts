export const calendarEvents = [
  {
    id: 0,
    title: "Math Class",
    start: new Date(2025, 1, 3, 10, 0, 0),
    end: new Date(2025, 1, 3, 11, 0, 0),
  },
  {
    id: 1,
    title: "Science Class",
    start: new Date(2025, 1, 4, 12, 0, 0),
    end: new Date(2025, 1, 4, 13, 0, 0),
  },
  {
    id: 2,
    title: "History Class",
    start: new Date(2025, 1, 5, 9, 0, 0),
    end: new Date(2025, 1, 5, 10, 0, 0),
  },
];

// Mock role - in a real app this would come from authentication
export const role = "admin";

export const eventsData = [
  {
    id: 1,
    title: "Math Competition",
    class: "Grade 10",
    date: "2025-01-15",
    startTime: "10:00",
    endTime: "12:00",
  },
  {
    id: 2,
    title: "Science Fair",
    class: "Grade 11",
    date: "2025-01-20",
    startTime: "14:00",
    endTime: "16:00",
  },
  {
    id: 3,
    title: "Sports Day",
    class: "All Grades",
    date: "2025-01-25",
    startTime: "09:00",
    endTime: "15:00",
  },
];

export const examsData = [
  {
    id: 1,
    subject: "Mathematics",
    class: "Grade 10",
    teacher: "Mr. Johnson",
    date: "2025-01-15",
  },
  {
    id: 2,
    subject: "Physics",
    class: "Grade 11",
    teacher: "Ms. Smith",
    date: "2025-01-18",
  },
  {
    id: 3,
    subject: "Chemistry",
    class: "Grade 12",
    teacher: "Dr. Brown",
    date: "2025-01-22",
  },
];

export const lessonsData = [
  {
    id: 1,
    subject: "Mathematics",
    class: "Grade 10",
    teacher: "Mr. Johnson",
  },
  {
    id: 2,
    subject: "Physics",
    class: "Grade 11",
    teacher: "Ms. Smith",
  },
  {
    id: 3,
    subject: "Chemistry",
    class: "Grade 12",
    teacher: "Dr. Brown",
  },
];

export const classesData = [
  {
    id: 1,
    name: "Grade 10A",
    grade: "Grade 10",
    supervisor: "Mr. Johnson",
  },
  {
    id: 2,
    name: "Grade 11B",
    grade: "Grade 11",
    supervisor: "Ms. Smith",
  },
  {
    id: 3,
    name: "Grade 12C",
    grade: "Grade 12",
    supervisor: "Dr. Brown",
  },
];

export const resultsData = [
  {
    id: 1,
    subject: "Mathematics",
    student: "John Doe",
    date: "2025-01-15",
    type: "Exam",
    score: 85,
  },
  {
    id: 2,
    subject: "Physics",
    student: "Jane Smith",
    date: "2025-01-18",
    type: "Test",
    score: 92,
  },
  {
    id: 3,
    subject: "Chemistry",
    student: "Bob Johnson",
    date: "2025-01-22",
    type: "Assignment",
    score: 78,
  },
];
