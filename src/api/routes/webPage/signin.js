const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, firebaseAdmin) {
    //Setting up login route
    app.get(['/signin.html', '/signin'], (req, res) => {
        const token = req.cookies.session || ' ';
        
        if(token){
            firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
                if(decodedIdToken.email_verified){
                    res.redirect('/');
                }else{
                    res.redirect('/verification');
                }
            }).catch((error) => {
                res.render(appDir + '/public/signin');
            });
        }else{
            res.render(appDir + '/public/signin',);
        }
    });
}

module.exports = { init };