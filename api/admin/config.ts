import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  const KV_KEY = 'finaura_admin_config';

  // Prevent CORS issues if being called from a different domain (like local dev pointing to prod)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Fetch the global configuration
      const config = await kv.get(KV_KEY) || {};
      return res.status(200).json(config);
    } catch (e) {
      console.error("Vercel KV Error:", e);
      // Fallback to empty object so frontend doesn't crash if KV isn't provisioned yet
      return res.status(200).json({}); 
    }
  } 
  
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Fetch existing data to merge, so we don't overwrite cards when saving a theme, etc.
      const existing: any = await kv.get(KV_KEY) || {};
      const newConfig = { ...existing, ...data };
      
      // Save merged config back to database
      await kv.set(KV_KEY, newConfig);
      
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error("Vercel KV Error:", e);
      return res.status(500).json({ error: 'Failed to save configuration. Have you created the Vercel KV database?' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
