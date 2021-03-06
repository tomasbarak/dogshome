const { dirname } = require('path');
const appDir = dirname(require.main.filename);

function init(app, firebaseAdmin) {
    app.post('/sessionLogin', (req, res) => {
        res.header('Access-Control-Allow-Origin', '*');
        // Get the ID token passed and the CSRF token.
        const idToken = req.body.idToken;
        // Set session expiration to 15 days.
        const expiresIn = 60 * 60 * 24 * 14 * 1000;
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
                    res.redirect('/');
                },
                (error) => {
                    res.status(401).send(error);
                }
            );
    });
    app.post('/sessionLogout', (req, res) => {
        res.header('Access-Control-Allow-Origin', '*');
        // Delete the session cookie.
        const user = res.locals.user;
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified;
        if(!isPrivate){
            res.clearCookie('session');
            firebaseAdmin.auth().revokeRefreshTokens(user.uid).then(() => {
                res.send('Logged out');
            }).catch((error) => {
                console.log(error)
                res.status(500).send(error);
            });
        }else{
            res.status(200).send('Logged out');
        }
        
    })
}

module.exports = { init };