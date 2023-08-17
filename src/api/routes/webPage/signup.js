const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, firebaseAdmin) {
    //Setting up login route
    app.get(['/signup.html', '/signup', '/register', '/register.html'], (req, res) => {
        const token = req.cookies.session || ' ';
        
        if(token){
            firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
                if(decodedIdToken.email_verified){
                    res.redirect('/');
                }else{
                    res.redirect('/verification');
                }
            }).catch((error) => {
                res.render(appDir + '/src/components/signup');
            });
        }else{
            res.render(appDir + '/src/components/signup',);
        }
    });
}

module.exports = { init };