const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';

//Route to get account stats
function init(app){
    app.get('/api/user/:uid/stats/', function (req, res) {
        connectClient(mongoURL).then( (client) => {
            console.log(logColor.debug, 'ProfileStats accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());

            const userId =  req.params.uid;

            const mongoDB = client.db(mongoDBName);
            const collection = mongoDB.collection('Users');
            let requestQuery = { Id: userId };
            let requestProjection = { _id: 0 , "Stats": 1};

            getMany(collection, requestProjection, requestQuery).then((snapshot) => {
                data = snapshot[0]["Stats"] || {};
                res.header('Access-Control-Allow-Origin', '*');
                res.status(200).send(data);
            }).catch((error) => {

                res.status(500).send(error);

            });

        }).catch((error) => {
            console.log(logColor.error, error);
            res.status(500).send(error);
        });
    })
}

module.exports = {init};