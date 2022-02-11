//Read json from file
const fs = require('fs');
const path = require('path');

function readJson(filePath) {
    const file = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(file);
}


//Save dataToSave to mongodb database
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';

const connectClient = (url) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                reject(err);
            } else {
                resolve(client);
            }
        });
    })
}

const saveData = (collection, dataToSave) => {
    return new Promise((resolve, reject) => {
        collection.updateOne(dataToSave, {$set: dataToSave}, {upsert: true}, (err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        } )
    })
}

const getAllCollection = (collection) => {
    return new Promise((resolve, reject) => {
        resolve(collection.find({}).project({_id: 0}).toArray());
    });
}
connectClient(url).then((client) => {
    const dataToSave = readJson('./dogshome-6af88-default-rtdb-export.json');

    const db = client.db('dogshome');
    const PublicationsCollection = db.collection('Publications');
    const UsersCollection = db.collection('Users');
    const AlertsCollection = db.collection('Alerts');

    const PublicationsData = dataToSave.Publications || {};
    const UsersData = dataToSave.Users || {};
    const AlertsData = dataToSave.Alerts || {};
    
    saveData(PublicationsCollection, PublicationsData).then((result) => {
        saveData(UsersCollection, UsersData).then((result) => {
            saveData(AlertsCollection, AlertsData).then((result) => {
                getAllCollection(PublicationsCollection).then((result) => {
                    console.log(result);
                    getAllCollection(UsersCollection).then((result) => {
                        console.log(result);
                        getAllCollection(AlertsCollection).then((result) => {
                            console.log(result);
                            client.close();
                        }).catch((err) => {
                            console.log(err);
                            client.close();
                        });
                    }).catch((err) => {
                        console.log(err);
                        client.close();
                    });
                }).catch((err) => {
                    console.log(err);
                    client.close();
                });
            }).catch((error) => {
                console.log(error);
                client.close();
            });
        }).catch((error) => {
            console.log(error);
            client.close();
        });
    }).catch((error) => {
        console.log(error);
        client.close();
    });

}).catch((error) => {
    console.log(error);
});
