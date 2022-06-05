/*
 *   FILE USED TO HANDLE PUBLICATION DRAFT ROUTES
 */

    const { dirname } = require('path');
    const appDir =      dirname(require.main.filename);
    const { connectClient, 
        getMany,
        getOne, 
        getAllCollection,
        saveOne, 
        saveMany,
        deleteOne, 
        deleteMany, 
        sanitize, 
        insertOne } =   require(appDir + '/src/api/mongodbFunctions.js');
    const mongoURL =    'mongodb://localhost:27017/dogshome';
    const mongoDBName = 'dogshome';
    const {
        uploadImages,
        resizeImages,
        getResultImages,
    } = require(appDir + '/src/api/routes/image-upload-handling/imageUpload.js');

    //Init draft routes
    function init(app){
    
        //Method to check if the user has reached the max number of allowed drafts
        const checkMaxCreated = (collection, refId) => {
            const maxAllowed =          15;
            const requestProjection =   { _id: 0 };
            const requestQuery =        { RefId: refId };
    
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
    
        //Define draft creation routes
        app.post(['/create/publication/draft', '/create/publication/draft.html', '/crear/publicacion/borrador', '/crear/publicacion/borrador.html'], (req, res) => {
            const isPrivate =   res.locals.isPrivate;
            const isVerified =  res.locals.isVerified;
            
            //Check if user is NOT in private mode
            if(!isPrivate ){
    
                //Check if user e-mail is verified
                if(isVerified){
    
                    //Connect to mongodb client
                    connectClient(mongoURL).then( (client) => {
                        const mongoDB =     client.db(mongoDBName);
                        const collection =  mongoDB.collection('PublicationDrafts');
                        const user =        res.locals.user || {};
                        const refId =       user.user_id;
                        
                        checkMaxCreated(collection, refId).then((allowed) => {
                            //If user has not reached the max number of drafts go ahead
                            if(allowed){
                                let ObjectId = require('mongodb').ObjectId;
                                const objectId = new ObjectId();
                                const draftId = objectId.toString();

                                //Basic draft structure
                                let draft = {
                                            _id:        objectId,
                                            Id:         draftId,
                                            Step:       1,
                                            RefId:      refId,
                                            updatedAt:  new Date(),
                                            createdAt:  new Date(),
                                        }
    
                                //Insert basic draft into "PublicationDrafts" collection
                                insertOne(collection, draft).then( (result) => {
                                    res.send({
                                        success: true,
                                        id: draftId,
                                        redirectPath: `/crear/publicacion/${draftId}`
                                    });
                                    client.close();
                                }).catch((err) => {
                                    console.log(err);
                                    res.status(500).send({error: err, success: false});
                                    client.close();
                                });
                            }else{
                                //Send max drafts reached message
                                res.status(403).send({error: 'You have reached the maximum number of drafts allowed.'});
                                client.close();
                            }
                        }).catch((err) => {
                            //Max drafts check failed
                            console.log(err);
                            res.status(500).send({error: err, success: false});
                            client.close();
                        });
                        
                    }).catch((err) => {
                        //Mongodb client connection failed
                        console.log(err);
                        res.status(500).send({error: err});
                    });
                }else{
                    //Send user not verified message
                    res.status(403).send({error: 'You are not verified.'});
                }
            }else{
                //Send user in private mode message
                res.status(403).send({error: 'You are not allowed to create drafts.'});
            }
        });
    
        
        //Define draft edition routes
        app.post(['/update/publication/draft/:draftId/', '/actualizar/publicacion/borrador/:draftId/'], (req, res, next) => {
            const isPrivate =   res.locals.isPrivate;
            const isVerified =  res.locals.isVerified || false;
            const user =        res.locals.user || {};
            const draftId =     req.params.draftId || '';
            const refId =       user.user_id || '';
    
            //Check if user is NOT in private mode
            if(!isPrivate){
    
                //Check if user e-mail is verified
                if(isVerified){
    
                    //Connect to mongodb client
                    connectClient(mongoURL).then( (client) => {
                        const mongoDB =             client.db(mongoDBName);
                        const collection =          mongoDB.collection('PublicationDrafts');
                        const requestProjection =   { _id: 0 };
                        const requestQuery =        { Id: draftId, RefId: refId};
    
                        //Get required draft from "PublicationDrafts" collection
                        getMany(collection, requestProjection, requestQuery).then((snapshot) => {
    
                            //Check if draft exists
                            if(snapshot.length > 0 && snapshot[0].RefId === refId){
                                const draft =       snapshot[0];
                                let step =          draft.Step || 1;
                                const paramStep =   String(req.body.step);
                                let newDraft =      draft;
                                let filters =       draft.Filters || {};
    
                                //Check if the user is requesting to go back to the previous step
                                if(paramStep == "back"){
    
                                    //Check if the draft step is NOT the first one
                                    if(step > 1){
                                        newDraft["updatedAt"] = new Date();
                                        newDraft["Step"] =      step - 1;
    
                                        continueUpdating()
                                    }
                                
                                //Handle draft step update
                                }else{
                                    switch(step){
    
                                        //Handle draft step 1 (Dog Name)
                                        case 1:
                                            const name = req.body.name || '';
    
                                            //Check if the draft name is longer or equal to 2 characters
                                            if(name.length >= 2){
    
                                                //Update draft name if it is less than or equal to 24 characters
                                                if(name.length <= 24){
                                                    newDraft["Name"] =      String(name).toLowerCase();
                                                    newDraft["updatedAt"] = new Date();
                                                    newDraft["Step"] =      2;
                                                    
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
    
                                        //Handle draft step 2 (Dog Description)    
                                        case 2:
                                            const description = req.body.description || '';
    
                                            //Check if the draft description is NOT empty
                                            if(description.length > 0){
    
                                                //Update draft description if it is less than or equal to 140 characters
                                                if(description.length <= 140){
                                                    newDraft["SDescription"] =  String(description)[0].toUpperCase() + String(description).toLowerCase().slice(1);
                                                    newDraft["updatedAt"] =     new Date();
                                                    newDraft["Step"] =          3;
    
                                                    continueUpdating()
                                                    break;
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
    
                                        //Handle draft step 3 (Dog Location)
                                        case 3:
                                            const provincesArr =    ['Ciudad de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucuman']
                                            const province =        req.body.province;
                                            const provinceName =    provincesArr[province];
    
                                            //Check if the draft province is NOT empty
                                            if(province.length > 0){
                                                newDraft["Province"] =  provinceName;
                                                newDraft["updatedAt"] = new Date();
                                                newDraft["Step"] =      4;
    
                                                continueUpdating()
                                                break;
                                            }else{
                                                res.status(400).send({error: 'Province is required.'});
                                                client.close();
                                                return;
                                            }
                                            
                                        //Handle draft step 4 (Dog Photos)
                                        case 4:
                                            res.redirect(307, '/upload/draft/images/' + draftId);
                                            client.close();
                                            break;
                                    }
                                }
    
                                //Method to save previously updated draft
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

        app.post('/upload/draft/images/:draftId', uploadImages, resizeImages, getResultImages, (req, res, next) => {
            const isPrivate =   res.locals.isPrivate;
            const isVerified =  res.locals.isVerified || false;
            const user =        res.locals.user || {};
            const draftId =     req.params.draftId || '';
            const refId =       user.user_id || '';
    
            //Check if user is NOT in private mode
            if(!isPrivate){
    
                //Check if user e-mail is verified
                if(isVerified){
    
                    //Connect to mongodb client
                    connectClient(mongoURL).then( (client) => {
                        const mongoDB =             client.db(mongoDBName);
                        const collection =          mongoDB.collection('PublicationDrafts');
                        const requestProjection =   { _id: 0 };
                        const requestQuery =        { Id: draftId, RefId: refId};
    
                        //Get required draft from "PublicationDrafts" collection
                        getMany(collection, requestProjection, requestQuery).then((snapshot) => {
    
                            //Check if draft exists
                            if(snapshot.length > 0 && snapshot[0].RefId === refId){
                                const draft =       snapshot[0];
                                let step =          draft.Step || 1;
                                const paramStep =   String(req.body.step);
                                let newDraft =      draft;
                                let filters =       draft.Filters || {};
                                var filteredImages = req.body.images.filter(function(value, index, arr){ 
                                    return value !== 'image-1.jpeg';
                                });
                                const urlImagesArr = formatImagesToURL(filteredImages);
                                newDraft["updatedAt"] = new Date();
                                newDraft["Step"] =      step + 1;
                                newDraft["Images"] =    urlImagesArr;
                                newDraft["Photo"] =     `https://dogshome.com.ar/profile/drafts/${draftId}/uploaded/image/1`
                                continueUpdating();
                                //Method to save previously updated draft
                                function continueUpdating(){
                                    updateDraft(draftId, step, collection, newDraft, {refId: refId}).then( (result) => {
                                        res.send({ success: true, redirectPath: `/crear/publicacion/${draftId}` });
                                        client.close();
                                    }).catch( (err) => {
                                        console.log(err);
                                        client.close();
                                    });
                                }

                                function formatImagesToURL(imagesArr){
                                    let images = [];
                                    imagesArr.forEach( (image) => {
                                        images.push(`https://dogshome.com.ar/profile/drafts/${draftId}/uploaded/image/${imagesArr.indexOf(image)}`);
                                    });
                                    return images;
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