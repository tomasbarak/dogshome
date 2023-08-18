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
    const mongoURL =    `mongodb://${process.env.DATABASE_HOST}:27017/dogshome`;
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
                                const usersCollection = mongoDB.collection('Users');

                                //Get user data
                                getOne(usersCollection, { _id: 0 }, { Id: refId }).then((user_snap) => {
                                    console.log(user_snap);
                                    let ObjectId = require('mongodb').ObjectId;
                                    const objectId = new ObjectId();
                                    const draftId = objectId.toString();
                                    //Basic draft structure
                                    let draft = {
                                                _id:        objectId,
                                                Id:         draftId,
                                                Step:       1,
                                                RefId:      refId,
                                                Refugio:    user_snap.RefName,
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
                                }).catch((err) => {
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
                                let newDraft =      Object.assign({}, draft);

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
                                            const raw_provincesArr = ['Ciudad de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucuman'];
                                            const provincesArr = [ "ciudad_de_buenos_aires", "buenos_aires", "catamarca", "chaco", "chubut", "cordoba", "corrientes", "entre_rios", "formosa", "jujuy", "la_pampa", "la_rioja", "mendoza", "misiones", "neuquen", "rio_negro", "salta", "san_juan", "san_luis", "santa_cruz", "santa_fe", "santiago_del_estero", "tierra_del_fuego", "tucuman" ];
                                            const province =        req.body.province;
                                            const department =      String(req.body.department).toLowerCase().replace(/ /g, '_');
                                            const provinceName_raw =    String(raw_provincesArr[province]);
                                            const provinceName =    String(provincesArr[province]).toLowerCase().replace(/ /g, '_');
                                            const departmentArr_raw = require(`../../../public/other/departments/${provinceName}.json`).departamentos.map((value) => {
                                                return value.nombre;
                                            });
                                            const departmentArr = departmentArr_raw.map((value) => {
                                                return value.toLowerCase().replace(/ /g, '_');
                                            })

                                            //Check if the draft province is NOT empty and if the draft department is NOT empty and if the draft department is in the 
                                            if(province.length > 0 && department.length > 0 && departmentArr.includes(department)){
                                                const department_index = departmentArr.indexOf(department);
                                                const department_raw = departmentArr_raw[department_index];
                                                newDraft["Province"] =  provinceName_raw;
                                                newDraft["Department"] = department_raw;
                                                newDraft["updatedAt"] = new Date();
                                                newDraft["Step"] =      4;
                                                continueUpdating()
                                                break;
                                            }else{
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }
                                            
                                        //Handle draft step 4 (Dog Photos)
                                        case 4:
                                            res.redirect(307, '/upload/draft/images/' + draftId);
                                            client.close();
                                            break;
                                        case 5:
                                            const breeds = require(appDir + '/public/other/breeds/breeds.json');

                                            const ageMonths = Number(req.body.filters.ageMonths);
                                            const ageYears = Number(req.body.filters.ageYears);
                                            const breed = req.body.filters.breed;
                                            const castrated = req.body.filters.castrated;
                                            const catFriendly = req.body.filters.catFriendly;
                                            const childFriendly = req.body.filters.childFriendly;
                                            const color = req.body.filters.color;
                                            const dewormed = req.body.filters.dewormed;
                                            const dogFriendly = req.body.filters.dogFriendly;
                                            const habits = req.body.filters.habits;
                                            const observations = req.body.filters.observations;
                                            const sex = req.body.filters.sex;
                                            const size = req.body.filters.size;
                                            const vaccinated = req.body.filters.vaccinated;
                                            const weight = req.body.filters.weight;

                                            console.log(ageMonths, ageYears, breed, castrated, catFriendly, childFriendly, color, dewormed, dogFriendly, habits, observations);

                                            if(ageMonths <= 11 && ageYears <= 25) {
                                                newDraft["Filters"] = {};
                                                newDraft["Filters"]["Age"] = {};
                                                newDraft["Filters"]["Age"]["Months"] = ageMonths;
                                                newDraft["Filters"]["Age"]["Years"] = ageYears;
                                            } else {
                                                console.log('Error in age');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(breeds.includes(breed)) {
                                                newDraft["Filters"]["Breed"] = breed;
                                            }else {
                                                console.log('Error in breed');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(castrated == 0 || castrated == 1) {
                                                newDraft["Filters"]["Castrated"] = !!castrated;
                                            }else {
                                                console.log('Error in castrated');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(catFriendly == 0 || catFriendly == 1 || catFriendly == 2) {
                                                newDraft["Filters"]["CatFriendly"] = [false, true, "No estoy seguro"][catFriendly];
                                            }else {
                                                console.log('Error in catFriendly');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(childFriendly == 0 || childFriendly == 1 || childFriendly == 2) {
                                                newDraft["Filters"]["KidsFriendly"] = [false, true, "No estoy seguro"][childFriendly];
                                            }else {
                                                console.log('Error in childFriendly');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(color == 0 || color == 1 || color == 2 || color == 3 || color == 4 || color == 5) {
                                                newDraft["Filters"]["Color"] = ["Blanco", "Gris", "Negro", "Marrón", "Colorado", "Mixto"][color];
                                            } else {
                                                console.log('Error in color');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(dewormed == 0 || dewormed == 1 || dewormed == 2) {
                                                newDraft["Filters"]["Dewormed"] = [false, true, "No estoy seguro"][dewormed];
                                            } else {
                                                console.log('Error in dewormed');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(dogFriendly == 0 || dogFriendly == 1 || dogFriendly == 2) {
                                                newDraft["Filters"]["DogFriendly"] = [false, true, "No estoy seguro"][dogFriendly];
                                            } else {
                                                console.log('Error in dogFriendly');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(habits.length <= 140 && habits.length >= 30) {
                                                newDraft["Filters"]["Habits"] = habits;
                                            } else {
                                                console.log('Error in habits');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(observations.length <= 140 && observations.length >= 30) {
                                                newDraft["Filters"]["Observations"] = observations;
                                            } else {
                                                console.log('Error in observations');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(sex == 0 || sex == 1) {
                                                newDraft["Filters"]["Sex"] = !!sex;
                                            } else {
                                                console.log('Error in sex');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(size == 0 || size == 1 || size == 2 || size == 3 || size == 4) { 
                                                newDraft["Filters"]["Size"] = ["Muy pequeño", "Pequeño", "Mediano", "Grande", "Muy grande"][size];
                                            } else {
                                                console.log('Error in size');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(vaccinated == 0 || vaccinated == 1 || vaccinated == 2 || vaccinated == 3) {
                                                newDraft["Filters"]["Vaccinated"] = ["No vacunado", "Vacunación incompleta", "Vacunación completa", "No estoy seguro"][vaccinated];
                                            } else {
                                                console.log('Error in vaccinated');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }

                                            if(weight < 100 && weight > 0) {
                                                newDraft["Filters"]["Weight"] = weight;
                                            } else {
                                                console.log('Error in weight');
                                                res.status(400).send({error: 'Error in your request'});
                                                client.close();
                                                return;
                                            }
                                            newDraft["updatedAt"] =     new Date();
                                            newDraft["Step"] =          6;

                                            continueUpdating();
                                            break;
                                        case 6:
                                            const publicationsCollection =  mongoDB.collection('Publications');
                                            insertOne(publicationsCollection, draft).then((result) => {
                                                newDraft["updatedAt"] =     new Date();
                                                newDraft["Step"] =          7;
                                                const usersCollection =     mongoDB.collection('Users');
                                                updateUsersPosts(refId, draftId, usersCollection).then((result) => {
                                                    continueUpdating();
                                                    return;
                                                }).catch((error) => {
                                                    res.status(500).send({error: 'Error in your request'});
                                                    client.close();
                                                    return;
                                                });
                                            }).catch((error) => {
                                                res.status(500).send({error: 'Error inserting publication'});
                                                client.close();
                                                return;
                                            });
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
                                let newDraft =      draft;
                                var filteredImages = req.body.images.filter(function(value, index, arr){ 
                                    return value !== 'image-1.jpeg';
                                });
                                const urlImagesArr = formatImagesToURL(filteredImages);
                                newDraft["updatedAt"] = new Date();
                                newDraft["Step"] =      step + 1;
                                newDraft["Images"] =    urlImagesArr;
                                newDraft["Photo"] =     `/profile/drafts/${draftId}/uploaded/image/1`
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
                                    console.log(imagesArr);
                                    let images = [];
                                    imagesArr.forEach( (image) => {
                                        images.push(`/profile/drafts/${draftId}/uploaded/image/${imagesArr.indexOf(image) + 2}`);
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

        const updateUsersPosts = (userId, postId, collection) => {
            return new Promise((resolve, reject) => {
                const requestProjection = { _id: 0 };
                const requestQuery = { Id: userId };
                const updateData = {$push: {PostsIds: postId}};
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