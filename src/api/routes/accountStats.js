//Route to get account stats
function init(app, firebaseApp, database){
    app.get('/user/:uid/stats/', function (req, res) {
        
        const db =     database.getDatabase(firebaseApp);
        const dbRef =  database.ref(db);
        const userId = req.params.uid;
        const child = database.child;
        const get = database.get;

        get(child(dbRef, `Users/${userId}/PublicWrite/stats`)).then((snapshot) => {
            console.log(req.headers);
            res.status(200).send(snapshot.val());

        }).catch((error) => {

            res.status(500).send(error);

          });

    })
}

module.exports = {init};