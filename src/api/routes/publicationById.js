//Route to get all publications
function init(app, firebaseApp, database){
    app.get('/publications/:state/:id/', function (req, res) {
        console.log('ProfileStats accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());
        const db =     database.getDatabase(firebaseApp);
        const dbRef =  database.ref(db);
        const pubId = req.params.id;
        const pubState = req.params.state;
        const child = database.child;
        const get = database.get;

        get(child(dbRef, `Publications/${pubState}/${pubId}/`)).then((snapshot) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.status(200).send(snapshot.val());

        }).catch((error) => {

            res.status(500).send(error);

          });

    })
}

module.exports = {init};