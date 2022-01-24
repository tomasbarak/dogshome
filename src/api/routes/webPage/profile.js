const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const axios =           require('axios');
const { exit } =        require('process');

function init(app, database, firebaseAdmin, firebaseApp) {
    app.get(['/perfil/:u', '/perfil.html/:u', '/perfil', '/perfil.html'], (req, res) => {
        const isPrivate =                           res.locals.isPrivate;
        const isVerified =                          res.locals.isVerified;
        const user =                                res.locals.user || {};

        const { ref, get, getDatabase, query } =    database;
        const userId =                              req.params.u || user.uid || ' ';
        const db =                                  getDatabase(firebaseApp);
        const userPosts =                           query(ref(db, `Users/${userId}`));

        get(userPosts).then((snapshot) => {
            let snapshotVal =   snapshot.val() || {};
            let profile =       snapshotVal.PublicRead || {};

            if (!profileExists(profile)) {
                res.status(404);
                res.render(appDir + '/public/404', {
                    errorCode: "404",
                    errorMessage: "Perfil no encontrado",
                });
                return;
            }

            let publicWrite =       snapshotVal.PublicWrite || {};
            let posts =         profile.PostsIds || [];
            var result =        [];
            let stats =         publicWrite.stats || {};
            let SocialMedia =   profile.SocialMedia || {};
            let accType =       profile.Type || {};
            let postsIds =      profile.PostsIds || [];
            let isMine =        isMyProfile(userId, user.uid);

            if (isPrivate) {
                let renderPrivVar = {
                    publications:   result,
                    photo:          profile.Photo || 'https://miro.medium.com/fit/c/1360/1360/1*W35QUSvGpcLuxPo3SRTH4w.png',
                    myPhoto:        'https://dogshome.com.ar/profile/image/uploaded/default-private-user-image.png',
                    myName:         'Cuenta',
                    mySurname:      'Privada',
                    name:           profile.Name || '',
                    surname:        profile.Surname || '',
                    typeStr:        accType.TypeStr || 'Adoptante',
                    uid:            userId || '',
                    typeNum:        accType.TypeNum || 1,
                    refName:        profile.RefName || '',
                    description:    profile.ShortDescription || '',
                    facebook:       SocialMedia.Facebook || null,
                    twitter:        SocialMedia.Twitter || null,
                    instagram:      SocialMedia.Instagram || null,
                    website:        profile.WebSite || null,
                    followers:      stats.Followers || 0,
                    following:      stats.Following || 0,
                    postsCount:     postsIds.length || 0,
                    isMine:         isMine,
                    isPrivate:      isPrivate,
                };

                if (posts.length > 0) {
                    for (let key in posts) {
                        let singleRealPost = query(ref(db, `Publications/All/${posts[key]}`));

                        get(singleRealPost).then((snapshot) => {
                            let singlePost = snapshot.val();
                            result.push(singlePost);

                            if (checkJsonLength(posts, result.length)) {
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
            } else {
                if (isVerified) {
                    let parsedDisplayName = JSON.parse(user.name);

                    let renderVar = {
                        publications:   result,
                        photo:          profile.Photo || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                        myPhoto:        user.picture,
                        myName:         parsedDisplayName.nameAndSurname.name,
                        mySurname:      parsedDisplayName.nameAndSurname.surname,
                        name:           profile.Name || '',
                        surname:        profile.Surname || '',
                        typeStr:        accType.TypeStr || 'Adoptante',
                        uid:            userId || '',
                        typeNum:        accType.TypeNum || 1,
                        refName:        profile.RefName || '',
                        description:    profile.ShortDescription || '',
                        facebook:       SocialMedia.Facebook || null,
                        twitter:        SocialMedia.Twitter || null,
                        instagram:      SocialMedia.Instagram || null,
                        website:        profile.WebSite || null,
                        followers:      stats.Followers || 0,
                        following:      stats.Following || 0,
                        postsCount:     postsIds.length || 0,
                        isMine:         isMine,
                        isPrivate:      isPrivate
                    };

                    if (posts.length > 0) {
                        for (let key in posts) {
                            let singleRealPost = query(ref(db, `Publications/All/${posts[key]}`));

                            get(singleRealPost).then((snapshot) => {
                                
                                let singlePost = snapshot.val();
                                result.push(singlePost);
                                if (checkJsonLength(posts, result.length)) {
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
                } else {
                    res.redirect('/verification');
                }
            }

        }).catch((error) => {
            console.log(error);
        });
    });

    function createArrayFromJson(json) {
        let result = [];
        for (let key in json) {
            result.push(json[key]);
        }
        return result;
    }

    function profileExists(profile_json) {
        if (Object.keys(profile_json).length == 0) {
            return false;
        } else {
            return true;
        }
    }

    function checkJsonLength(json, expected_length) {
        if (Object.keys(json).length == expected_length) {
            return true;
        } else {
            return false;
        }
    }

    function isMyProfile(req_uid, my_uid) {
        if (req_uid == my_uid) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = { init };