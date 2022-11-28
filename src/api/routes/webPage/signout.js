const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app) {
    app.post(['/signout', '/signout.html'], (req, res) => {
        res.clearCookie('session');
        res.redirect('/signin');
    });
}

module.exports = { init };