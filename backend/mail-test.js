const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function sendTestMail() {
    console.log('--- Mail-Konfiguration wird geprüft ---');
    console.log('Host:', process.env.EMAIL_SMTP_HOST);
    console.log('Port:', process.env.EMAIL_SMTP_PORT);
    console.log('User:', process.env.EMAIL_SMTP_USER);

    // Konfiguration (Port 465 nutzt secure: true)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: parseInt(process.env.EMAIL_SMTP_PORT),
        secure: process.env.EMAIL_SMTP_PORT == 465, // true für 465, false für 587
        auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME || 'Sublymaster Test'}" <${process.env.EMAIL_SMTP_FROM || 'noreply@sublymaster.de'}>`,
            to: "michael.deja@md-it-solutions.de", // Deine Ziel-Adresse
            subject: "Netcup SMTP Test ✔",
            text: "Glückwunsch! Die Mail-Verbindung vom Netcup-Server steht.",
            html: "<b>Glückwunsch!</b> Die Mail-Verbindung vom Netcup-Server steht.",
        });

        console.log('✅ Mail erfolgreich gesendet! ID:', info.messageId);
    } catch (error) {
        console.error('❌ Fehler beim Senden:', error.message);
        if (error.code === 'EAUTH') {
            console.error('Tipp: Prüfe Benutzername und Passwort!');
        } else if (error.code === 'ESOCKET') {
            console.error('Tipp: Port 465 (SSL) wird eventuell blockiert oder Host ist falsch.');
        }
    }
}

sendTestMail();
