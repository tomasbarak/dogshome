const { dirname } = require('path');
const appDir = dirname(require.main.filename);

function init(app, firebaseAdmin) {
    //Setting up login route
    app.get(['/signin.html', '/signin', '/login', '/login.html'], (req, res) => {
        const token = req.cookies.session || ' ';
        
        if(token){
            firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
                if(decodedIdToken.email_verified){
                    res.redirect('/');
                }else{
                    res.redirect('/verification');
                }
            }).catch((error) => {
                res.render(appDir + '/src/components/signin');
            });
        }else{
            res.render(appDir + '/src/components/signin',);
        }
    });
}

module.exports = { init };