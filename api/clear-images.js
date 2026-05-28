import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const KEY_IMAGE_LATEST = 'transfer:image:latest';
const KEY_IMAGE_HISTORY = 'transfer:image:history';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await Promise.all([
      redis.del(KEY_IMAGE_LATEST),
      redis.del(KEY_IMAGE_HISTORY)
    ]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('clear-images error:', err);
    return res.status(500).json({ error: '服务器错误', detail: String(err?.message || err) });
  }
}
