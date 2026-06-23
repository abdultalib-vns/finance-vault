import { kv } from '@vercel/kv';

const KV_SESSIONS = 'finaura_global_sessions';
const KV_EVENTS = 'finaura_global_events';
const KV_ACTIVE_USERS = 'finaura_active_users'; // Hash of userId/sessionId -> timestamp

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

  // GET: Admin fetching analytics data
  if (req.method === 'GET') {
    try {
      const [sessions, events, activeUsersObj] = await Promise.all([
        kv.get<any[]>(KV_SESSIONS) || Promise.resolve([]),
        kv.get<any[]>(KV_EVENTS) || Promise.resolve([]),
        kv.hgetall(KV_ACTIVE_USERS) || Promise.resolve({})
      ]);

      // Calculate active users (heartbeat within last 1 minute)
      const now = Date.now();
      const activeCount = Object.values(activeUsersObj || {}).filter((ts: any) => now - ts < 60000).length;

      return res.status(200).json({ sessions: sessions || [], events: events || [], activeUsers: activeCount });
    } catch (e) {
      console.error("Vercel KV Analytics Error:", e);
      return res.status(200).json({ sessions: [], events: [], activeUsers: 0 });
    }
  }

  // POST: Client sending analytics data
  if (req.method === 'POST') {
    try {
      const { type, payload } = req.body;

      if (type === 'start_session') {
        const existingSessions = (await kv.get<any[]>(KV_SESSIONS)) || [];
        existingSessions.unshift(payload);
        // Keep only last 500 sessions
        await kv.set(KV_SESSIONS, existingSessions.slice(0, 500));
        await kv.hset(KV_ACTIVE_USERS, { [payload.id]: Date.now() });
      } 
      else if (type === 'end_session') {
        const { id, endTime } = payload;
        const existingSessions = (await kv.get<any[]>(KV_SESSIONS)) || [];
        const idx = existingSessions.findIndex(s => s.id === id);
        if (idx !== -1) {
          existingSessions[idx].endTime = endTime;
          await kv.set(KV_SESSIONS, existingSessions);
        }
        await kv.hdel(KV_ACTIVE_USERS, id);
      }
      else if (type === 'heartbeat') {
        const { id } = payload;
        await kv.hset(KV_ACTIVE_USERS, { [id]: Date.now() });
      }
      else if (type === 'track_tab') {
        const { id, tab } = payload;
        const existingSessions = (await kv.get<any[]>(KV_SESSIONS)) || [];
        const idx = existingSessions.findIndex(s => s.id === id);
        if (idx !== -1) {
          existingSessions[idx].tabVisits[tab] = (existingSessions[idx].tabVisits[tab] || 0) + 1;
          await kv.set(KV_SESSIONS, existingSessions);
        }
      }
      else if (type === 'event') {
        const existingEvents = (await kv.get<any[]>(KV_EVENTS)) || [];
        existingEvents.unshift(payload);
        await kv.set(KV_EVENTS, existingEvents.slice(0, 1000));
      }

      return res.status(200).json({ success: true });
    } catch (e) {
      console.error("Vercel KV Analytics POST Error:", e);
      return res.status(500).json({ error: 'Failed to record analytics.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
