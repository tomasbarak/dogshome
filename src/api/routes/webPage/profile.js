const { connect } = require('http2');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = `mongodb://${process.env.DATABASE_HOST}:27017/dogshome`;
const mongoDBName = 'dogshome';

function init(app) {

    app.get(['/perfil/:u', '/perfil.html/:u', '/perfil', '/perfil.html'], (req, res) => {
        connectClient(mongoURL).then(client => {
            const isPrivate = res.locals.isPrivate;
            const isVerified = res.locals.isVerified;
            const user = res.locals.user || {};

            const userId = sanitize(req.params.u || user.uid || ' ');

            const mongoDB = client.db(mongoDBName);
            const usersCollection = mongoDB.collection('Users');
            let requestProjection = { _id: 0 };
            let requestQuery = { Id: userId };

            getMany(usersCollection, requestProjection, requestQuery).then((snapshot) => {
                let snapshotVal = snapshot[0] || {};
                let profile = snapshotVal || {};

                if (Object.keys(profile).length === 0) {
                    res.status(404);
                    res.render(appDir + '/src/components/404', {
                        errorCode: "404",
                        errorMessage: "Perfil no encontrado",
                    });
                    client.close();
                    return;
                }

                let publicWrite = snapshotVal.PublicWrite || {};
                let posts = profile.PostsIds || [];
                var result = [];
                let stats = publicWrite.stats || {};
                let SocialMedia = profile.SocialMedia || {};
                let accType = profile.Type || {};
                let postsIds = profile.PostsIds || [];
                let isMine = userId === user.uid;

                const publicationsCollection = mongoDB.collection('Publications');
                requestProjection = { _id: 0 };
                requestQuery = { Id: { $in: posts } };
                if (isPrivate) {
                    let renderPrivVar = {
                        publications: result,
                        photo: profile.Photo || 'https://miro.medium.com/fit/c/1360/1360/1*W35QUSvGpcLuxPo3SRTH4w.png',
                        photoUrl: 'https://dogshome.com.ar/profile/image/uploaded/default-private-user-image.png',
                        myName: 'Cuenta',
                        mySurname: 'Privada',
                        displayName: 'Cuenta Privada',
                        name: profile.Name || '',
                        surname: profile.Surname || '',
                        typeStr: accType.TypeStr || 'Adoptante',
                        uid: userId || '',
                        typeNum: accType.TypeNum || 1,
                        refName: profile.RefName || '',
                        description: profile.ShortDescription || '',
                        facebook: SocialMedia.Facebook || null,
                        twitter: SocialMedia.Twitter || null,
                        instagram: SocialMedia.Instagram || null,
                        website: profile.WebSite || null,
                        followers: stats.Followers || 0,
                        following: stats.Following || 0,
                        postsCount: postsIds.length || 0,
                        isMine: isMine,
                        isPrivate: isPrivate,
                        userHref: `/signin`,
                        locals: {
                                active: isMine ? 2 : -1,
                                navButtons: [
                                        {name: 'Inicio', href: '/'}, 
                                        {name: 'Alertas', href: '/alertas'}
                                    ]
                                }
                    };

                    if (posts.length > 0) {
                        getMany(publicationsCollection, requestProjection, requestQuery).then((snapshot) => {
                            snapshot.forEach((publication) => {
                                result.push(publication);
                            });
                            res.render(appDir + '/src/components/profile', renderPrivVar);
                            client.close();

                        }).catch((err) => {
                            console.log(err);
                            res.status(500).send();
                            client.close();

                        });
                    } else {
                        renderPrivVar.publications = [];
                        res.render(appDir + '/src/components/profile', renderPrivVar);
                        client.close();

                    }
                } else {
                    if (isVerified) {
                        let parsedDisplayName = JSON.parse(user.name);
                        let renderVar = {
                            publications: result,
                            photo: profile.Photo || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                            photoUrl: user.picture || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                            myName: parsedDisplayName.nameAndSurname.name,
                            mySurname: parsedDisplayName.nameAndSurname.surname,
                            displayName: parsedDisplayName.nameAndSurname.displayName,
                            name: profile.Name || '',
                            surname: profile.Surname || '',
                            typeStr: accType.TypeStr || 'Adoptante',
                            uid: userId || '',
                            typeNum: accType.TypeNum || 1,
                            refName: profile.RefName || '',
                            description: profile.ShortDescription || '',
                            facebook: SocialMedia.Facebook || null,
                            twitter: SocialMedia.Twitter || null,
                            instagram: SocialMedia.Instagram || null,
                            website: profile.WebSite || null,
                            followers: stats.Followers || 0,
                            following: stats.Following || 0,
                            postsCount: postsIds.length || 0,
                            isMine: isMine,
                            isPrivate: isPrivate,
                            userHref: !isMine ? `/perfil/${userId}` : `#`,
                            locals: {
                                    active: isMine ? 2 : -1,
                                    navButtons: [
                                        {name: 'Inicio', href: '/'}, 
                                        {name: 'Alertas', href: '/alertas'}
                                    ],
                                    userData: res.locals.userData,
                                }
                        };

                        isMine ? renderVar.locals["dropdownActive"] = 0 : renderVar.locals["dropdownActive"] = undefined;

                        if (posts.length > 0) {
                            getMany(publicationsCollection, requestProjection, requestQuery).then((snapshot) => {
                                snapshot.forEach((publication) => {
                                    result.push(publication);
                                });
                                res.render(appDir + '/src/components/profile', renderVar);
                                client.close();

                            }).catch((err) => {
                                console.log(err);
                                res.status(500).send();
                                client.close();

                            });
                        } else {

                            renderVar.publications = [];
                            res.render(appDir + '/src/components/profile', renderVar);
                            client.close();

                        }
                    } else {
                        res.redirect('/verification');
                        client.close();

                    }
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send();
                client.close();

            });
        });
    });

    function profileExists(profile_json) {
        if (Object.keys(profile_json).length == 0) {
            return false;
        } else {
            return true;
        }
    }
}

module.exports = { init };