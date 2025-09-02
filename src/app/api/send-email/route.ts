// import nodemailer from 'nodemailer';
// import path from 'path';

// export async function POST(req: NextRequest) {
//   const { html, email, subject, attachments } = await req.json();
//   if (!html || !email) return new Response(JSON.stringify({ error: 'Datos incompletos' }), { status: 400 });

//   const user = process.env.EMAIL_USER!;
//   const pass = process.env.EMAIL_PASS!;

//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: { user, pass },
//   });
  

//   // Convierte lo que te llega (filename o URL) en adjuntos con CID
//   const buildPathOrUrl = (ref?: string) => {
//     if (!ref) return undefined;
//     if (/^https?:\/\//i.test(ref)) return ref; // URL pública: Nodemailer la descarga
//     // Si en DB guardás solo el filename (p.ej. "abc.png") en /public/uploads
//     const rel = ref.replace(/^\/+/, ''); // quita "/" inicial si viene "/uploads/abc.png"
//     const isAlreadyUnderPublic = rel.startsWith('uploads/');
//     return path.join(process.cwd(), 'public', isAlreadyUnderPublic ? rel : path.join('uploads', rel));
//   };

//   const headerRef = attachments?.header;
//   const footerRef = attachments?.footer;

//   const files: any[] = [];
//   const headerPath = buildPathOrUrl(headerRef);
//   const footerPath = buildPathOrUrl(footerRef);
//   if (headerPath) files.push({ filename: 'header' + path.extname(String(headerPath)) || '.png', path: headerPath, cid: 'headercid' });
//   if (footerPath) files.push({ filename: 'footer' + path.extname(String(footerPath)) || '.png', path: footerPath, cid: 'footercid' });

//   // Mejor: usa PLACEHOLDERS en el HTML
//   // <img src="__HEADER_CID__"> y <img src="__FOOTER_CID__">
//   const htmlWithCid = html
//     .replace(/__HEADER_CID__/g, 'cid:headercid')
//     .replace(/__FOOTER_CID__/g, 'cid:footercid');

//   await transporter.sendMail({
//     from: user,
//     to: email,
//     subject: subject || 'Contenido generado',
//     html: htmlWithCid,
//     attachments: files,
//   });

//   return new Response(JSON.stringify({ message: 'Email enviado' }), { status: 200 });
// }

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

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    
    if (!user || !pass) {
      return new Response(JSON.stringify({ error: 'Faltan EMAIL_USER/EMAIL_PASS' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
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