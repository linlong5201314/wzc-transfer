import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const KEY_LATEST = 'transfer:image:latest';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const since = parseInt(req.query.since, 10) || 0;
    const data = await redis.get(KEY_LATEST);

    if (!data) {
      return res.status(200).json({ message: null });
    }

    const message = typeof data === 'string' ? JSON.parse(data) : data;

    if (since && message.timestamp <= since) {
      return res.status(200).json({ message: null });
    }

    return res.status(200).json({ message });
  } catch (err) {
    console.error('image-latest error:', err);
    return res.status(500).json({ error: '服务器错误', detail: String(err?.message || err) });
  }
}
