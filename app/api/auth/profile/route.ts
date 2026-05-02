import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, currentPassword, newPassword } = await req.json();

    if (!firstName) {
      return NextResponse.json({ error: "Nama depan wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {
      firstName,
      lastName: lastName || "",
    };

    // If attempting to change password
    if (newPassword) {
      if (!currentPassword) {
         return NextResponse.json({ error: "Password saat ini wajib diisi untuk mengubah password" }, { status: 400 });
      }

      // Google OAuth users might not have a passwordHash
      if (!user.passwordHash) {
         return NextResponse.json({ error: "Akun ini didaftarkan via Google, tidak dapat merubah password." }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, firstName: true, lastName: true, email: true, role: true }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profil berhasil diperbarui"
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui profil" },
      { status: 500 }
    );
  }
}
