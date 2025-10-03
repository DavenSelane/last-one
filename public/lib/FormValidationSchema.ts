import {z}  from "zod";

export const subjectSchema =z.object({
  id:z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  tutors:z.array(z.string()).default([]),
});
export type  SubjectSchema= z.infer<typeof subjectSchema>;

export const gradeSchema =z.object({
  id:z.coerce.number().optional(),
  name: z.string().min(1, { message: "Grade name is required!" }),
});
export type  GradeSchema= z.infer<typeof gradeSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
gradeId: z.number({ message: "Grade is required!" }),
supervisorId: z.number({ message: "Supervisor is required!" }),

});
export type ClassSchema = z.infer<typeof classSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  topic: z.string().min(1, { message: "Topic is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
  tutorId: z.coerce.number({ message: "Tutor is required!" }),
});
export type LessonSchema = z.infer<typeof lessonSchema>;



export const tutorSchema = z.object({
  id:z.string().optional(),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  role: z.string({ message: "Please select a role to Register!" }),
  image: z
    .any()  
    .refine((files) => files?.length === 1, "Image is required")
    .transform((files) => files?.[0])
    .optional(),
    subjects:z.array(z.string()).optional(),
});
export type TutorSchema = z.infer<typeof tutorSchema>;





export const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["VIDEO", "DOCUMENT", "QUIZ"]), // match your Prisma enum
  subjectId: z.coerce.number(), // converts string -> number
  grades: z.coerce.number(),    // single grade now
  description: z.string().min(10, "Please provide a short description"),
  body: z.string().optional(),           // for rich text / notes
  videoUrl: z.string().optional(), // only for VIDEO type
  documentUrl: z.string().optional(), // only for DOCUMENT type
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
  allowComments: z.boolean().optional(),
  featured: z.boolean().optional(),

  authorId: z.coerce.number().optional(),
});

export type ContentSchema = z.infer<typeof contentSchema>;

export const userSchema = z.object({
  id: z.coerce.number().optional(),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  gradeId: z.coerce.number().optional(),
  subjects: z.array(z.string()).optional(),
});
export type UserSchema = z.infer<typeof userSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.coerce.date().optional(),
  classId: z.coerce.number().optional().nullable(),
});
export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const studentSchema = z.object({
  id: z.coerce.number().optional(),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional(),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().optional(),
  role: z.string().default("STUDENT"),
  image: z.string().optional(),
  gradeId: z.coerce.number().optional(),
  classId: z.coerce.number().optional(),
  parentId: z.coerce.number().optional(),
});
export type StudentSchema = z.infer<typeof studentSchema>;

export const parentSchema = z.object({
  id: z.coerce.number().optional(),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional(),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().optional(),
  role: z.string().default("PARENT"),
  image: z.string().optional(),
});
export type ParentSchema = z.infer<typeof parentSchema>;