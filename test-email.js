<<<<<<< HEAD
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function testEmail() {
    console.log("Testing email with:", process.env.EMAIL_USER);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log("SMTP Connection successful");
    } catch (error) {
        console.error("SMTP Connection failed:", error);
    }
}

testEmail();
=======
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function testEmail() {
    console.log("Testing email with:", process.env.EMAIL_USER);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log("SMTP Connection successful");
    } catch (error) {
        console.error("SMTP Connection failed:", error);
    }
}

testEmail();
>>>>>>> b2633f978fb333335f250d6d88fadd17a67c2a69
