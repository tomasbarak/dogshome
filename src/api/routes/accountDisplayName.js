function init(app, firebaseAdmin){
    app.get('/user/:uid/displayName/', function(req, res){
        let token = req.headers.authtoken;

        firebaseAdmin.auth().verifyIdToken(token).then((decodedIdToken) => {
          res.header('Access-Control-Allow-Origin', '*');
          let JSONDisplayName = JSON.parse(decodedIdToken.name)
          console.log(JSONDisplayName);
          res.status(200).send(JSONDisplayName);
        });

    })
    
}
module.exports = {init};