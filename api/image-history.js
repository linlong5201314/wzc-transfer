import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const KEY_HISTORY = 'transfer:image:history';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const items = await redis.lrange(KEY_HISTORY, 0, 49);
    const messages = (items || []).map(item =>
      typeof item === 'string' ? JSON.parse(item) : item
    );
    const summary = messages.map(m => ({
      filename: m.filename,
      senderId: m.senderId,
      timestamp: m.timestamp
    }));
    return res.status(200).json({ messages: summary });
  } catch (err) {
    console.error('image-history error:', err);
    return res.status(500).json({ error: '服务器错误', detail: String(err?.message || err) });
  }
}
