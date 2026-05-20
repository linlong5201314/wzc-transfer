import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const KEY_LATEST = 'transfer:latest';
const KEY_HISTORY = 'transfer:history';
const MAX_HISTORY = 20;
const MAX_TEXT_BYTES = 100 * 1024; // 100KB

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const text = typeof body.text === 'string' ? body.text : '';
    const senderId = typeof body.senderId === 'string' ? body.senderId.slice(0, 64) : 'anonymous';

    if (!text) {
      return res.status(400).json({ error: '内容不能为空' });
    }
    if (Buffer.byteLength(text, 'utf8') > MAX_TEXT_BYTES) {
      return res.status(413).json({ error: '内容过大,最多 100KB' });
    }

    const message = {
      text,
      senderId,
      timestamp: Date.now()
    };

    // 同时写入"最新"和"历史"
    await Promise.all([
      redis.set(KEY_LATEST, message),
      redis.lpush(KEY_HISTORY, message),
      redis.ltrim(KEY_HISTORY, 0, MAX_HISTORY - 1)
    ]);

    return res.status(200).json({ ok: true, message });
  } catch (err) {
    console.error('send error:', err);
    return res.status(500).json({ error: '服务器错误', detail: String(err?.message || err) });
  }
}
