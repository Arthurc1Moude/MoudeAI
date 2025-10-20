import type { NextApiRequest, NextApiResponse } from 'next';
import { sendMessage } from '@/app/actions';

export const config = {
  api: {
    bodyParser: false, // We'll parse FormData manually
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    // Parse FormData from the request
    // Next.js API routes don't natively support multipart/form-data, so we use busboy
    const busboy = require('busboy');
    const bb = busboy({ headers: req.headers });
    const formData: Record<string, any> = {};
    const chunks: Promise<void>[] = [];
    bb.on('field', (name: string, val: string) => {
      formData[name] = val;
    });
    bb.on('finish', async () => {
      // Wrap in FormData for compatibility with sendMessage
      const fd = new (require('formdata-node').FormData)();
      for (const k in formData) {
        fd.append(k, formData[k]);
      }
      const result = await sendMessage({}, fd);
      res.status(200).json(result);
    });
    req.pipe(bb);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Internal error' });
  }
}