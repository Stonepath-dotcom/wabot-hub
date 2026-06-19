import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase belum dikonfigurasi" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { name, whatsappNumber, email, botType, description, userId, apiProvider, apiKey, apiBaseUrl } = body;

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

    const id = uuidv4();

    // Insert bot registration
    const { data: registration, error: insertError } = await supabaseAdmin
      .from("bot_registrations")
      .insert({
        id,
        user_id: userId || null,
        name,
        whatsapp_number: cleanPhone,
        email: email || null,
        bot_type: botType || "customer-service",
        description: description || null,
        status: "pending",
        webhook_url: null,
        welcome_message: null,
        auto_reply: null,
        operating_hours: null,
        api_provider: apiProvider || null,
        api_key: apiKey || null,
        api_base_url: apiBaseUrl || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Gagal mendaftarkan bot", detail: insertError.message },
        { status: 500 }
      );
    }

    // Create audit log
    await supabaseAdmin.from("audit_logs").insert({
      bot_id: id,
      action: "created",
      detail: `Bot "${name}" didaftarkan`,
      user_id: userId || null,
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
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase belum dikonfigurasi" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Build query
    let query = supabaseAdmin
      .from("bot_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: registrations, error } = await query;

    if (error) {
      console.error("Fetch error:", error);
      // If table doesn't exist, return empty data
      if (error.code === "42P01") {
        return NextResponse.json({ data: [], stats: { total: 0, pending: 0, approved: 0, rejected: 0, byType: {}, recentDays: {} } });
      }
      return NextResponse.json(
        { error: "Gagal mengambil data pendaftaran", detail: error.message },
        { status: 500 }
      );
    }

    // Fetch audit log counts separately
    const { data: auditCounts } = await supabaseAdmin
      .from("audit_logs")
      .select("bot_id");

    // Build audit count map
    const auditCountMap: Record<string, number> = {};
    if (auditCounts) {
      for (const log of auditCounts) {
        auditCountMap[log.bot_id] = (auditCountMap[log.bot_id] || 0) + 1;
      }
    }

    // Enrich registrations with counts
    const enrichedRegistrations = (registrations || []).map((r) => ({
      ...r,
      whatsappNumber: r.whatsapp_number,
      botType: r.bot_type,
      webhookUrl: r.webhook_url,
      welcomeMessage: r.welcome_message,
      autoReply: r.auto_reply,
      operatingHours: r.operating_hours,
      apiProvider: r.api_provider,
      apiKey: r.api_key,
      apiBaseUrl: r.api_base_url,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      userId: r.user_id,
      _count: {
        auditLogs: auditCountMap[r.id] || 0,
        configs: 0,
      },
    }));

    // Calculate stats
    const stats = {
      total: enrichedRegistrations.length,
      pending: enrichedRegistrations.filter((r) => r.status === "pending").length,
      approved: enrichedRegistrations.filter((r) => r.status === "approved").length,
      rejected: enrichedRegistrations.filter((r) => r.status === "rejected").length,
      byType: enrichedRegistrations.reduce(
        (acc, r) => {
          const bt = r.botType || "customer-service";
          acc[bt] = (acc[bt] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentDays: enrichedRegistrations.reduce(
        (acc, r) => {
          const day = (r.createdAt || new Date().toISOString()).toString().slice(0, 10);
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return NextResponse.json({ data: enrichedRegistrations, stats });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}