import nodemailer from 'nodemailer';

async function sendEmail(userEmail, message) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: userEmail,
            subject: `${message} - MERN Tuition`,
            html: `<h1>${message}</h1>
                <p>This is a system generated mail.</p>
                <hr>
                <p>Team MERN Tuition.</p>
                `
        };

        await transporter.sendMail(mailOptions);
        console.log("Verification code sent to email");
    } catch (error) {
        console.log(error);
    }
}

export default sendEmail;