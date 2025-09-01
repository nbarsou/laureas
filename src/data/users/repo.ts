import { prisma } from "@/lib/db";

export async function getUserByEmail(email: string) {
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) return null;

    return await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  } catch (_err) {
    return null;
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id }, // id is a string mapped to @db.ObjectId
    });
  } catch (_err) {
    return null;
  }
}
