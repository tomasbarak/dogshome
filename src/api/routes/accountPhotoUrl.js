const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');

function init(app, firebaseAdmin){
    app.get('/user/:uid/photourl/', function(req, res){
        let token = req.headers.authtoken;

        console.log(logColor.debug, 'PhotoURL accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());

        firebaseAdmin.auth().verifyIdToken(token).then((decodedIdToken) => {
          res.header('Access-Control-Allow-Origin', '*');
          let PhotoURL = decodedIdToken.picture;
          res.status(200).send(PhotoURL);
        });

    })
    
}
module.exports = {init};