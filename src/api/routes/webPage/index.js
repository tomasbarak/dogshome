const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, firebaseAdmin, firebaseApp, database) {
    //Setting up index route
    app.get(['/', '/index', '/index.html', '/inicio'], (req, res) => {
        const token = req.cookies.session || ' ';

        const db = database.getDatabase(firebaseApp);
        const recentPostsRef = database.query(database.ref(db, 'Publications/All'), database.limitToLast(50));
        const get = database.get;

        get(recentPostsRef).then((snapshot) => {
            var json_data = snapshot.val();
            var result = [];

            for (var i in json_data) {
                result.push([json_data[i]]);
            }

            firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
                if (decodedIdToken.email_verified) {
                    let parsedDisplayName = JSON.parse(decodedIdToken.name);
                    res.render(appDir + '/public/index', {
                        uid: decodedIdToken.user_id,
                        displayName: parsedDisplayName.nameAndSurname.displayName,
                        name: parsedDisplayName.nameAndSurname.name,
                        surname: parsedDisplayName.nameAndSurname.surname,
                        photoUrl: decodedIdToken.picture,
                        publications: result,
                        isPrivate: false
                    });
                } else {
                    res.redirect('/verification');
                }
            }).catch((error) => {
                res.render(appDir + '/public/index', {
                    uid: '',
                    displayName: 'Cuenta Privada',
                    name: 'Cuenta',
                    surname: 'Privada',
                    photoUrl: 'https://dogshome.com.ar/profile/image/uploaded/default-private-user-image.png',
                    publications: result,
                    isPrivate: true
                });
            });

        }).catch((error) => {
            res.status(500).send(error);
        });

    });
}

module.exports = { init };