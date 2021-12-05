function init(app, firebaseAdmin){
    app.get('/user/:uid/photourl/', function(req, res){
        let token = req.headers.authtoken;

        firebaseAdmin.auth().verifyIdToken(token).then((decodedIdToken) => {
          res.header('Access-Control-Allow-Origin', '*');
          let PhotoURL = decodedIdToken.picture;
          console.log(PhotoURL);
          res.status(200).send(PhotoURL);
        });

    })
    
}
module.exports = {init};