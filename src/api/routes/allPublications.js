const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');

//Route to get all publications
function init(app, firebaseApp, database){
    app.get('/publications/all/', function (req, res) {

        console.log(logColor.debug, 'AllPublications accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());

        const db =              database.getDatabase(firebaseApp);
        const dbRef =           database.ref(db);
        const recentPostsRef =  database.query(database.ref(db, 'Publications'), database.limitToLast(50));
        const userId =          req.params.uid;
        const child =           database.child;
        const get =             database.get;

        get(recentPostsRef).then((snapshot) => {

            res.header('Access-Control-Allow-Origin', '*');
            res.status(200).send(snapshot.val());

        }).catch((error) => {

            res.status(500).send(error);

          });

    })
}

module.exports = {init};