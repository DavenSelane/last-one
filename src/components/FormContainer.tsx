import { DB } from "@/lib/prisma";
import FormModal from "./FormModal";
import { UserRole } from "@prisma/client";

export type FormContainerProps = {
  table:
    | "tutor"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "grade"
    | "user";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number;
  relatedData?: any;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const TutorVars = await DB.user.findMany({
          where: { role: "TUTOR" },
          select: { id: true, lastName: true, firstName: true },
        });
        relatedData = { tutors: TutorVars };
        break;

      case "tutor":
        const tutorSubjects = await DB.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: tutorSubjects };
        break;

      case "student":
        const [studentGrades, studentClasses, studentParents] = await Promise.all([
          DB.grade.findMany({
            select: { id: true, name: true },
          }),
          DB.class.findMany({
            select: { id: true, name: true, grade: { select: { name: true } } },
          }),
          DB.user.findMany({
            where: { role: "PARENT" },
            select: { id: true, firstName: true, lastName: true },
          }),
        ]);
        relatedData = {
          grades: studentGrades,
          classes: studentClasses,
          parents: studentParents,
        };
        break;

      case "class":
        const [classGrades, classTutors] = await Promise.all([
          DB.grade.findMany({
            select: { id: true, name: true },
          }),
          DB.user.findMany({
            where: { role: "TUTOR" },
            select: { id: true, firstName: true, lastName: true },
          }),
        ]);
        relatedData = { grades: classGrades, tutors: classTutors };
        break;

      case "lesson":
        const [lessonSubjects, lessonClasses, lessonTutors] = await Promise.all([
          DB.subject.findMany({
            select: { id: true, name: true },
          }),
          DB.class.findMany({
            select: { id: true, name: true, grade: { select: { name: true } } },
          }),
          DB.user.findMany({
            where: { role: "TUTOR" },
            select: { id: true, firstName: true, lastName: true },
          }),
        ]);
        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          tutors: lessonTutors,
        };
        break;

      case "announcement":
        const announcementClasses = await DB.class.findMany({
          select: { id: true, name: true, grade: { select: { name: true } } },
        });
        relatedData = { classes: announcementClasses };
        break;
    }
  }

  return (
    <div>
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
