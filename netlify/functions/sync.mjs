import { getStore } from "@netlify/blobs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS });
  }

  try {
    const store = getStore("wagons-golf-sync");

    if (request.method === "GET") {
      const data = await store.get("sync-data");
      if (data === null) {
        return new Response(JSON.stringify({ error: "no sync file" }), {
          status: 404, headers: { "Content-Type": "application/json", ...CORS },
        });
      }
      return new Response(data, {
        status: 200, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    if (request.method === "POST") {
      const body = await request.text();
      JSON.parse(body); // validate — throws if malformed
      await store.set("sync-data", body);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    return new Response("Not found", { status: 404 });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS },
    });
  }
};

export const config = { path: "/sync" };
