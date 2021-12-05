function init(app, firebaseAdmin){
    app.get('/user/:uid/photourl/', function(req, res){
        let token = req.headers.authtoken;

        firebaseAdmin.auth().verifyIdToken(token).then((decodedIdToken) => {
          console.log('Photo url accessed by', req.headers['x-forwarded-for'] || req.socket.remoteAddress);
          res.header('Access-Control-Allow-Origin', '*');
          let PhotoURL = decodedIdToken.picture;
          res.status(200).send(PhotoURL);
        });

    })
    
}
module.exports = {init};