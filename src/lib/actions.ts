"use server"

import { revalidatePath } from "next/cache"
import { SubjectSchema, TutorSchema, GradeSchema, AnnouncementSchema, ClassSchema, LessonSchema, StudentSchema, ParentSchema } from "../../public/lib/FormValidationSchema"

 import  { DB } from "./prisma"
import { UserRole } from "@prisma/client";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

type CurrentState={success:boolean;error:boolean};

export const createSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    await DB.subject.create({
      data: {
        name: data.name,
        tutors: data.tutors && data.tutors.length > 0 ? {
          connect: data.tutors.map((tutorId) => ({ id: Number(tutorId) }))
        } : undefined
      }
    });

    revalidatePath("/List/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export const updateSubject = async(currentState:CurrentState,data:SubjectSchema )=>{
    try{
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return { success: false, error: true };
        }

        await DB.subject.update({
            where :{
                id:data.id
            },
            data:{
                name:data.name,
                tutors: data.tutors && data.tutors.length > 0 ? {
                    set :data.tutors.map(tutorId=>( {id: Number(tutorId )}))
                } : { set: [] }
            }
        })
        revalidatePath("/List/subjects")
        return{success:true,error:false};
    }catch(err)
    {
    console.log(err)
    return{success:false,error:true};
    }

};

export const deleteSubject = async(currentState:CurrentState,data:FormData )=>{
const id =data.get("id") as string
    try{
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return { success: false, error: true };
        }

        // Get all lessons for this subject
        const lessons = await DB.lesson.findMany({
            where: { subjectId: parseInt(id) },
            select: { id: true }
        });

        const lessonIds = lessons.map(l => l.id);

        if (lessonIds.length > 0) {
            // Get all assignments for these lessons
            const assignments = await DB.assignment.findMany({
                where: { lessonId: { in: lessonIds } },
                select: { id: true }
            });

            const assignmentIds = assignments.map(a => a.id);

            if (assignmentIds.length > 0) {
                // Delete all results for these assignments
                await DB.result.deleteMany({
                    where: { assignmentId: { in: assignmentIds } }
                });

                // Delete all assignments
                await DB.assignment.deleteMany({
                    where: { id: { in: assignmentIds } }
                });
            }

            // Delete all lessons
            await DB.lesson.deleteMany({
                where: { id: { in: lessonIds } }
            });
        }

        // Delete related content
        await DB.content.deleteMany({
            where: { subjectId: parseInt(id) }
        });

        // Disconnect all tutors and students from this subject
        await DB.subject.update({
            where: { id: parseInt(id) },
            data: {
                tutors: { set: [] },
                students: { set: [] }
            }
        });

        // Finally delete the subject
        await DB.subject.delete({
            where :{
                id:parseInt(id),
            },
        })
        revalidatePath("/List/subjects")
        return{success:true,error:false};
    }catch(err)
    {
    console.log("Error deleting subject:", err)
    return{success:false,error:true};
    }

};


//Tutor actions 


// ✅ Create Tutor
export const createTutor = async (currentState: CurrentState, data: TutorSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    const hashedPassword = await hash(data.password, 8);

    await DB.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role as UserRole,
        phone: data.phone,
        image: data.image,
        ...(data.id && { id: Number(data.id) }),
        subjectsTaught:
          data.subjects && data.subjects.length > 0
            ? {
                connect: data.subjects.map((subjectId: string) => ({
                  id: parseInt(subjectId),
                })),
              }
            : undefined,
      },
    });

    revalidatePath("/List/tutors");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error creating tutor:", err);
    return { success: false, error: true };
  }
};



// ✅ Update Tutor
export const updateTutor = async (currentState: CurrentState, data: TutorSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    await DB.user.update({
      where: { id: Number(data.id) },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role as UserRole,
        subjectsTaught:
          data.subjects && data.subjects.length > 0
            ? {
                set: data.subjects.map((subjectId: string) => ({
                  id: parseInt(subjectId),
                })),
              }
            : undefined,
      },
    });

    revalidatePath("/List/tutors");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error updating tutor:", err);
    return { success: false, error: true };
  }
};

// ✅ Delete Tutor
export const deleteTutor = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    await DB.user.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/List/tutors");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error deleting tutor:", err);
    return { success: false, error: true };
  }
};

//Grade actions

export const createGrade = async (currentState: CurrentState, data: GradeSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    await DB.grade.create({
      data: {
        name: data.name,
      }
    });

    revalidatePath("/List/grades");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateGrade = async(currentState:CurrentState,data:GradeSchema )=>{
    try{
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return { success: false, error: true };
        }

        await DB.grade.update({
            where :{
                id:data.id
            },
            data:{
                name:data.name,
            }
        })
        revalidatePath("/List/grades");
        return{success:true,error:false};
    }catch(err)
    {
    console.log(err)
    return{success:false,error:true};
    }

};

export const deleteGrade = async(currentState:CurrentState,data:FormData )=>{
const id =data.get("id") as string
    try{
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return { success: false, error: true };
        }

        await DB.grade.delete({
            where :{
                id:parseInt(id),
            },
        })
        revalidatePath("/List/grades");
        return{success:true,error:false};
    }catch(err)
    {
    console.log(err)
    return{success:false,error:true};
    }

};

