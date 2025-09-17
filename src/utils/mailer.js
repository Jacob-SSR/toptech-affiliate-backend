// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: process.env.SMTP_SECURE === "true",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// export const sendConfirmationEmail = async (email, token) => {
//   const confirmLink = `http://localhost:8000/confirm-email?token=${token}`;

//   const info = await transporter.sendMail({
//     from: `"Paylater" <${process.env.SMTP_USER}>`,
//     to: email,
//     subject: "Confirm your email",
//     html: `<p>Hi! Please confirm your email by clicking the link below:</p>
//            <a href="${confirmLink}">${confirmLink}</a>`,
//   });

//   console.log("Email sent: %s", info.messageId);
// };
