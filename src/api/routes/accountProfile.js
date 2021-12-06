const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');

//Route to get account profile
function init(app, firebaseApp, database){
    app.get('/user/:uid/profile/', function (req, res) {

        console.log(logColor.debug, 'ProfileInfo accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());

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