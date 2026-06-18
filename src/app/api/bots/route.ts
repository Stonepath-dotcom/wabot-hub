import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, whatsappNumber, email, botType, description, userId } = body;

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

    const webhookId = uuidv4().slice(0, 8);
    const registration = await db.botRegistration.create({
      data: {
        name,
        whatsappNumber: cleanPhone,
        email: email || null,
        botType: botType || "customer-service",
        description: description || null,
        userId: userId || null,
        webhookUrl: null,
        status: "pending",
      },
    });

    await db.auditLog.create({
      data: {
        botId: registration.id,
        action: "created",
        detail: `Bot "${name}" didaftarkan`,
        userId: userId || null,
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;

    const registrations = await db.botRegistration.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { auditLogs: true, configs: true } },
      },
    });

    const stats = {
      total: registrations.length,
      pending: registrations.filter((r) => r.status === "pending").length,
      approved: registrations.filter((r) => r.status === "approved").length,
      rejected: registrations.filter((r) => r.status === "rejected").length,
      byType: registrations.reduce(
        (acc, r) => {
          acc[r.botType] = (acc[r.botType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentDays: registrations.reduce(
        (acc, r) => {
          const day = r.createdAt.toISOString().slice(0, 10);
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return NextResponse.json({ data: registrations, stats });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}