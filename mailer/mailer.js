const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_DOMAIN,
    pass: process.env.MAIL_PASSWORD
  }
});

module.exports = { transporter: transporter };