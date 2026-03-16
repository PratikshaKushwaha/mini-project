import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        type:'OAuth2',
        user: process.env.GOOGLE_MAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_MAIL_REFRESH_TOKEN
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email services: ', error);
    } else {
        console.log('Email service is ready to send messages');
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.GOOGLE_MAIL_USER,
            to, 
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw new Error('Failed to send email');
    }
};
