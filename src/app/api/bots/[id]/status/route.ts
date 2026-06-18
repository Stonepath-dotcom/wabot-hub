import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, userId, name, whatsappNumber, email, botType, description, welcomeMessage, autoReply, operatingHours, webhookUrl } = await req.json();

    const validStatuses = ["pending", "approved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (email !== undefined) updateData.email = email;
    if (botType !== undefined) updateData.botType = botType;
    if (description !== undefined) updateData.description = description;
    if (welcomeMessage !== undefined) updateData.welcomeMessage = welcomeMessage;
    if (autoReply !== undefined) updateData.autoReply = autoReply;
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;

    const updated = await db.botRegistration.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { auditLogs: true, configs: true } } },
    });

    if (status) {
      await db.auditLog.create({
        data: {
          botId: id,
          action: `status_${status}`,
          detail: `Status diubah ke ${status}`,
          userId: userId || null,
        },
      });
    }

    return NextResponse.json({
      message: "Berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui" },
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