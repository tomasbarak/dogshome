const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize, insertOne } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';

function init(app){
    const checkMaxCreated = (collection, refId) => {
        const maxAllowed = 15;
        const requestProjection = { _id: 0 };
        const requestQuery = { RefId: refId };
        return new Promise((resolve, reject) => {
            getMany(collection, requestProjection, requestQuery).then((snapshot) => {
                const result = snapshot || [];
                if (result.length >= maxAllowed) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
    app.post(['/create/publication/draft', '/create/publication/draft.html', '/crear/publicacion/borrador', '/crear/publicacion/borrador.html'], (req, res) => {
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified;
        
        if(!isPrivate ){
            if(isVerified){
                connectClient(mongoURL).then( (client) => {
                    const mongoDB = client.db(mongoDBName);
                    const collection = mongoDB.collection('PublicationDrafts');
                    const user = res.locals.user || {};
                    const refId = user.user_id;
                    checkMaxCreated(collection, refId).then((allowed) => {
                        if(allowed){
                        let ObjectId = require('mongodb').ObjectId;
                        const objectId = new ObjectId();
                        const draftId = objectId.toString();
                        
                        let draft = {
                                    _id: objectId,
                                    Id: draftId,
                                    Step: 1,
                                    RefId: refId,
                                    updatedAt: new Date(),
                                    createdAt: new Date(),
                                }
                        insertOne(collection, draft).then( (result) => {
                            res.send({
                                success: true,
                                id: draftId,
                                redirectPath: `/crear/publicacion/${draftId}`
                            });
                        }).catch( (err) => {
                            console.log(err);
                            res.status(500).send({error: err, success: false});
                        });
                        }else{
                            res.status(403).send({error: 'You have reached the maximum number of drafts allowed.'});
                        }
                    }).catch((err) => {
                        console.log(err);
                    });
                    
                }).catch( (err) => {
                    console.log(err);
                    res.status(500).send({error: err});
                });
            }else{
                res.status(403).send({error: 'You are not verified.'});
            }
        }else{
            res.status(403).send({error: 'You are not allowed to create drafts.'});
        }
    });

    

    app.post(['/update/publication/draft/:draftId/', '/actualizar/publicacion/borrador/:draftId/'], (req, res) => {
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified || false;
        const user = res.locals.user || {};
        const draftId = req.params.draftId || '';
        const refId = user.user_id || '';
        if(!isPrivate){
            if(isVerified){
                connectClient(mongoURL).then( (client) => {
                    const mongoDB = client.db(mongoDBName);
                    const collection = mongoDB.collection('PublicationDrafts');
                    const requestProjection = { _id: 0 };
                    const requestQuery = { Id: draftId, RefId: refId};

                    getMany(collection, requestProjection, requestQuery).then((snapshot) => {
                        if(snapshot.length > 0 && snapshot[0].RefId === refId){
                            const draft = snapshot[0];
                            let step = draft.Step || 1;
                            const paramStep = String(req.body.step);
                            let newDraft = draft;
                            let filters = draft.Filters || {};
                            if(paramStep == "back"){
                                if(step > 1){
                                    newDraft["updatedAt"] = new Date();
                                    newDraft["Step"] = step - 1;
                                    continueUpdating()
                                }
                            }else{
                                switch(step){
                                    case 1:
                                        const name = req.body.name || '';
                                        if(name.length > 2){
                                            if(name.length <= 24){
                                                newDraft["Name"] = String(name).toLowerCase();
                                                newDraft["updatedAt"] = new Date();
                                                newDraft["Step"] = 2;
                                                continueUpdating()
                                                break;
                                            }else{
                                                res.status(403).send({error: 'Name must be less than 24 characters.'});
                                                client.close();
                                                return;
                                            }
                                            
                                        }else{
                                            res.status(400).send({error: 'Name is required.'});
                                            client.close();
                                            return;
                                        }
                                    case 2:
                                        const description = req.body.description || '';
                                        if(description.length > 0){
                                            if(description.length <= 140){
                                                newDraft["SDescription"] = String(description)[0].toUpperCase() + String(description).toLowerCase().slice(1);
                                                newDraft["updatedAt"] = new Date();
                                                newDraft["Step"] = 3;
                                            }else{
                                                res.status(403).send({error: 'The description is too long.'});
                                                client.close();
                                                return;
                                            }
                                        }else{
                                            res.status(400).send({error: 'Description is required.'});
                                            client.close();
                                            return;
                                        }
                                        continueUpdating()
                                        break;
                                    case 3:
                                        const provincesArr = ['Ciudad de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucuman']
                                        const province = req.body.province;

                                        const provinceName = provincesArr[province];

                                        if(province.length > 0){
                                            newDraft["Province"] = provinceName;
                                            newDraft["updatedAt"] = new Date();
                                            newDraft["Step"] = 4;
                                        }else{
                                            res.status(400).send({error: 'Province is required.'});
                                            client.close();
                                            return;
                                        }
                                        continueUpdating()
                                        break;
                                    case 4:
                                        const helpers = require('./helpers');
                                        const multer = require('multer');
                                        const path = require('path');
                                        const storage = multer.diskStorage({
                                            destination: function(req, file, cb) {
                                                const fs = require('fs')
                                                const savingPath = `uploads/drafts/${draftId}`
                                                fs.mkdirSync(savingPath, { recursive: true })
                                                cb(null, savingPath);
                                            },
                                        
                                            filename: function(req, file, cb) {
                                                cb(null, `image-${req.files.length}.jpg`);
                                            }
                                        });
                                        let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('files');

                                        upload(req, res, function(err) {

                                            if(err){
                                                res.status(500).send(err);
                                                return;
                                            }else{
                                                newDraft["updatedAt"] = new Date();
                                                newDraft["Step"] = 5;
                                                continueUpdating()
                                            }
                                        });
                                        break;
                                }
                            }
                            function continueUpdating(){
                                updateDraft(draftId, step, collection, newDraft, {refId: refId}).then( (result) => {
                                    res.send({ success: true, redirectPath: `/crear/publicacion/${draftId}` });
                                    client.close();
                                }).catch( (err) => {
                                    console.log(err);
                                    client.close();
                                });
                            }
                            
                        }else{
                            res.status(403).send({error: 'You are not allowed to edit this draft.'});
                            client.close();
                        }

                    }).catch((err) => {
                        console.log(err);
                        res.status(500).send({error: err});
                        client.close();
                    });
                }).catch( (err) => {
                    console.log(err);
                    res.status(500).send({error: err});
            
                });
            }else{
                res.status(403).send({error: 'You are not verified.'});
            }
        }else{
            res.status(403).send({error: 'You are not allowed to update drafts.'});
        }
    });

    const updateDraft = (draftId, actualStep, collection, draft, data = {}) => {
        return new Promise((resolve, reject) => {
            const requestProjection = { _id: 0 };
            const requestQuery = { Id: draftId, RefId: data.refId};
            const updateData = {$set: draft};
            saveMany(collection, requestQuery, updateData).then( (result) => {
                resolve(result);
            }).catch( (err) => {
                console.log(err);
                reject(err);
            });
                
        });
    }

}

module.exports = {init};