const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');
var fs =                require("fs");
var ejs =               require("ejs");
const { promisify } =   require('util');

function init(app, firebaseAdmin) {
    app.post('/verify/email/', function (req, res) {
        const isPrivate =       res.locals.isPrivate;
        const isVerified =      res.locals.isVerified;
        const user =            res.locals.user;
        
        if(!isPrivate){
            const email =           user.email;
            const debug =           false;

            if (!isVerified) {
                if (!debug) {
                    firebaseAdmin.auth().generateEmailVerificationLink(email).then((link) => {
                        const emailVerificationLink = link;

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

    const data =            await ejs.renderFile(appDir + '/public/mailTemplate.ejs', { link: emailVerificationLink }, { async: true });
    const mailOptions =     {
                                from:       process.env.verificationEmail,
                                to:         email,
                                subject:    'Verificación de correo',
                                html:       data,
                                priority:   'high'
                            };

    return await promisify(transporter.sendMail.bind(transporter))(mailOptions);
}
module.exports = { init };