const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');

function init(app, firebaseAdmin){
    app.get('/user/:uid/verify/', function(req, res){
        let token = String(req.headers.authtoken);

        firebaseAdmin.auth().verifyIdToken(token).then((decodedIdToken) => {
          res.header('Access-Control-Allow-Origin', '*');
          let JSONDisplayName = JSON.parse(decodedIdToken.name)
          res.status(200).send(JSONDisplayName);
        }).catch((error) => {
            res.status(401).send({error: `Cant verify token: ${req.headers.authtoken}`});
        });

    })
    
}
module.exports = {init};