// Class actions
export const createClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    await DB.class.create({
      data: {
        name: data.name,
        gradeId: data.gradeId,
        supervisorId: data.supervisorId,
      },
    });

    revalidatePath("/List/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    await DB.class.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        gradeId: data.gradeId,
        supervisorId: data.supervisorId,
      },
    });

    revalidatePath("/List/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    await DB.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/List/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const addStudentsToClass = async (currentState: CurrentState, data: FormData) => {
  const classId = data.get("classId") as string;
  const studentIds = data.getAll("studentIds") as string[];

  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TUTOR")) {
      return { success: false, error: true };
    }

    // Update each student to set their classId
    await Promise.all(
      studentIds.map((studentId) =>
        DB.user.update({
          where: { id: parseInt(studentId) },
          data: { classId: parseInt(classId) },
        })
      )
    );

    revalidatePath("/List/classes");
    revalidatePath("/List/students");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error adding students to class:", err);
    return { success: false, error: true };
  }
};

// Lesson actions
export const createLesson = async (currentState: CurrentState, data: LessonSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TUTOR")) {
      return { success: false, error: true };
    }

    await DB.lesson.create({
      data: {
        topic: data.topic,
        subjectId: data.subjectId,
        classId: data.classId,
        tutorId: data.tutorId,
      },
    });

    revalidatePath("/List/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (currentState: CurrentState, data: LessonSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TUTOR")) {
      return { success: false, error: true };
    }

    await DB.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        topic: data.topic,
        subjectId: data.subjectId,
        classId: data.classId,
        tutorId: data.tutorId,
      },
    });

    revalidatePath("/List/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TUTOR")) {
      return { success: false, error: true };
    }

    await DB.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/List/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Update User
export const updateUser = async (currentState: CurrentState, data: FormData) => {
  try {
    const id = data.get("id") as string;
    const firstName = data.get("firstName") as string;
    const lastName = data.get("lastName") as string;
    const phone = data.get("phone") as string;
    const bio = data.get("bio") as string;
    const gradeId = data.get("gradeId") as string;
    const subjects = data.getAll("subjects") as string[];

    await DB.user.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        phone,
        bio,
        gradeId: gradeId ? Number(gradeId) : undefined,
        subjectsTaught: subjects.length > 0 ? {
          set: subjects.map((id: string) => ({ id: parseInt(id) })),
        } : undefined,
      },
    });

    revalidatePath(`/SingleUserPage/${id}`);
    return { success: true, error: false };
  } catch (err) {
    console.log("Error updating user:", err);
    return { success: false, error: true };
  }
};

// Announcement actions
export const createAnnouncement = async (currentState: CurrentState, data: AnnouncementSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TUTOR")) {
      return { success: false, error: true };
    }

    await DB.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date || new Date(),
        authorId: parseInt(session.user.id!),
        classId: data.classId || null,
      },
    });

    revalidatePath("/List/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (currentState: CurrentState, data: AnnouncementSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TUTOR")) {
      return { success: false, error: true };
    }

    // Check if user is authorized to update this announcement
    const existingAnnouncement = await DB.announcement.findUnique({
      where: { id: data.id },
    });

    if (!existingAnnouncement) {
      return { success: false, error: true };
    }

    if (
      session.user.role !== "ADMIN" &&
      existingAnnouncement.authorId !== parseInt(session.user.id!)
    ) {
      return { success: false, error: true };
    }

    await DB.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date || existingAnnouncement.date,
        classId: data.classId || null,
      },
    });

    revalidatePath("/List/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TUTOR")) {
      return { success: false, error: true };
    }

    // Check if user is authorized to delete this announcement
    const existingAnnouncement = await DB.announcement.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAnnouncement) {
      return { success: false, error: true };
    }

    if (
      session.user.role !== "ADMIN" &&
      existingAnnouncement.authorId !== parseInt(session.user.id!)
    ) {
      return { success: false, error: true };
    }

    await DB.announcement.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/List/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Student actions
export const createStudent = async (currentState: CurrentState, data: StudentSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    const hashedPassword = data.password ? await hash(data.password, 8) : await hash("student123", 8);

    await DB.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: "STUDENT" as UserRole,
        phone: data.phone,
        image: data.image,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    revalidatePath("/List/students");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error creating student:", err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (currentState: CurrentState, data: StudentSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      image: data.image,
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: data.parentId,
    };

    // Only update password if provided
    if (data.password) {
      updateData.password = await hash(data.password, 8);
    }

    await DB.user.update({
      where: { id: Number(data.id) },
      data: updateData,
    });

    revalidatePath("/List/students");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error updating student:", err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    await DB.user.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/List/students");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error deleting student:", err);
    return { success: false, error: true };
  }
};

// Parent actions
export const createParent = async (currentState: CurrentState, data: ParentSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    const hashedPassword = data.password ? await hash(data.password, 8) : await hash("parent123", 8);

    await DB.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: "PARENT" as UserRole,
        phone: data.phone,
        image: data.image,
      },
    });

    revalidatePath("/List/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error creating parent:", err);
    return { success: false, error: true };
  }
};

export const updateParent = async (currentState: CurrentState, data: ParentSchema) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      image: data.image,
    };

    // Only update password if provided
    if (data.password) {
      updateData.password = await hash(data.password, 8);
    }

    await DB.user.update({
      where: { id: Number(data.id) },
      data: updateData,
    });

    revalidatePath("/List/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error updating parent:", err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: true };
    }

    await DB.user.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/List/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error deleting parent:", err);
    return { success: false, error: true };
  }
};
