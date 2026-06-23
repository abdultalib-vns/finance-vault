import { kv } from '@vercel/kv';

const KV_KEY = 'finaura_user_feedbacks';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
      const feedbacks = await kv.get(KV_KEY) || [];
      return res.status(200).json(feedbacks);
    } catch (e) {
      console.error("Vercel KV Error:", e);
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
      }

      const existing: any[] = (await kv.get(KV_KEY)) || [];

      const newFeedback = {
        id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        description: description.trim(),
        createdAt: Date.now(),
        status: 'new',
      };

      existing.unshift(newFeedback);
      await kv.set(KV_KEY, existing);

      return res.status(200).json({ success: true, id: newFeedback.id });
    } catch (e) {
      console.error("Vercel KV Error:", e);
      return res.status(500).json({ error: 'Failed to save feedback.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
