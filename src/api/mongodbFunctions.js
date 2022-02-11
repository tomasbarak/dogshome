
var MongoClient = require('mongodb').MongoClient;

const connectClient = (url) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, client) => {
            if(err){
                reject(err);
            }else{
                resolve(client);
            }
        });
    });
}

const getMany = (collection, projection = {}, query = {}) =>{
    console.log(query);
    console.log(projection);
    return new Promise((resolve, reject) => {
        collection.find(query).project(projection).toArray((err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

const getOne = (collection, projection = {}, query = {}) => {
    return new Promise((resolve, reject) => {
        
        collection.findOne(query, projection, (err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

const getAllCollection = (collection) => {
    return new Promise((resolve, reject) => {
        collection.find({}).toArray((err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

const saveOne = (collection, dataToSave) => {
    return new Promise((resolve, reject) => {
        collection.updateOne(dataToSave, {$set: dataToSave}, {upsert: true}, (err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });    
}

const saveMany = (collection, dataToSave) => {
    return new Promise((resolve, reject) => {
        collection.updateMany(dataToSave, {$set: dataToSave}, {upsert: true}, (err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

const deleteOne = (collection, query) => {
    return new Promise((resolve, reject) => {
        collection.deleteOne(query, (err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

const deleteMany = (collection, query) => {
    return new Promise((resolve, reject) => {
        collection.deleteMany(query, (err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

module.exports = { connectClient, getMany, getOne, getAllCollection, saveOne, saveMany, deleteOne, deleteMany };