import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'ArtisanConnect <onboarding@resend.dev>';

/**
 * Common HTML Wrapper for Professional Emails
 * @description Standard branding layout for all transactional emails.
 * @param {string} title - The header title for the email.
 * @param {string} content - The main body HTML content.
 * @param {string} [actionLabel] - Optional button text.
 * @param {string} [actionUrl] - Optional button redirect URL.
 * @returns {string} Fully composed HTML document.
 * @private
 */
const emailTemplate = (title, content, actionLabel, actionUrl) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        .body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f9f7f5; margin: 0; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eee; }
        .header { background: #3d3028; padding: 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-family: 'Playfair Display', serif; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 40px; color: #3d3028; line-height: 1.6; }
        .content h2 { margin-top: 0; font-size: 20px; font-weight: 700; }
        .footer { padding: 24px; text-align: center; color: #8c7e74; font-size: 13px; background: #faf8f6; }
        .button { display: inline-block; padding: 14px 28px; background: #3d3028; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; }
    </style>
</head>
<body class="body">
    <div class="container">
        <div class="header">
            <h1>ArtisanConnect</h1>
        </div>
        <div class="content">
            <h2>${title}</h2>
            ${content}
            ${actionLabel && actionUrl ? `<a href="${actionUrl}" class="button">${actionLabel}</a>` : ''}
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} ArtisanConnect. All rights reserved.<br>
            Connecting creative minds and art lovers.
        </div>
    </div>
</body>
</html>
`;

/**
 * @description Professional welcome email for new user registrations.
 * @param {string} email - Recipient email address.
 * @param {string} fullName - Recipient's full name for personalization.
 */
export const sendWelcomeEmail = async (email, fullName) => {
    try {
        const html = emailTemplate(
            `Welcome aboard, ${fullName}`,
            `<p>We're thrilled to have you join ArtisanConnect. Our platform is built to help artists showcase their work and clients find the perfect custom pieces.</p>
             <p>Start exploring the community today and let your creativity lead the way.</p>`,
            'Go to Dashboard',
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
        );

        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Welcome to ArtisanConnect',
            html
        });
    } catch (error) {
        console.error('Email failed (Welcome):', error);
    }
};

/**
 * @description Alerts the artist of a new incoming commission requirement.
 * @param {string} email - Artist's email address.
 * @param {string} clientName - Name of the client making the request.
 * @param {string} orderTitle - Title of the commission request.
 */
export const sendArtistRequestNotification = async (email, clientName, orderTitle) => {
    try {
        const html = emailTemplate(
            'New Commission Request',
            `<p>Hello! You've received a new art request: <strong>"${orderTitle}"</strong> from <strong>${clientName}</strong>.</p>
             <p>Please review the details in your dashboard and respond to the client to start collaborating.</p>`,
            'Review Request',
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/artist-dashboard`
        );

        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'New Order Request - ArtisanConnect',
            html
        });
    } catch (error) {
        console.error('Email failed (Request Notification):', error);
    }
};

/**
 * @description Notifies clients of changes in their order workflow.
 * @param {string} email - Client's email address.
 * @param {string} orderTitle - Title of the commission.
 * @param {string} newStatus - The new status of the order.
 */
export const sendStatusUpdateNotification = async (email, orderTitle, newStatus) => {
    try {
        const html = emailTemplate(
            'Order Status Updated',
            `<p>Your order for <strong>"${orderTitle}"</strong> has been updated to: <strong style="color: #664930;">${newStatus.toUpperCase()}</strong>.</p>
             <p>Check your dashboard for new messages or next steps in the process.</p>`,
            'View My Orders',
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client-dashboard`
        );

        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `Order Status Updated: ${orderTitle}`,
            html
        });
    } catch (error) {
        console.error('Email failed (Status Update):', error);
    }
};

/**
 * @description Direct delivery of secure OTPs for account recovery or verification.
 * @param {string} email - Recipient email address.
 * @param {string} otp - The one-time password code.
 * @param {string} [type='Password Reset'] - Context of the OTP.
 */
export const sendOTPEmail = async (email, otp, type = 'Password Reset') => {
    try {
        const html = emailTemplate(
            `${type} Verification Code`,
            `<p>You've requested a verification code for <strong>${type}</strong>.</p>
             <div style="background: #fdfaf7; border: 1px dashed #3d3028; padding: 20px; font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; color: #3d3028;">
                ${otp}
             </div>
             <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>`
        );

        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `Account Verification Code: ${otp}`,
            html
        });
    } catch (error) {
        console.error('Email failed (OTP):', error);
    }
};

/**
 * @description Confirms successful index and publication of new portfolio entries.
 * @param {string} email - Artist's email address.
 * @param {string} artworkTitle - Title of the published artwork.
 */
export const sendArtworkUploadConfirmation = async (email, artworkTitle) => {
    try {
        const html = emailTemplate(
            'Artwork Published',
            `<p>Great news! Your artwork <strong>"${artworkTitle}"</strong> is now live on the Discover page.</p>
             <p>We've indexed it for search, so clients looking for your style can find it easily.</p>`,
            'View Portfolio',
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/artist-dashboard`
        );

        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Publication Confirmed - ArtisanConnect',
            html
        });
    } catch (error) {
        console.error('Email failed (Upload Confirm):', error);
    }
};
