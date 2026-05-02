import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Pendaftaran manual telah ditutup. Silakan mendaftar menggunakan Google Sign-In untuk keamanan." },
    { status: 403 }
  );
}
