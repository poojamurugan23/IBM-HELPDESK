const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || "test@test.com",
        pass: process.env.SMTP_PASS || "testpass",
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        console.log(`📧 [EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);

        // If no real creds, just log
        if (!process.env.SMTP_HOST) {
            console.log("   Message (HTML):", html);
            return true;
        }

        const info = await transporter.sendMail({
            from: `"IBM HelpDesk" <${process.env.SMTP_USER || "support@ibmhelpdesk.com"}>`,
            to,
            subject,
            html, // Use HTML for body
        });
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email: ", error);
        return false;
    }
};

module.exports = sendEmail;
