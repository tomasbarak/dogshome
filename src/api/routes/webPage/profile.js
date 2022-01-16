const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');
const { exit } = require('process');

function init(app, database, firebaseAdmin, firebaseApp) {
    app.get(['/perfil/:u', '/perfil.html/:u'], (req, res) => {
        const token = req.cookies.session || ' ';
        if (token) {
            const { ref, get, getDatabase, query } = database;
            const userId = req.params.u;
            const db = getDatabase(firebaseApp);
            const userPosts = query(ref(db, `Users/${userId}`));

            get(userPosts).then((snapshot) => {
                let snapshotVal = snapshot.val() || {};
                let profile = snapshotVal.PublicRead || {};
                if (Object.keys(profile).length === 0) {
                    console.log(profile);
                    res.status(404);
                    res.render(appDir + '/public/404', {
                        errorCode: "404",
                        errorMessage: "Perfil no encontrado",
                    });
                    return;
                }

                let publicWrite = snapshotVal.PublicWrite || {};
                let posts = profile.PostsIds || [];
                var result = [];
                let stats = publicWrite.stats || {};
                let SocialMedia = profile.SocialMedia || {};
                let accType = profile.Type || {};
                let postsIds = profile.PostsIds || [];
                let isMine = false

                firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
                    if (req.params.u == decodedIdToken.user_id) {
                        isMine = true;
                    } else {
                        isMine = false;
                    }

                    let parsedDisplayName = JSON.parse(decodedIdToken.name);

                    let renderVar = {
                        publications: result,
                        photo: profile.Photo || 'https://miro.medium.com/fit/c/1360/1360/1*W35QUSvGpcLuxPo3SRTH4w.png',
                        myPhoto: decodedIdToken.picture,
                        myName: parsedDisplayName.nameAndSurname.name,
                        mySurname: parsedDisplayName.nameAndSurname.surname,
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
                        isPrivate: false
                    };

                    if (posts.length > 0) {
                        for (let key in posts) {
                            let singleRealPost = query(ref(db, `Publications/All/${posts[key]}`));
                            get(singleRealPost).then((snapshot) => {
                                let singlePost = snapshot.val();
                                result.push(singlePost);

                                if (Object.keys(posts).length == result.length) {

                                    res.render(appDir + '/public/profile', renderVar);
                                }

                            }).catch((error) => {
                                console.log(error);
                            });
                        }
                    } else {
                        renderVar.publications = [];
                        res.render(appDir + '/public/profile', renderVar);
                    }

                }).catch((error) => {
                    console.log(error);
                    let renderPrivVar = {
                        publications: result,
                        photo: profile.Photo || 'https://miro.medium.com/fit/c/1360/1360/1*W35QUSvGpcLuxPo3SRTH4w.png',
                        myPhoto: 'https://dogshome.com.ar/profile/image/uploaded/default-private-user-image.png',
                        myName: 'Cuenta',
                        mySurname: 'Privada',
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
                        isPrivate: true
                    };

                    if (posts.length > 0) {
                        for (let key in posts) {
                            let singleRealPost = query(ref(db, `Publications/All/${posts[key]}`));
                            get(singleRealPost).then((snapshot) => {
                                let singlePost = snapshot.val();
                                result.push(singlePost);

                                if (Object.keys(posts).length == result.length) {

                                    res.render(appDir + '/public/profile', renderPrivVar);
                                }

                            }).catch((error) => {
                                console.log(error);
                            });
                        }
                    } else {
                        renderPrivVar.publications = [];
                        res.render(appDir + '/public/profile', renderPrivVar);
                    }
                });
            }).catch((error) => {
                console.log(error);
            });
        } else {
            res.redirect('/signin');
        }
    });
}

module.exports = { init };