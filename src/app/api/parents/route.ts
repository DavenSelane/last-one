import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";

export async function GET() {
  try {
    const parents = await DB.user.findMany({
      where: { role: "PARENT" },
      include: {
        children: true,
      },
    });
    return NextResponse.json(parents);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
