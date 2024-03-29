/*
 *  FILE USED TO HANDLE EMAIL VERIFICATION FLOW 
 */

const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
var ejs =               require("ejs");
const { promisify } =   require('util');

function init(app, firebaseAdmin) {
    require('dotenv').config();
    app.post('/verify/email/', function (req, res) {
        const isPrivate =       res.locals.isPrivate;
        const isVerified =      res.locals.isVerified;
        const user =            res.locals.user;
        
        //Check if user is logged in
        if(!isPrivate){
            const email =           user.email;
            const debug =           false;

            //Check if user is already verified
            if (!isVerified) {

                //Generate verification link if the app is not in debug mode
                if (!debug) {

                    //Generate verification link using Firebase Admin SDK
                    firebaseAdmin.auth().generateEmailVerificationLink(email).then((link) => {
                        const emailVerificationLink = link;

                        //Send verification link to user email
                        sendEmail(email, emailVerificationLink).then((info) => {
                            res.status(200).send({ message: 'Email sent' });

                        }).catch((error) => {
                            console.log(error);
                            res.status(401).send(error);

                        });

                    }).catch((error) => {
                        console.log(error);
                        res.status(401).send(error);
                    });
                } else {

                    //Send sample verification link to user email
                    let emailVerificationLink = 'https://test.com';

                    sendEmail(email, emailVerificationLink).then((info) => {
                        res.status(200).send({ message: 'Email sent' });

                    }).catch((error) => {
                        res.status(500).send(error);
                        
                    });
                }
            } else {
                res.clearCookie('session');
                res.status(200).redirect('/signin');
            }
        }else{
            res.status(401).send({ error: `Cant verify token: ${req.cookies.session}` });
        }

    });
}


//Function to send e-mail using NodeMailer
async function sendEmail(email, emailVerificationLink) {
    const nodemailer =      require('nodemailer');
    const transporter =     nodemailer.createTransport({
        host:       'smtp.zoho.com',
        port:       465,
        secure:     true,
        auth:       {
                        user: process.env.verificationEmail,
                        pass: process.env.verificationPass
                    }
    });

    //Generate e-mail template using EJS
    const data =            await ejs.renderFile(appDir + '/src/components/mailTemplate.ejs', { link: emailVerificationLink }, { async: true });
    const mailOptions =     {
                                from:       process.env.verificationEmail,
                                to:         email,
                                subject:    'Verificación de correo',
                                html:       data,
                                priority:   'high'
                            };
    
    //Send e-mail using NodeMailer Transporter
    return await promisify(transporter.sendMail.bind(transporter))(mailOptions);
}
module.exports = { init };