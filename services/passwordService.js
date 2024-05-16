const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../model/userModel');
require('dotenv').config();
const bcrypt = require('bcrypt');
const Mailgen = require('mailgen');

const generateResetToken = async (email) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiration = Date.now() + 3600000;

        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await user.save();

        return resetToken;
    } catch (error) {
        console.error(error); // Log the error
        throw error; // Re-throw the error to be handled by the calling function
    }
};

const sendResetEmail = async (userEmail, resetToken, res, username) => {
    try {
        console.log('DEBUG: Username in sendResetEmail:', username);

        let config = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
            debug: true,
        };

        const transporter = nodemailer.createTransport(config);

        let mailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "MailGen",
                link: "https://mailgen.js/"
            }
        });

        let response = {
            body: {
                name: username || "User", 
                intro: `Hi ${username || "User"}, You can reset your password here`,
                table: {
                    data: [
                        {
                            item: "Reset Password",
                            description: `Click <a href="http://localhost:3000/reset-password/${resetToken}">here</a> to reset your password.`
                        }
                    ],
                    button:{
                        color: "#FFD700",
                        text: "RESET PASSWORD",
                        url:`http://localhost:3000/reset-password/${resetToken}`
                    }
                },
                outro: "Looking forward to you exploring the endless world of Kenyan cinema.",
                debug: { User}
            }
        };

        let mail = mailGenerator.generate(response);

        let message = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "Reset Password",
            html: mail
        };

        // Using async/await for sending the mail
        await transporter.sendMail(message);
        return 'Email sent successfully';
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while sending the reset email'
        });
    }
};

const resetPassword = async (token, newPassword) => {
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            throw new Error('User is not found or token has expired');
        }

        // Generate a new salt for hashing the password
        const salt = await bcrypt.genSalt(10);
        
        // Hash the new password
        const hashedPwd = await bcrypt.hash(newPassword, salt);

        // Update the user's password and clear the reset token fields
        user.password = hashedPwd;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();
    } catch (error) {
        console.error('error hashing the new Password', error);
        throw new Error('An error occurred while resetting the password');
    }
};

module.exports = {
    generateResetToken,
    sendResetEmail,
    resetPassword
};
