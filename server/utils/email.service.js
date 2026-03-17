import nodemailer from "nodemailer";

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GOOGLE_MAIL_USER,
                pass: process.env.GOOGLE_MAIL_REFRESH_TOKEN // Using the refresh token or app password here. Assuming it's an app password since it was in env previously.
            }
        });

        const mailOptions = {
            from: process.env.GOOGLE_MAIL_USER,
            to,
            subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
        return true;
    } catch (error) {
        console.error(`Email sending failed:`, error);
        return false; // Non-blocking failure
    }
};

export const emailService = {
    notifyArtistOnRequest: async (artistEmail, clientName, title) => {
        const subject = "New Art Request - ArtisanConnect";
        const content = `<h3>Hello,</h3><p>You have received a new art request: <strong>${title}</strong> from ${clientName}.</p><p>Please log in to your dashboard to review it.</p>`;
        // Fire and forget
        sendEmail(artistEmail, subject, content).catch(console.error);
    },
    
    notifyClientOnStatusChange: async (clientEmail, title, newStatus) => {
        const subject = `Update on your Art Request - ArtisanConnect`;
        const content = `<h3>Hello,</h3><p>Your request for <strong>${title}</strong> has a new status: <strong>${newStatus.toUpperCase()}</strong>.</p><p>Check your dashboard for more details.</p>`;
        // Fire and forget
        sendEmail(clientEmail, subject, content).catch(console.error);
    }
};
