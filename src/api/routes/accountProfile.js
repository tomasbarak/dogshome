const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';
//Route to get account profile
function init(app){
    app.get('/api/user/:uid/profile/', function (req, res) {
        connectClient(mongoURL).then( (client) => {
            console.log(logColor.debug, 'ProfileInfo accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());

            const userId = req.params.uid;
            mongoDB = client.db(mongoDBName);
            const collection = mongoDB.collection('Users');
            let requestQuery = { Id: userId };
            let requestProjection = { _id: 0 };

            getMany(collection, requestProjection, requestQuery).then((snapshot) => {
                data = snapshot[0] || {};

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

        }).catch((error) => {
            console.log(logColor.error, error);
            res.status(500).send(error);
        });
    })    
}

module.exports = {init};