// src/app/api/send-pdf/route.ts
import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';

export async function POST(req: NextRequest) {
  const { html, email } = await req.json();

  if (!html || !email) {
    return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
      status: 400,
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rochaleandroleonel@gmail.com',
      pass: 'plweshznafjndgad',
    },
  });

    const htmlWithCid = html
    .replace(/src="\/header\.png"/g, 'src="cid:headercid"')
    .replace(/src="\/footer\.png"/g, 'src="cid:footercid"');


  try {
    await transporter.sendMail({
      from: 'rochaleandroleonel@gmail.com',
      to: email,
      subject: 'Contenido generado',
      html: htmlWithCid,
      attachments: [
        {
          filename: 'header.png',
          path: path.join(process.cwd(), 'public/header.png'), // Ruta absoluta a la imagen header
          cid: 'headercid',
        },
        {
          filename: 'footer.png',
          path: path.join(process.cwd(), 'public/footer.png'), // Ruta absoluta a la imagen footer
          cid: 'footercid',
        },
      ],
    });

    return new Response(JSON.stringify({ message: 'Email enviado' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error al enviar:', error);
    return new Response(JSON.stringify({ error: 'Falló el envío' }), {
      status: 500,
    });
  }
  
}
