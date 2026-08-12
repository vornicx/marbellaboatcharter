const crypto = require('crypto');

const MAX_BODY_BYTES = 24_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const buckets = new Map();

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function clean(value, max = 500) {
  return String(value ?? '')
    .replace(/[<>\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function validEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
  if (!value) return true;
  return /^[+()\d\s.-]{6,30}$/.test(value);
}

function getIp(req) {
  return clean(req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown', 80);
}

function allowed(req) {
  const key = crypto.createHash('sha256').update(getIp(req)).digest('hex');
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.startedAt > WINDOW_MS) {
    buckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= MAX_REQUESTS_PER_WINDOW;
}

function buildPayload(body) {
  const payload = {
    name: clean(body.name, 120),
    email: clean(body.email, 180).toLowerCase(),
    phone: clean(body.phone, 40),
    date: clean(body.date, 40),
    guests: Number.parseInt(body.guests, 10),
    duration: clean(body.duration, 60),
    departure: clean(body.departure || body.port, 100),
    experience: clean(body.experience || body.plan, 180),
    vessel: clean(body.vessel || body.boat, 180),
    extras: Array.isArray(body.extras) ? body.extras.slice(0, 12).map(item => clean(item, 80)) : [],
    notes: clean(body.notes, 1200),
    locale: ['en', 'es', 'fr'].includes(body.locale) ? body.locale : 'en',
    source: clean(body.source || 'website', 80),
    consent: body.consent === true,
    website: clean(body.website, 120)
  };

  if (!payload.name) throw new Error('name');
  if (!Number.isFinite(payload.guests) || payload.guests < 1 || payload.guests > 150) throw new Error('guests');
  if (!payload.email && !payload.phone) throw new Error('contact');
  if (!validEmail(payload.email)) throw new Error('email');
  if (!validPhone(payload.phone)) throw new Error('phone');
  if (!payload.consent) throw new Error('consent');
  return payload;
}

module.exports = async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  if (!allowed(req)) return json(res, 429, { ok: false, error: 'rate_limited' });

  const length = Number(req.headers['content-length'] || 0);
  if (length > MAX_BODY_BYTES) return json(res, 413, { ok: false, error: 'payload_too_large' });

  let payload;
  try {
    payload = buildPayload(req.body || {});
  } catch (error) {
    return json(res, 400, { ok: false, error: 'invalid_request', field: error.message });
  }

  // Honeypot. Respond successfully so bots do not learn the trap.
  if (payload.website) return json(res, 202, { ok: true, reference: 'received' });

  const reference = `MBC-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  // Production adapter contract:
  // 1. Persist the validated enquiry in the platform database.
  // 2. Trigger transactional email / internal notification.
  // 3. Optionally create or update the CRM client record.
  // Secrets must be configured as server-side environment variables only.
  if (!process.env.ENQUIRY_WEBHOOK_URL) {
    return json(res, 202, {
      ok: true,
      reference,
      delivery: 'accepted_not_connected'
    });
  }

  try {
    const response = await fetch(process.env.ENQUIRY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.ENQUIRY_WEBHOOK_SECRET ? { 'Authorization': `Bearer ${process.env.ENQUIRY_WEBHOOK_SECRET}` } : {})
      },
      body: JSON.stringify({ reference, ...payload }),
      signal: AbortSignal.timeout(7000)
    });

    if (!response.ok) throw new Error(`upstream_${response.status}`);
    return json(res, 201, { ok: true, reference, delivery: 'submitted' });
  } catch (error) {
    console.error('enquiry_delivery_failed', { reference, message: error.message });
    return json(res, 503, { ok: false, error: 'delivery_unavailable', reference });
  }
};
