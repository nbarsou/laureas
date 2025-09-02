import { prisma } from "@/lib/db";
import { error } from "console";

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
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        image: true,
      },
    });
  } catch (error) {
    return null;
  }
}
