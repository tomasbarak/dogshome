function init(app, firebaseAdmin){
    app.get('/user/:uid/displayName/', function(req, res){
        let token = req.headers.authtoken;
        console.log('DisplayName accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());

        firebaseAdmin.auth().verifyIdToken(token).then((decodedIdToken) => {
          res.header('Access-Control-Allow-Origin', '*');
          let JSONDisplayName = JSON.parse(decodedIdToken.name)
          res.status(200).send(JSONDisplayName);
        });

    })
    
}
module.exports = {init};