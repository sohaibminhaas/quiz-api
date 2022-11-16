const sendGrid = require("../helpers/send-grid-config");
import prismaClient from '../src/prisma';

export async function sendEmail(
    quizid: number | undefined | null
) {
    try {
        if (quizid) {
            console.log("here=============1")
            const body = process.env.BASEURL;
            const userEmails = await prismaClient.users.findMany({
                select: {
                    email: true
                }
            });
            console.log("userEmails======", userEmails);
            userEmails.forEach( async email => {
                let msg: any = {
                    to: email.email,
                    from: process.env.SENDGRID_FROM_EMAIL,
                    subject: "Test Quiz System",
                };
                msg = { ...msg, text:  body};
                const emailSerRes = await sendGrid.send(msg);
                console.log("Send Email Response", emailSerRes);
            });
        }
    } catch (error) {
        console.error("error in sending emails", error);
    }
}