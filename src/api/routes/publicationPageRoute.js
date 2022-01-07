const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, firebaseAdmin) {

    //Setting up index route
    app.get(['/', '/index', '/index.html'], (req, res) => {
        let token = String(req.cookies.token);
        if (token) {
            console.log(token);

            firebaseAdmin.auth().verifyIdToken(token).then((decodedIdToken) => {
                let parsedDisplayName = JSON.parse(decodedIdToken.name);
                res.render(appDir + '/public/index', {
                    uid: decodedIdToken.uid,
                    displayName: name.nameAndSurname.displayName,
                    name: name.nameAndSurname.name,
                    surname: name.nameAndSurname.surname,
                    photoUrl: name.picture,
                });
            }).catch((error) => {
                res.send(error);

            })
        } else {
            res.redirect('/signin');
        }

    });

    //Setting up login route
    app.get(['/signin.html', '/signin'], (req, res) => {
        res.render(appDir + '/public/signin',);
    });

}

module.exports = { init };