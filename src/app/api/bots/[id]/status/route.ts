import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase belum dikonfigurasi" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const {
      status,
      userId,
      name,
      whatsappNumber,
      email,
      botType,
      description,
      welcomeMessage,
      autoReply,
      operatingHours,
      webhookUrl,
    } = await req.json();

    const validStatuses = ["pending", "approved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    // Build update data (use snake_case for Supabase columns)
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (whatsappNumber !== undefined) updateData.whatsapp_number = whatsappNumber;
    if (email !== undefined) updateData.email = email;
    if (botType !== undefined) updateData.bot_type = botType;
    if (description !== undefined) updateData.description = description;
    if (welcomeMessage !== undefined) updateData.welcome_message = welcomeMessage;
    if (autoReply !== undefined) updateData.auto_reply = autoReply;
    if (operatingHours !== undefined) updateData.operating_hours = operatingHours;
    if (webhookUrl !== undefined) updateData.webhook_url = webhookUrl;
    updateData.updated_at = new Date().toISOString();

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("bot_registrations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Gagal memperbarui", detail: updateError.message },
        { status: 500 }
      );
    }

    // Create audit log for status change
    if (status) {
      await supabaseAdmin.from("audit_logs").insert({
        bot_id: id,
        action: `status_${status}`,
        detail: `Status diubah ke ${status}`,
        user_id: userId || null,
      });
    }

    // Return with camelCase fields for frontend compatibility
    const result = {
      ...updated,
      whatsappNumber: updated.whatsapp_number,
      botType: updated.bot_type,
      webhookUrl: updated.webhook_url,
      welcomeMessage: updated.welcome_message,
      autoReply: updated.auto_reply,
      operatingHours: updated.operating_hours,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      userId: updated.user_id,
      _count: { auditLogs: 0, configs: 0 },
    };

    return NextResponse.json({
      message: "Berhasil diperbarui",
      data: result,
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
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase belum dikonfigurasi" },
        { status: 500 }
      );
    }

    const { id } = await params;

    // Delete audit logs first (in case cascade doesn't work)
    await supabaseAdmin.from("audit_logs").delete().eq("bot_id", id);

    // Delete the bot registration
    const { error } = await supabaseAdmin
      .from("bot_registrations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { error: "Gagal menghapus pendaftaran", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Pendaftaran berhasil dihapus" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pendaftaran" },
      { status: 500 }
    );
  }
}