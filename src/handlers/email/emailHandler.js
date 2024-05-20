const { createTransport } = require('nodemailer');
const { google } = require('googleapis');

const userModel = require('../../models/user');

// TODO: Move to .env
const USER_EMAIL = `team02.el7a2ni@gmail.com`
const USER_PASS = `el7a2ni!`
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

const sendMail = async (userId, notificationObject) => {
    return new Promise(async (resolve, reject) => {

        let user = await userModel.findById(userId);
        
        let userEmail = user?.email;
        if (userEmail == undefined) {
            console.log(`[ERROR] Undefined email for user with ID ${userId}`)
            resolve(0);
        }

        // ? TODO: Create HTML version of notification? With template for each type of notif
        
        // Send out email
        var mailOptions = {
            from: USER_EMAIL,
            to: userEmail,
            subject: notificationObject.title,
            text: notificationObject.message
        };
        
        let transporter = await createTransport();
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(`[ERROR] Unable to send email.\n${error}`);
                resolve(0);
            } else {
                console.log('[EMAIL] Email sent: ' + info.response);
                resolve(1);
            }
        });
    })
}

const createTransporter = async () => {
    try {
        const oauth2Client = new google.auth.OAuth2(
          CLIENT_ID,
          CLIENT_SECRET,
          "https://developers.google.com/oauthplayground"
        );
 
        oauth2Client.setCredentials({
          refresh_token: REFRESH_TOKEN,
        });
 
        const accessToken = await new Promise((resolve, reject) => {
          oauth2Client.getAccessToken((err, token) => {
            if (err) {
              console.log("[ERROR] ", err)
              reject();
            }
            resolve(token); 
          });
        });
 
        const transporter = createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: USER_EMAIL,
            accessToken,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
          },
        });
        
        return transporter;
    } catch (err) {
      return err
    }
  };
 

module.exports = { sendMail }
