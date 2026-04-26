/**
 * @file emailService.js
 * @description Servicio desacoplado para el envío de correos electrónicos.
 * Soporta modo desarrollo (Ethereal) y producción (SMTP).
 */

const nodemailer = require('nodemailer');

/**
 * Envía un correo de recuperación de contraseña.
 * @param {String} email - Destinatario.
 * @param {String} resetUrl - URL única de recuperación.
 */
const sendResetEmail = async (email, resetUrl) => {
  let transporter;

  // Configuración para Desarrollo (Ethereal)
  if (process.env.NODE_ENV === 'development') {
    // Generar cuenta de prueba si no hay credenciales
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: testAccount.user, // usuario generado por ethereal
        pass: testAccount.pass, // contraseña generada por ethereal
      },
    });
  } else {
    // Configuración para Producción (Variables de entorno)
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Depende del proveedor, comúnmente false para 587 con STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Definir el mensaje
  const message = {
    from: '"Soporte Academia" <noreply@academia.com>',
    to: email,
    subject: 'Recuperación de Contraseña - ACADEMIA',
    text: `Has solicitado restablecer tu contraseña. Por favor, visita este enlace: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D32F2F;">Recuperación de Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña en la plataforma <strong>ACADEMIA</strong>.</p>
        <p>Haz clic en el siguiente botón para continuar (expira en 15 minutos):</p>
        <a href="${resetUrl}" style="background-color: #D32F2F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Restablecer Contraseña</a>
        <p style="color: #666; font-size: 0.9rem;">Si no solicitaste esto, ignora este correo.</p>
      </div>
    `,
  };

  // Enviar el correo
  const info = await transporter.sendMail(message);

  console.log('Mensaje enviado: %s', info.messageId);

  // En desarrollo, mostrar URL de previsualización
  if (process.env.NODE_ENV === 'development') {
    console.log('Vista previa URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = {
  sendResetEmail,
};
