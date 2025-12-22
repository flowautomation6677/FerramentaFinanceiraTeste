import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendWelcomeEmail = async (email: string, phone: string) => {
    if (!process.env.SMTP_USER) {
        console.log(`[Email Mock] Would send welcome email to ${email} (Phone: ${phone})`);
        return;
    }

    const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Bem-vindo ao Porquim 360! 🐷</h1>
      <p>Sua assinatura foi confirmada com sucesso.</p>
      
      <p><strong>Passo 1:</strong> Acesse seu Dashboard:</p>
      <a href="${dashboardUrl}/dashboard" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Painel</a>

      <p><strong>Passo 2:</strong> Fale com o Bot no WhatsApp:</p>
      <p>Certifique-se de mandar mensagem usando o número: <strong>${phone}</strong></p>

      <hr/>
      <p style="font-size: 12px; color: #666;">Se você não realizou esta compra, ignore este email.</p>
    </div>
  `;

    try {
        const info = await transporter.sendMail({
            from: '"Porquim 360" <noreply@porquim360.com>',
            to: email,
            subject: '🚀 Acesso Liberado: Bem-vindo ao Porquim 360',
            html,
        });
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
