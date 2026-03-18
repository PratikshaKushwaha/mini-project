import nodemailer from "nodemailer";

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
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
    notifyWelcomeEmail: async (userEmail, fullName) => {
        const subject = "Welcome to ArtisanConnect! 🎨";
        const content = `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfaf7; border-radius: 24px; overflow: hidden; border: 1px solid #e5e0dc;">
                <div style="background-color: #3d3028; padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-size: 28px;">ArtisanConnect</h1>
                </div>
                <div style="padding: 40px; color: #3d3028; line-height: 1.6;">
                    <h2 style="font-size: 24px; margin-bottom: 20px;">Welcome, ${fullName}!</h2>
                    <p style="font-size: 16px; color: #665a52;">We're thrilled to have you join our community of talented artists and art lovers. ArtisanConnect is where creativity meets collaboration.</p>
                    <p style="font-size: 16px; color: #665a52; margin-bottom: 30px;">Start exploring breathtaking artwork or showcase your own talent today.</p>
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; padding: 16px 32px; background-color: #3d3028; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Go to Dashboard</a>
                    </div>
                </div>
                <div style="background-color: #f7f3f0; padding: 20px; text-align: center; color: #8c7e74; font-size: 14px;">
                    © ${new Date().getFullYear()} ArtisanConnect. All rights reserved.
                </div>
            </div>
        `;
        sendEmail(userEmail, subject, content).catch(console.error);
    },

    notifyArtworkUpload: async (artistEmail, artworkTitle) => {
        const subject = "Artwork Uploaded Successfully! ✨";
        const content = `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfaf7; border-radius: 24px; overflow: hidden; border: 1px solid #e5e0dc;">
                <div style="background-color: #3d3028; padding: 40px; text-align: center; color: #ffffff;">
                    <div style="font-size: 40px; margin-bottom: 10px;">✨</div>
                    <h1 style="margin: 0; font-size: 24px;">Upload Successful</h1>
                </div>
                <div style="padding: 40px; color: #3d3028; line-height: 1.6;">
                    <p style="font-size: 16px; color: #665a52;">Your artwork <strong>"${artworkTitle}"</strong> has been successfully uploaded to your portfolio.</p>
                    <p style="font-size: 16px; color: #665a52;">It is now visible to the public on the Discover page. We can't wait for everyone to see it!</p>
                </div>
            </div>
        `;
        sendEmail(artistEmail, subject, content).catch(console.error);
    },

    notifyArtistOnRequest: async (artistEmail, clientName, title) => {
        const subject = "New Art Request - ArtisanConnect 🧧";
        const content = `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfaf7; border-radius: 24px; overflow: hidden; border: 1px solid #e5e0dc;">
                <div style="background-color: #3d3028; padding: 40px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px;">New Request Received</h1>
                </div>
                <div style="padding: 40px; color: #3d3028; line-height: 1.6;">
                    <p style="font-size: 16px; color: #665a52;">Hello,</p>
                    <p style="font-size: 16px; color: #665a52;">You have received a new art request: <strong>"${title}"</strong> from ${clientName}.</p>
                    <p style="font-size: 16px; color: #665a52; margin-bottom: 30px;">Please log in to your dashboard to review the details and start collaborating.</p>
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/artist-dashboard" style="display: inline-block; padding: 14px 28px; background-color: #3d3028; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600;">Review Request</a>
                    </div>
                </div>
            </div>
        `;
        sendEmail(artistEmail, subject, content).catch(console.error);
    },
    
    notifyClientOnStatusChange: async (clientEmail, title, newStatus) => {
        const subject = `Order Status Update: ${newStatus.toUpperCase()} 🔄`;
        const content = `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfaf7; border-radius: 24px; overflow: hidden; border: 1px solid #e5e0dc;">
                <div style="background-color: #3d3028; padding: 40px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px;">Status Update</h1>
                </div>
                <div style="padding: 40px; color: #3d3028; line-height: 1.6;">
                    <p style="font-size: 16px; color: #665a52;">Hello,</p>
                    <p style="font-size: 16px; color: #665a52;">Your request for <strong>"${title}"</strong> has a new status: <span style="display: inline-block; padding: 4px 12px; background-color: #e5e0dc; color: #3d3028; border-radius: 20px; font-weight: bold; font-size: 14px;">${newStatus.toUpperCase()}</span>.</p>
                    <p style="font-size: 16px; color: #665a52; margin-bottom: 30px;">Check your dashboard for more details and next steps.</p>
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/client-dashboard" style="display: inline-block; padding: 14px 28px; background-color: #3d3028; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600;">View Details</a>
                    </div>
                </div>
            </div>
        `;
        sendEmail(clientEmail, subject, content).catch(console.error);
    }
};
