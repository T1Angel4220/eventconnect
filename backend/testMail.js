const nodemailer = require('nodemailer');
require('dotenv').config({ path: __dirname + '/config/.env' });  // 👈 importante

async function main() {
  console.log("EMAIL_USER:", process.env.EMAIL_USER); // 👈 debug
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "OK" : "NO DEFINIDO");

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "ayuquinaangel4220@gmail.com",
    subject: "Prueba ✔",
    text: "Hola, esto es un test"
  });

  console.log("✅ Mensaje enviado:", info.messageId);
}

main().catch(console.error);
