
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

const getAllCollection = (collection, projection = {}) => {
    return new Promise((resolve, reject) => {
        collection.find({}).project(projection).toArray((err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

const saveOne = (collection, filter=update, update) => {
    return new Promise((resolve, reject) => {
        collection.updateOne(filter, {$set: update}, {upsert: true}, (err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });    
}

const saveMany = (collection, filter=update, update, options = {upsert: true}) => {
    return new Promise((resolve, reject) => {
        collection.updateMany(filter, update, options, (err, result) => {
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

const sanitize = (data) => {
    let sanitized = '';
    data = String(data);
    const mongoIllegalChars = ['', '#', '$', '[', ']']
    for(let i = 0; i < data.length; i++){
        if(mongoIllegalChars.indexOf(data[i]) !== -1){
            sanitized += '_';
        }else{
            sanitized += data[i];
        }
    }
    return String(sanitized);
}
module.exports = { connectClient, getMany, getOne, getAllCollection, saveOne, saveMany, deleteOne, deleteMany, sanitize };