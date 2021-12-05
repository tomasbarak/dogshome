//Route to get account profile
function init(app, firebaseApp, database){
    app.get('/user/:uid/profile/', function (req, res) {
        const db =     database.getDatabase(firebaseApp);
        const dbRef =  database.ref(db);
        const userId = req.params.uid;
        const child = database.child;
        const get = database.get;

        get(child(dbRef, `Users/${userId}/PublicRead`)).then((snapshot) => {
            data = snapshot.val();

            if(data === null){
                res.status(404).send({
                    message: 'User not found'
                });
            }else{
                res.status(200).send(data);
            }

        }).catch((error) => {

            res.status(500).send(error);

          });

    })
}

module.exports = {init};