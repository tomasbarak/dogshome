const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');

const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';

//Route to get all publications
function init(app){
    app.get(['/api/publications/:id/'], function (req, res) {
        connectClient(mongoURL).then((client) => {     
            const pubId =       req.params.id;

            const mongoDB =     client.db(mongoDBName);
            const collection =  mongoDB.collection('Publications');
            let requestQuery =  { Id: pubId };
            let requestProjection = { _id: 0 };
            
            getMany(collection, requestProjection, requestQuery).then((snapshot) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.status(200).send(snapshot[0]);
                client.close()

            }).catch((error) => {
                res.status(500).send(error);
                client.close()

            });

        })
    })
}

module.exports = {init};