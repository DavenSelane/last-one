 import { DB } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {hash} from "bcrypt"; 
import z from "zod";





const schema = z
  .object({
    email: z.string().email({ message: "Invalid email address!" }),
 role: z.enum(["student", "parent", "tutor", "admin"]
, { message: "Please select a role to Register!" }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long!" }),
    firstName: z.string().min(1, { message: "FirstName is required!" }),
    lastName: z
      .string()
      .min(1, { message: "LastName has to be at least 1 character long!" }),
   
  });





export async function POST(req: Request) {
  try {
    const body = await req.json();
console.log(body)
    const { email, firstName, lastName, password, role } = schema.parse(body);
    const normalizedEmail = email.toLowerCase();

    const existingUser = await DB.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ user: null, message: "User with this email already exists" });
    }

    const hashedPassword = await hash(password, 8);

    let rolePrisma: "STUDENT" | "PARENT" | "TUTOR" | "ADMIN";

switch (role.toLowerCase()) {
  case "student":
    rolePrisma = "STUDENT";
    break;
  case "parent":
    rolePrisma = "PARENT";
    break;
  case "tutor":
    rolePrisma = "TUTOR";
    break;
  case "admin":
    rolePrisma = "ADMIN";
    break;
  default:
    throw new Error("Invalid role selected");
}

    const newUser = await DB.user.create({
      data: {
        email: normalizedEmail,
        firstName,
        lastName,
        password: hashedPassword,
        role: rolePrisma,
      }
    });

    console.log("New user created:", newUser);

    return NextResponse.json({ user: newUser, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Sorry! Something went wrong!" });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, parentId, subjectId } = body;

    const updateData: any = {};
    if (parentId) updateData.parentId = parentId;
    if (subjectId) updateData.subjectId = subjectId;

    const updatedUser = await DB.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ user: updatedUser, message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Sorry! Something went wrong!" });
  }
}
