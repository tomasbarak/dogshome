const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');
const { exit } = require('process');

function init(app, database, firebaseAdmin, firebaseApp) {
    app.get(['/publicacion/:id', '/publicacion.html/:id'], (req, res) => {
        const token = req.cookies.session || ' ';
        const { ref, get, getDatabase, query } = database;
        const pubId = req.params.id;
        const db = getDatabase(firebaseApp);
        const publication = query(ref(db, `Publications/All/${pubId}`));
        get(publication).then((snapshot) => {
            const snapshotVal = snapshot.val() || {};
            const pubSecImages = snapshotVal.Images || [];
            const pubPhoto = snapshotVal.Photo || ' ';
            const filters = snapshotVal.Filters || {};
            const age = snapshotVal.Filters.Age || {};
            const shelterPublications = query(ref(db, `Users/${snapshotVal.RefId}/PublicRead/PostsIds}`));

            let allPhotosArray = [];
            let secPhotosArray = [];

            if (Object.keys(snapshotVal).length === 0) {
                res.status(404);
                res.render(appDir + '/public/404', {
                    errorCode: "404",
                    errorMessage: "Publicación no encontrada",
                });
                return;
            }

            allPhotosArray.push(pubPhoto);

            for (let key in pubSecImages) {
                allPhotosArray.push(pubSecImages[key]);
                secPhotosArray.push(pubSecImages[key]);
            }

            get(shelterPublications).then((snapshot) => {
                const publications = snapshot.val() || {};
                let result = [];

                firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
                    const parsedDisplayName = JSON.parse(decodedIdToken.name);
                    const renderVar = {
                        allPhotos: allPhotosArray || [],
                        photo: pubPhoto || ' ',
                        secPhotos: secPhotosArray || [],
                        myPhoto: decodedIdToken.picture,
                        myName: parsedDisplayName.nameAndSurname.name,
                        uid: decodedIdToken.user_id || ' ',
                        mySurname: parsedDisplayName.nameAndSurname.surname,
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
                        shelterPubs: result
                    }

                    if (publications.length > 0) {
                        for (let key in publications) {
                            let singleRealPost = query(ref(db, `Publications/All/${publications[key]}`));
                            get(singleRealPost).then((snapshot) => {
                                let singlePost = snapshot.val();
                                result.push(singlePost);
    
                                if (Object.keys(publications).length == result.length) {
                                    res.render(appDir + '/public/publication', renderVar)
                                }
    
                            }).catch((error) => {
                                console.log(error);
                            });
                        }
                    } else {
                        renderVar.shelterPubs = [];
                        res.render(appDir + '/public/publication', renderVar)
                    }
                }).catch((error) => {
                    const renderPrivVar = {
                        allPhotos: allPhotosArray || [],
                        photo: pubPhoto || ' ',
                        secPhotos: secPhotosArray || [],
                        myPhoto: 'https://dogshome.com.ar/profile/image/uploaded/default-private-user-image.png',
                        myName: 'Cuenta',
                        uid: '',
                        mySurname: 'Privada',
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
                    }
                    res.render(appDir + '/public/publication', renderPrivVar)
                });
                
            }).catch((error) => {
                
            });

            
        }).catch((error) => {
            console.log(error);
            res.status(500).send(error);
        });

    });
}

module.exports = { init };