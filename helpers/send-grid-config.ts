import sendGrid from "@sendgrid/mail";
const sendGridkey : any = process.env.SENDGRID_API_KEY;
sendGrid.setApiKey(sendGridkey);
module.exports = sendGrid;