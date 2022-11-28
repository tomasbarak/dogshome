const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');

//Route to get all publications
function init(app, firebaseApp, database){
    app.get('/api/alerts/all/', function (req, res) {

        console.log(logColor.debug, 'All alerts accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());

        const db =              database.getDatabase(firebaseApp);
        const recentPostsRef =  database.query(database.ref(db, 'Alerts/All'), database.limitToLast(50));
        const get =             database.get;

        get(recentPostsRef).then((snapshot) => {

            res.header('Access-Control-Allow-Origin', '*');
            res.status(200).send(snapshot.val());
            client.close()

        }).catch((error) => {

            res.status(500).send(error);
            client.close()

          });

    })
}

module.exports = {init};