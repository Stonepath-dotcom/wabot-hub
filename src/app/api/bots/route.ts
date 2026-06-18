import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, whatsappNumber, email, botType, description } = body;

    if (!name || !whatsappNumber) {
      return NextResponse.json(
        { error: "Nama dan nomor WhatsApp wajib diisi" },
        { status: 400 }
      );
    }

    const cleanPhone = whatsappNumber.replace(/[\s\-()]/g, "");
    const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Format nomor WhatsApp tidak valid (contoh: +6281234567890)" },
        { status: 400 }
      );
    }

    const registration = await db.botRegistration.create({
      data: {
        name,
        whatsappNumber: cleanPhone,
        email: email || null,
        botType: botType || "customer-service",
        description: description || null,
        status: "pending",
      },
    });

    return NextResponse.json(
      { message: "Pendaftaran berhasil dikirim!", data: registration },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftarkan bot" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const registrations = await db.botRegistration.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: registrations });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}