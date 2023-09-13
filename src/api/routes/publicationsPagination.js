const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');
const { connectClient, getManyWithLimit} = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = `mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/dogshome`;
const mongoDBName = 'dogshome';

function init(app){
    app.get('/api/publications/page/:page_number', function (req, res) {
        connectClient(mongoURL).then((client) => {
            const mongoDB =         client.db(mongoDBName);
            const collection =      mongoDB.collection('Publications');
            let projection =        { _id: 0 };
            const skip =            (req.params.page_number - 1) * 28;

            getManyWithLimit(collection, projection, {}, 28, skip).then((snapshot) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.status(200).send(snapshot);
                client.close()

            }).catch((error) => {
                res.status(500).send(error);
                client.close()

            });

        }).catch((error) => {
            console.log(logColor.error, error);
            res.status(500).send(error);
        });
    })

    app.get('/api/publications/hasPage/:page_number', function (req, res) {
        connectClient(mongoURL).then((client) => {
            const mongoDB =         client.db(mongoDBName);
            const collection =      mongoDB.collection('Publications');
            let projection =        { _id: 0 };
            const skip =            (req.params.page_number - 1) * 28;

            getManyWithLimit(collection, projection, {}, 28, skip).then((snapshot) => {
                res.header('Access-Control-Allow-Origin', '*');
                if (snapshot.length > 0) {
                    res.status(200).send(true);
                } else {
                    res.status(200).send(false);
                }
                client.close()
            }).catch((error) => {
                res.status(500).send(error);
                client.close()

            });

        }).catch((error) => {
            console.log(logColor.error, error);
            res.status(500).send(error);
        });
    })
}

module.exports = {init};