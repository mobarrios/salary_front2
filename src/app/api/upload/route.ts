import { NextRequest, NextResponse } from 'next/server';
import { IncomingForm } from 'formidable';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';
import path from 'path';
import { IncomingMessage } from 'http';

// Next.js App Router config para permitir multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convierte ReadableStream de NextRequest a Readable Node.js
function nextRequestToNodeRequest(req: NextRequest): IncomingMessage {
  const readable = new Readable({
    async read() {
      const reader = req.body?.getReader();
      if (!reader) return this.push(null);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        this.push(Buffer.from(value));
      }
      this.push(null);
    },
  });

  const nodeReq = readable as unknown as IncomingMessage;
  nodeReq.headers = Object.fromEntries(req.headers.entries());
  nodeReq.method = req.method;
  nodeReq.url = req.url || '';

  return nodeReq;
}

export async function POST(req: NextRequest) {
  const nodeReq = nextRequestToNodeRequest(req);

  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), '/public/uploads'),
    keepExtensions: true,
    multiples: false,
  });

  return new Promise((resolve, reject) => {
    form.parse(nodeReq, (err, fields, files) => {
      if (err) {
        console.error('Formidable parse error:', err);
        reject(NextResponse.json({ error: 'Failed to parse form data' }, { status: 500 }));
        return;
      }

      resolve(NextResponse.json({ fields, files }));
    });
  });
}
