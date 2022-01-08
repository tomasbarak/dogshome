const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const axios =           require('axios');

function init(app, firebaseAdmin, firebaseApp, database) {
    //Setting up index route
    app.get(['/', '/index', '/index.html'], (req, res) => {
        const token = req.cookies.session || ' ';
        if (token) {
            firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */)
                .then((decodedIdToken) => {

                    let parsedDisplayName = JSON.parse(decodedIdToken.name);
                    const db =              database.getDatabase(firebaseApp);
                    const recentPostsRef =  database.query(database.ref(db, 'Publications/All'), database.limitToLast(50));
                    const get =             database.get;

                    get(recentPostsRef).then((snapshot) => {
                        var json_data =     snapshot.val();
                        var result =        [];

                        for (var i in json_data){
                            result.push([json_data[i]]);
                        }
                        res.render(appDir + '/public/index', {
                            uid:            decodedIdToken.user_id,
                            displayName:    parsedDisplayName.nameAndSurname.displayName,
                            name:           parsedDisplayName.nameAndSurname.name,
                            surname:        parsedDisplayName.nameAndSurname.surname,
                            photoUrl:       decodedIdToken.picture,
                            publications:   result
                        });
                    }).catch((error) => {
                        res.status(500).send(error);
                    });

                }).catch((error) => {
                    res.status(401).send(error)
                });
        } else {
            res.redirect('/signin');
        }

    });

    //Setting up login route
    app.get(['/signin.html', '/signin'], (req, res) => {
        res.render(appDir + '/public/signin',);
    });

    app.post('/sessionLogin', (req, res) => {
        res.header('Access-Control-Allow-Origin', '*');
        // Get the ID token passed and the CSRF token.
        const idToken = req.body.idToken;
        console.log(idToken);
        // Set session expiration to 5 days.
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        // Create the session cookie. This will also verify the ID token in the process.
        // The session cookie will have the same claims as the ID token.
        // To only allow session cookie setting on recent sign-in, auth_time in ID token
        // can be checked to ensure user was recently signed in before creating a session cookie.
        firebaseAdmin.auth()
            .createSessionCookie(idToken, { expiresIn })
            .then(
                (sessionCookie) => {
                    // Set cookie policy for session cookie.
                    const options = { maxAge: expiresIn, httpOnly: true, Secure: true, SameSite: 'None' };
                    res.cookie('session', sessionCookie, options);
                    res.end(JSON.stringify({ status: 'success' }));
                },
                (error) => {
                    res.status(401).send(error);
                }
            );
    });
}

module.exports = { init };