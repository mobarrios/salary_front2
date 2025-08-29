// src/app/api/send-pdf/route.ts
// import { NextRequest } from 'next/server';
// import nodemailer from 'nodemailer';
// import path from 'path';

// export async function POST(req: NextRequest) {
//   const { html, email,subject } = await req.json();

//   if (!html || !email) {
//     return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
//       status: 400,
//     });
//   }

//   const user = process.env.EMAIL_USER;
//   const pass = process.env.EMAIL_PASS;

//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user,pass
//       },
//     });

//   const htmlWithCid = html
//   .replace(/src="\/header\.png"/g, 'src="cid:headercid"')
//   .replace(/src="\/footer\.png"/g, 'src="cid:footercid"');

//   try {
//     await transporter.sendMail({
//       from: user,
//       to: email,
//       subject: subject,
//       html: htmlWithCid,
//       attachments: [
//         {
//           filename: 'header.png',
//           path: path.join(process.cwd(), 'public/header.png'), // Ruta absoluta a la imagen header
//           cid: 'headercid',
//         },
//         {
//           filename: 'footer.png',
//           path: path.join(process.cwd(), 'public/footer.png'), // Ruta absoluta a la imagen footer
//           cid: 'footercid',
//         },
//       ],
//     });

//     return new Response(JSON.stringify({ message: 'Email enviado' }), {
//       status: 200,
//     });
//   } catch (error) {
//     console.error('Error al enviar:', error);
//     return new Response(JSON.stringify({ error: 'Falló el envío' }), {
//       status: 500,
//     });
//   }
  
// }

import nodemailer from 'nodemailer';
import path from 'path';

export async function POST(req: NextRequest) {
  const { html, email, subject, attachments } = await req.json(); // 👈 ahora sí
  if (!html || !email) return new Response(JSON.stringify({ error: 'Datos incompletos' }), { status: 400 });

  const user = process.env.EMAIL_USER!;
  const pass = process.env.EMAIL_PASS!;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  // Convierte lo que te llega (filename o URL) en adjuntos con CID
  const buildPathOrUrl = (ref?: string) => {
    if (!ref) return undefined;
    if (/^https?:\/\//i.test(ref)) return ref; // URL pública: Nodemailer la descarga
    // Si en DB guardás solo el filename (p.ej. "abc.png") en /public/uploads
    const rel = ref.replace(/^\/+/, ''); // quita "/" inicial si viene "/uploads/abc.png"
    const isAlreadyUnderPublic = rel.startsWith('uploads/');
    return path.join(process.cwd(), 'public', isAlreadyUnderPublic ? rel : path.join('uploads', rel));
  };

  const headerRef = attachments?.header;
  const footerRef = attachments?.footer;

  const files: any[] = [];
  const headerPath = buildPathOrUrl(headerRef);
  const footerPath = buildPathOrUrl(footerRef);
  if (headerPath) files.push({ filename: 'header' + path.extname(String(headerPath)) || '.png', path: headerPath, cid: 'headercid' });
  if (footerPath) files.push({ filename: 'footer' + path.extname(String(footerPath)) || '.png', path: footerPath, cid: 'footercid' });

  // Mejor: usa PLACEHOLDERS en el HTML
  // <img src="__HEADER_CID__"> y <img src="__FOOTER_CID__">
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

  return new Response(JSON.stringify({ message: 'Email enviado' }), { status: 200 });
}
