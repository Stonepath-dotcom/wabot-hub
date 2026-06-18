import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const updated = await db.botRegistration.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: "Status berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.botRegistration.delete({ where: { id } });
    return NextResponse.json({ message: "Pendaftaran berhasil dihapus" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pendaftaran" },
      { status: 500 }
    );
  }
}