// // Nodemailer setup
import nodemailer from "nodemailer";
// import { createTransporter } from "../server.js";


const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port:465,
  secure: true,
  auth:{
    user:'rahulcshaji007@gmail.com',
    pass:'bagv auvv cyxg bucm'
  }
};



export const sentVerificationEmail = async (email, token) => {
   const transporter = nodemailer.createTransport(SMTP_CONFIG) // Create transporter
  // const transporter = createTransporter();
  // const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;
  const verificationLink = `http://localhost:5173/verify?token=${token}`;


  const mailOptions = {
    from : SMTP_CONFIG.auth.user,
    to: email,
    subject: 'Verify Your Email',
    html:`
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  
  await transporter.sendMail(mailOptions);
  console.log(`Verification email sent to ${email}`);
}
