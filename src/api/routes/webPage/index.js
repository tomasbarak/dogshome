const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, firebaseAdmin, firebaseApp, database) {
    //Setting up index route
    app.get(['/', '/index', '/index.html'], (req, res) => {
        const token = req.cookies.session || ' ';
        if (token) {
            firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */)
                .then((decodedIdToken) => {
                    if (decodedIdToken.email_verified) {
                        let parsedDisplayName = JSON.parse(decodedIdToken.name);
                        const db = database.getDatabase(firebaseApp);
                        const recentPostsRef = database.query(database.ref(db, 'Publications/All'), database.limitToLast(50));
                        const get = database.get;

                        get(recentPostsRef).then((snapshot) => {
                            var json_data = snapshot.val();
                            var result = [];

                            for (var i in json_data) {
                                result.push([json_data[i]]);
                            }
                            res.render(appDir + '/public/index', {
                                uid: decodedIdToken.user_id,
                                displayName: parsedDisplayName.nameAndSurname.displayName,
                                name: parsedDisplayName.nameAndSurname.name,
                                surname: parsedDisplayName.nameAndSurname.surname,
                                photoUrl: decodedIdToken.picture,
                                publications: result
                            });
                        }).catch((error) => {
                            res.status(500).send(error);
                        });

                    }else{
                        res.redirect('/verification');
                    }

                }).catch((error) => {
                    res.redirect('/signin');
                });
        } else {
            res.redirect('/signin');
        }

    });
}

module.exports = { init };