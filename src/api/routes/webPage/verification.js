const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, firebaseAdmin) {
    //Setting up login route
    app.get(['/verification.html', '/verification'], (req, res) => {
        const isPrivate =       res.locals.isPrivate;
        const isVerified =      res.locals.isVerified;
        
        if (!isPrivate){
            if(isVerified){
                res.redirect('/');
            }else{
                res.render(appDir + '/public/verification');
            }
        }else{
            res.redirect('/signin');
        }
    });
}

module.exports = { init };