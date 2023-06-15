const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const { connectClient, 
        getMany,
        getOne, 
        getAllCollection,
        saveOne, 
        saveMany,
        deleteOne, 
        deleteMany, 
        sanitize } =    require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL =        `mongodb://${process.env.DATABASE_HOST}:27017/dogshome`;
const mongoDBName =     'dogshome';

function init(app, firebaseAdmin) {
    app.get(['/publicacion/:id', '/publicacion.html/:id'], (req, res) => {
        const token = req.cookies.session || ' ';
        const pubId = sanitize(req.params.id);

        connectClient(mongoURL).then(client => {
            const mongoDB = client.db(mongoDBName);
            const collection = mongoDB.collection('Publications');
            let requestProjection = { _id: 0 };
            let requestQuery = { Id: pubId };

            getMany(collection, requestProjection, requestQuery).then((snapshot) => {
                let snapshotVal = snapshot[0] || {};
                const pubSecImages = snapshotVal.Images || [];
                const pubPhoto = snapshotVal.Photo || ' ';
                const filters = snapshotVal.Filters || {};
                const refId = sanitize(snapshotVal.RefId || ' ');
                const age = filters.Age || {};
                let allPhotosArray = [];
                let secPhotosArray = [];
                if (Object.keys(snapshotVal).length === 0) {
                    res.status(404);
                    res.render(appDir + '/public/404', {
                        errorCode: "404",
                        errorMessage: "Publicación no encontrada",
                    });
                    client.close();
                    return;
                }

                allPhotosArray.push(pubPhoto);

                for (let key in pubSecImages) {
                    allPhotosArray.push(pubSecImages[key]);
                    secPhotosArray.push(pubSecImages[key]);
                }
                const usersCollection = mongoDB.collection('Users');
                requestProjection = { _id: 0, PostsIds: 1 };
                requestQuery = { Id: String(refId) };
                getMany(usersCollection, requestProjection, requestQuery).then((snapshot) => {
                    snapshot = snapshot[0] || {};

                    const publications = snapshot.PostsIds || [];
                    let result = [];

                    requestProjection = { _id: 0 };
                    requestQuery = { Id: { $in: publications } };

                    firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
                        const favorites_collection = mongoDB.collection('Favorites');
                        const favorites_requestProjection = { _id: 0 };
                        const favorites_requestQuery = { user_id: decodedIdToken.uid, publication_id: pubId };

                        getOne(favorites_collection, favorites_requestProjection, favorites_requestQuery).then((favorite) => {
                            const parsedDisplayName = JSON.parse(decodedIdToken.name);
                            const renderVar = {
                                allPhotos: allPhotosArray || [],
                                photo: pubPhoto || ' ',
                                secPhotos: secPhotosArray || [],
                                photoUrl: decodedIdToken.picture || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                                myName: parsedDisplayName.nameAndSurname.name,
                                uid: decodedIdToken.user_id || ' ',
                                mySurname: parsedDisplayName.nameAndSurname.surname,
                                displayName: parsedDisplayName.nameAndSurname.displayName || ' ',
                                isFavorite: favorite ? true : false,
                                name: snapshotVal.Name || '',
                                owner: snapshotVal.Owner || '',
                                pubId: snapshotVal.Id || '',
                                description: snapshotVal.SDescription || '',
                                ShelterName: snapshotVal.Refugio || '',
                                province: snapshotVal.Provincia || '',
                                isPrivate: false,
                                castrated: filters.Castrated || false,
                                catfriendly: filters.CatFriendly || false,
                                dogfriendly: filters.DogFriendly || false,
                                kidsfriendly: filters.KidsFriendly || false,
                                color: filters.Color || 'No especificado',
                                size: filters.Size || 'No especificado',
                                ageInMonths: age.Months || 'No especificado',
                                ageInYears: age.Years || 'No especificado',
                                breed: filters.Breed || 'No especificado',
                                observations: filters.Observations || 'No especificado',
                                vaccinated: filters.Vaccinated || false,
                                treatments: filters.Treatments || '',
                                dewormed: filters.Dewormed || false,
                                shelterPubs: result,
                                refId: snapshotVal.RefId || '',
                                locals: {
                                    active: -1,
                                    navButtons: [
                                        {name: 'Inicio', href: '/'}, 
                                        {name: 'Alertas', href: '/alerts'}
                                    ],
                                    userData: res.locals.userData
                                },
                            }

                            if (publications.length > 0) {
                                if (publications.indexOf(pubId) > -1) publications.splice(publications.indexOf(pubId), 1);



                                getMany(collection, requestProjection, requestQuery).then((snapshot) => {
                                    snapshot.forEach(element => {
                                        result.push(element);
                                    });
                                    res.render(appDir + '/public/publication', renderVar);
                                    client.close();

                                }).catch((err) => {
                                    console.log(err);
                                    res.status(500).send(err);
                                    client.close();

                                });
                            } else {
                                renderVar.shelterPubs = [];
                                res.render(appDir + '/public/publication', renderVar)
                                client.close();

                            }
                        }).catch((err) => {
                            console.log(err);
                            res.status(500).send(err);
                            client.close();
                        });
                    }).catch((error) => {
                        const renderPrivVar = {
                            allPhotos: allPhotosArray || [],
                            photo: pubPhoto || ' ',
                            secPhotos: secPhotosArray || [],
                            photoUrl: 'https://dogshome.com.ar/profile/image/uploaded/default-private-user-image.png',
                            myName: 'Cuenta',
                            uid: '',
                            mySurname: 'Privada',
                            displayName: 'Cuenta Privada',
                            name: snapshotVal.Name || '',
                            owner: snapshotVal.Owner || '',
                            pubId: snapshotVal.Id || '',
                            description: snapshotVal.SDescription || '',
                            ShelterName: snapshotVal.Refugio || '',
                            province: snapshotVal.Provincia || '',
                            isPrivate: true,
                            castrated: filters.Castrated || false,
                            catfriendly: filters.CatFriendly || false,
                            dogfriendly: filters.DogFriendly || false,
                            kidsfriendly: filters.KidsFriendly || false,
                            color: filters.Color || 'No especificado',
                            size: filters.Size || 'No especificado',
                            ageInMonths: age.Months || 'No especificado',
                            ageInYears: age.Years || 'No especificado',
                            breed: filters.Breed || 'No especificado',
                            observations: filters.Observations || 'No especificado',
                            vaccinated: filters.Vaccinated || false,
                            treatments: filters.Treatments || '',
                            dewormed: filters.Dewormed || false,
                            refId: snapshotVal.RefId || '',
                            shelterPubs: result || [],
                            locals: {
                                active: -1,
                                navButtons: [
                                    {name: 'Inicio', href: '/'}, 
                                    {name: 'Alertas', href: '/alerts'}
                                ]
                            },
                        }
                        if (publications.length > 0) {
                            if (publications.indexOf(pubId) > -1) publications.splice(publications.indexOf(pubId), 1);

                            getMany(collection, requestProjection, requestQuery).then((snapshot) => {
                                snapshot.forEach(element => {
                                    result.push(element);
                                });
                                res.render(appDir + '/public/publication', renderPrivVar);
                                client.close();
                            }).catch((err) => {
                                console.log(err);
                            });
                        } else {
                            renderPrivVar.shelterPubs = [];
                            res.render(appDir + '/public/publication', renderPrivVar)
                            client.close();
                        }
                    });
                }).catch(err => {
                    console.log(err);
                    res.status(500).send('Error');
                    client.close();
                    
                });

            }).catch(err => {
                console.log(err);
                res.status(500).send('Error');
                client.close();

            });
        }).catch((error) => {
            console.log(error);
            res.status(500).send('Error');
            client.close();

        });
    });
}

module.exports = { init };