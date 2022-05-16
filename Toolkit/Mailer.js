const nodemailer = require('nodemailer');
/**
 *
 * @param {string} subject
 * @param {string} text
 */
function sendMailNotification(subject, text) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'awopshalf@gmail.com',
      pass: 'P9aga3uH',
    },
  });

  const mailOptions = {
    from: 'awopshalf@gmail.com',
    to: 'david@flashpowa.com',
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
  sendMailNotification,
};
