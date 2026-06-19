import { NextRequest } from "next/server";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { method, phone } = body;

  if (!method || (method !== "qr" && method !== "code")) {
    return new Response(JSON.stringify({ error: "Method must be 'qr' or 'code'" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (method === "code" && (!phone || phone.length < 10)) {
    return new Response(
      JSON.stringify({ error: "Nomor telepon wajib diisi untuk metode kode (contoh: 6281234567890)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const apiKey = `wb_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(event: string, data: Record<string, unknown>) {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          /* stream closed */
        }
      }

      try {
        // Dynamic import to keep initial bundle smaller
        const baileys = await import("@whiskeysockets/baileys");
        const { default: makeWASocket, initAuthCreds, DisconnectReason } = baileys;

        // In-memory auth state (no filesystem needed)
        const creds = initAuthCreds();
        const keyStore: Record<string, Uint8Array> = {};

        const authState = {
          creds,
          keys: {
            get: async (_type: string, _ids: string[]) => {
              const key = `${_type},${_ids.join(",")}`;
              return keyStore[key];
            },
            set: async (_type: string, _ids: string[], value: Uint8Array) => {
              const key = `${_type},${_ids.join(",")}`;
              keyStore[key] = value;
            },
          },
        };

        const sock = makeWASocket({
          auth: authState,
          printQRInTerminal: false,
          logger: { level: "silent" } as never,
          browser: ["WaBot Hub", "Chrome", "120.0.0"],
          markOnlineOnConnect: false,
        });

        // Send session ID immediately
        send("session", { sessionId, apiKey });

        sock.ev.on("connection.update", (update: any) => {
          const { qr, pairingCode, connection, lastDisconnect } = update;

          if (qr) {
            send("qr", { qr });
          }

          if (pairingCode) {
            send("code", { code: pairingCode });
          }

          if (connection === "open") {
            const phoneNumber = creds.me?.id?.split(":")[0]?.split("@")[0] || phone || "unknown";
            send("connected", {
              apiKey,
              sessionId,
              phoneNumber,
            });
            // Close connection after short delay
            setTimeout(() => {
              try {
                sock.end(new Error("Session captured"));
              } catch {}
              try {
                controller.close();
              } catch {}
            }, 2000);
          }

          if (connection === "close") {
            const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
            const boomMessage = (lastDisconnect?.error as any)?.message;

            if (statusCode === DisconnectReason.loggedOut) {
              send("error", { message: "Koneksi ditutup. Silakan coba lagi." });
              try { controller.close(); } catch {}
            } else if (statusCode === DisconnectReason.connectionClosed) {
              send("error", { message: "Koneksi terputus. Memulai ulang..." });
              try { controller.close(); } catch {}
            } else if (statusCode !== DisconnectReason.restartRequired) {
              send("error", {
                message: boomMessage || `Koneksi gagal (code: ${statusCode}). Coba lagi.`,
              });
              try { controller.close(); } catch {}
            }
          }
        });

        // If code method, request pairing code after socket is ready
        if (method === "code" && phone) {
          const cleanPhone = phone.replace(/[^0-9]/g, "");
          // Wait a moment for socket to be ready
          await new Promise((r) => setTimeout(r, 2000));
          try {
            const code = await sock.requestPairingCode(cleanPhone);
            if (code) {
              send("code", { code });
            }
          } catch (e: any) {
            send("error", {
              message: e.message || "Gagal mendapatkan kode pairing. Pastikan nomor valid.",
            });
            try { controller.close(); } catch {}
          }
        }

        // Timeout after 110 seconds
        setTimeout(() => {
          send("timeout", { message: "Waktu habis. Silakan coba lagi." });
          try { sock.end(new Error("timeout")); } catch {}
          try { controller.close(); } catch {}
        }, 110000);
      } catch (e: any) {
        console.error("Baileys connection error:", e);
        send("error", {
          message: e.message || "Gagal membuat koneksi WhatsApp",
        });
        try { controller.close(); } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}