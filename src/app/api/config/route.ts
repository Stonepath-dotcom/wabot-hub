import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabaseUrl: "https://lbugditshniyphdzgjad.supabase.co",
    supabaseAnonKey: "sb_publishable_mVDJmsOrdpjAtIC93mp5pg_4IItOwQt",
  });
}