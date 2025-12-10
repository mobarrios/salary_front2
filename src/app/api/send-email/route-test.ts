import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { html, email, subject, attachments } = await req.json();
    if (!html || !email) {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = 'rochaleandroleonel@gmail.com'
    const pass = 'drzonwcidrpekbol'

    if (!user || !pass) {
      return new Response(JSON.stringify({ error: 'Faltan EMAIL_USER/EMAIL_PASS' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail", // o bien host: "smtp.gmail.com"
      host: "smtp.gmail.com",
      port: 587,             // STARTTLS
      secure: false,         // debe ser false en 587
      auth: {
        user: "rochaleandroleonel@gmail.com",
        pass: "drzonwcidrpekbol",
      },
    });

    const buildPathOrUrl = (ref?: string) => {
      if (!ref) return undefined;
      if (/^https?:\/\//i.test(ref)) return ref;
      const rel = ref.replace(/^\/+/, '');
      const underUploads = rel.startsWith('uploads/') ? rel : `uploads/${rel}`;
      return path.join(process.cwd(), 'public', underUploads);
    };

    const headerRef = attachments?.header;
    const footerRef = attachments?.footer;

    const files: any[] = [];
    const headerPath = buildPathOrUrl(headerRef);
    const footerPath = buildPathOrUrl(footerRef);
    if (headerPath) files.push({ filename: 'header' + path.extname(String(headerPath)) || '.png', path: headerPath, cid: 'headercid' });
    if (footerPath) files.push({ filename: 'footer' + path.extname(String(footerPath)) || '.png', path: footerPath, cid: 'footercid' });

    const htmlWithCid = html
      .replace(/__HEADER_CID__/g, 'cid:headercid')
      .replace(/__FOOTER_CID__/g, 'cid:footercid');

    await transporter.sendMail({
      from: user,
      to: email,
      subject: subject || 'Contenido generado',
      html: htmlWithCid,
      attachments: files,
    });

    return new Response(JSON.stringify({ ok: true, message: 'Email enviado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('send-email error:', err);
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}