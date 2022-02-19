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

}

module.exports = {init};