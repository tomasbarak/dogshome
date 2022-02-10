var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const dbName = 'dogshome';

const connectClient = () => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                reject(err);
            }else{
                resolve(db);
            };
        });
    })
    
}

const checkCollection = (db, collectionName) => {
    return new Promise((resolve, reject) => {
        db.listCollections({name: collectionName}).next((err, collinfo) => {
            if(collinfo) resolve(collinfo);
            else reject(err);
        })
    })
};

const deleteCollection = (db, collectionName) => {
    return new Promise((resolve, reject) => {
        db.dropCollection(collectionName, (err, res) => {
            if (err) {
                reject(err);
            }else{
                resolve(res);
            }
        });
    })
}

const insertOne = (db, collectionName, data) => {
    return new Promise((resolve, reject) => {
        db.collection(collectionName).updateOne(data, {$set: data}, { upsert: true}, (err, res) => {
            if (err) {
                reject(err);
            }else{
                resolve(res);
            }
        });
    })
}

module.exports = { connectClient, checkCollection, deleteCollection, insertOne };