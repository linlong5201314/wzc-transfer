import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const KEY_LATEST = 'transfer:latest';

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

    // @upstash/redis 会自动反序列化 JSON 对象
    const message = typeof data === 'string' ? JSON.parse(data) : data;

    // 客户端可传 since 参数,只在有新消息时返回
    if (since && message.timestamp <= since) {
      return res.status(200).json({ message: null });
    }

    return res.status(200).json({ message });
  } catch (err) {
    console.error('latest error:', err);
    return res.status(500).json({ error: '服务器错误', detail: String(err?.message || err) });
  }
}
