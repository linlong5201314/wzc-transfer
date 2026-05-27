import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const KEY_HISTORY = 'transfer:image:history';
const MAX = 50;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const count = Math.min(parseInt(req.query.count, 10) || MAX, MAX);
    const items = await redis.lrange(KEY_HISTORY, 0, count - 1);
    const messages = (items || []).map(item =>
      typeof item === 'string' ? JSON.parse(item) : item
    );
    return res.status(200).json({ messages });
  } catch (err) {
    console.error('image-history error:', err);
    return res.status(500).json({ error: '服务器错误', detail: String(err?.message || err) });
  }
}
