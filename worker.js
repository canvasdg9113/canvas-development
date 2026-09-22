const enc = new TextEncoder();

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}

async function makeToken(secret) {
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  const payload = String(expires);
  return payload + "." + await hmac(payload, secret);
}

async function validToken(token, secret) {
  if (!token || !secret) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  const expected = await hmac(expires, secret);
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : "";
}

function unauthorized(request) {
  return Response.redirect(new URL("/residences-for-rent.html", request.url), 302);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/residences-login") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      if (!env.RENTAL_PASSWORD) return new Response("Rental access is not configured.", { status: 503 });
      let body;
      try { body = await request.json(); } catch { return new Response("Bad Request", { status: 400 }); }
      if (typeof body.password !== "string") return new Response("Bad Request", { status: 400 });

      const submitted = await hmac(body.password, env.RENTAL_PASSWORD);
      const expected = await hmac(env.RENTAL_PASSWORD, env.RENTAL_PASSWORD);
      if (submitted !== expected) return new Response("Unauthorized", { status: 401 });

      const token = await makeToken(env.RENTAL_PASSWORD);
      return new Response(null, {
        status: 204,
        headers: {
          "Set-Cookie": "canvas_rental_access=" + encodeURIComponent(token) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400",
          "Cache-Control": "no-store"
        }
      });
    }

    const protectedRoute =
      url.pathname === "/private-residences.html" ||
      url.pathname === "/private-residences" ||
      url.pathname.startsWith("/residences/");

    if (protectedRoute) {
      const token = getCookie(request, "canvas_rental_access");
      if (!(await validToken(token, env.RENTAL_PASSWORD))) return unauthorized(request);
    }

    return env.ASSETS.fetch(request);
  }
};
