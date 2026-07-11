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

  // ── INIT: Receiver generates code and waits ──────────────────────
  if (action === 'init') {
    // Generate unique 8-digit code
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

    // Store as 'pending' with 10-minute TTL
    await kv.set(`sync:${syncCode}`, 'pending', { ex: 600 });

    return res.status(200).json({ code: syncCode });
  }

  // ── UPLOAD: Sender uploads encrypted data to the code ────────────
  if (action === 'upload') {
    if (!code || typeof code !== 'string' || code.length !== 8) {
      return res.status(400).json({ error: 'Invalid sync code.' });
    }
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid data.' });
    }

    if (data.length > 1_000_000) {
      return res.status(413).json({ error: 'Payload too large.' });
    }

    const stored = await kv.get(`sync:${code}`);
    if (!stored) {
      return res.status(404).json({ error: 'Sync code not found or expired.' });
    }

    // Overwrite 'pending' with actual encrypted data, refresh 10-min TTL
    await kv.set(`sync:${code}`, data, { ex: 600 });

    return res.status(200).json({ success: true });
  }

  // ── POLL: Receiver checks if data is ready ───────────────────────
  if (action === 'poll') {
    if (!code || typeof code !== 'string' || code.length !== 8) {
      return res.status(400).json({ error: 'Invalid sync code.' });
    }

    const stored = await kv.get<string>(`sync:${code}`);

    if (!stored) {
      return res.status(404).json({ error: 'Sync code not found or expired.' });
    }

    if (stored === 'pending') {
      // Data not uploaded yet, keep polling
      return res.status(202).json({ status: 'pending' });
    }

    // Data is ready, delete key for one-time use
    await kv.del(`sync:${code}`);

    return res.status(200).json({ data: stored });
  }

  return res.status(400).json({ error: 'Invalid action.' });
}
