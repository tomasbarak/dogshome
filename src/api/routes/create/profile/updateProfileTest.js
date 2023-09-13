const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require('/home/tomas/Desktop/dogshome-api/src/api/mongodbFunctions.js');
const mongoURL = `mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/dogshome`;
const mongoDBName = 'dogshome';

connectClient(mongoURL).then(client => {
    const mongoDB = client.db(mongoDBName);
    const collection = mongoDB.collection('Users');
    let requestQuery = {"PublicRead.Id": "yfrd2f611ZNqKHmK174J4IlT3ow2"  };
    saveMany(collection, requestQuery, {"PublicRead.Phone": "1165413202"}).then((snapshot) => {
        client.close();
    }).catch((err) => {
        console.log(err)
    })
}).catch((error) => {

})