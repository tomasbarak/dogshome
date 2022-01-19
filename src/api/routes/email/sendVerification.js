const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const logColor = require(appDir + '/src/config/logColors');
var fs = require("fs");
var ejs = require("ejs");
const { promisify } = require('util');

function init(app, firebaseAdmin) {
    app.post('/verify/email/', function (req, res) {
        const token = req.cookies.session || ' ';;

        console.log(token)
        firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
            //Generate email verification link
            res.header('Access-Control-Allow-Origin', '*');
            const email = decodedIdToken.email;
            const debug = false;
            if(!debug){
                firebaseAdmin.auth().generateEmailVerificationLink(email).then((link) => {
                    let emailVerificationLink = link;
                    sendEmail(email, emailVerificationLink).then((info) => {
                        console.log('Email sent: ' + info.response);
                        res.status(200).send({ message: 'Email sent' });
                    }).catch((error) => {
                        console.log(error);
                        res.status(500).send({ error: error });
                    });
                }).catch((error) => {
                    console.log(error)
                    res.status(500).send({ error: `No se ha podido generar el link` });
                });
            }else{
                let emailVerificationLink = 'https://test.com';
                    sendEmail(email, emailVerificationLink).then((info) => {
                        console.log('Email sent: ' + info.response);
                        res.status(200).send({ message: 'Email sent' });
                    }).catch((error) => {
                        console.log(error);
                        res.status(500).send({ error: error });
                    });
            }
            

        }).catch((error) => {
            console.log(error)
            res.status(401).send({ error: `Cant verify token: ${req.headers.authtoken}` });
        });

    })
    app.get('/view/templates/email', function (req, res) {
        res.render(appDir + '/public/mailTemplate.ejs', {
            link: 'example.com'
        });
    })
}

function sendEmail(email, emailVerificationLink) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.verificationEmail,
            pass: process.env.verificationPass
        }
    });
    console.log(process.env.verificationEmail, process.env.verificationPass)
    ejs.renderFile(appDir + '/public/mailTemplate.ejs', { link: emailVerificationLink }, function (err, data) {
        console.log(data)
        if (err) {
            console.log(err);
            return Promise.reject(err);
        } else {
            const mailOptions = {
                from: process.env.verificationEmail,
                to: email,
                subject: 'Verificación de correo',
                html: data,
                priority: 'high'
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return Promise.reject(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    return Promise.resolve(info);
                }
            });
        }
    });

}
module.exports = { init };