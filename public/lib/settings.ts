type RouteAccessMap ={
    [key:string]:string[];
};


export const routeAccessMap :RouteAccessMap={
 "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/tutor(.*)": ["tutor"],
  "/parent(.*)": ["parent"],
  "/List/tutors": ["admin", "tutor"],
  "/List/students": ["admin", "tutor"],
  "/List/parents": ["admin", "tutor"],
  "/List/subjects": ["admin"],
  "/List/classes": ["admin", "tutor"],
  "/List/exams": ["admin", "tutor", "student", "parent"],
  "/List/assignments": ["admin", "tutor", "student", "parent"],
  "/List/results": ["admin", "tutor", "student", "parent"],
  "/List/attendance": ["admin", "tutor", "student", "parent"],
  "/List/events": ["admin", "tutor", "student", "parent"],
  "/List/announcements": ["admin", "tutor", "student", "parent"],
}