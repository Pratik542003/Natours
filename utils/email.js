const nodemailer = require('nodemailer');

const sendEmail = async options=>{
    // 1) create a transporter
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth: {
            user:process.env.EMAIL_USERNAME,
            password:process.env.EMAIL_PASSWORD
        }
    });

    //2) define the email options 
    const mailOptions = {
        from: 'Pratik <pratik@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message,

    }
    //3) actually send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;