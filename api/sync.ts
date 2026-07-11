import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, data, code } = req.body || {};

  // ── UPLOAD: Encrypt + store with 8-digit code ──────────────────
  if (action === 'upload') {
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "data" field.' });
    }

    // 1MB safety limit
    if (data.length > 1_000_000) {
      return res.status(413).json({ error: 'Payload too large. Please reduce your data or clear old transactions.' });
    }

    // Generate unique 8-digit code, retry if collision
    let syncCode = '';
    let attempts = 0;
    while (attempts < 5) {
      syncCode = String(Math.floor(10000000 + Math.random() * 90000000));
      const existing = await kv.get(`sync:${syncCode}`);
      if (!existing) break;
      attempts++;
    }

    if (attempts >= 5) {
      return res.status(503).json({ error: 'Could not generate a unique sync code. Please try again.' });
    }

    // Store with 10-minute TTL (600 seconds)
    await kv.set(`sync:${syncCode}`, data, { ex: 600 });

    return res.status(200).json({ code: syncCode });
  }

  // ── DOWNLOAD: Fetch by code, one-time use ──────────────────────
  if (action === 'download') {
    if (!code || typeof code !== 'string' || code.length !== 8) {
      return res.status(400).json({ error: 'Invalid sync code. Must be 8 digits.' });
    }

    const stored = await kv.get<string>(`sync:${code}`);

    if (!stored) {
      return res.status(404).json({ error: 'Sync code not found or expired. Please generate a new code on the other device.' });
    }

    // Delete after retrieval (one-time use)
    await kv.del(`sync:${code}`);

    return res.status(200).json({ data: stored });
  }

  return res.status(400).json({ error: 'Invalid action. Use "upload" or "download".' });
}
