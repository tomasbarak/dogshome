const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, database, firebaseAdmin, firebaseApp) {
    app.get(['/perfil/:u', '/perfil.html/:u'], (req, res) => {
        const token = req.cookies.session || ' ';
        if (token) {
            firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
                const { ref, get, getDatabase, query } = database;
                const userId = req.params.u;
                const db = getDatabase(firebaseApp);
                const userPosts = query(ref(db, `Users/${userId}`));

                get(userPosts).then((snapshot) => {
                    let snapshotVal =   snapshot.val() || {};
                    let profile =       snapshotVal.PublicRead || {};
                    let publicWrite =   snapshotVal.PublicWrite || {};
                    let posts =         profile.PostsIds || [];
                    var result =        [];
                    let stats =         publicWrite.stats || {};
                    let SocialMedia =   profile.SocialMedia || {};
                    let accType =       profile.Type || {};
                    let postsIds =      profile.PostsIds || [];
                    let isMine =        false

                    if (req.params.u == decodedIdToken.user_id) {
                        isMine = true;
                    } else {
                        isMine = false;
                    }
                    if (posts.length > 0) {
                        for (let key in posts) {
                            let singleRealPost = query(ref(db, `Publications/All/${posts[key]}`));
                            get(singleRealPost).then((snapshot) => {
                                let singlePost = snapshot.val();
                                result.push(singlePost);

                                if (Object.keys(posts).length == result.length) {

                                    res.render(appDir + '/public/profile', {
                                        publications:   result,
                                        photo:          profile.Photo || 'https://miro.medium.com/fit/c/1360/1360/1*W35QUSvGpcLuxPo3SRTH4w.png',
                                        name:           profile.Name,
                                        surname:        profile.Surname,
                                        typeStr:        accType.TypeStr,
                                        typeNum:        accType.TypeNum,
                                        refName:        profile.RefName || '',
                                        description:    profile.ShortDescription || '',
                                        facebook:       SocialMedia.Facebook || null,
                                        twitter:        SocialMedia.Twitter || null,
                                        instagram:      SocialMedia.Instagram || null,
                                        website:        profile.WebSite || null,
                                        followers:      stats.Followers || 0,
                                        following:      stats.Following || 0,
                                        postsCount:     postsIds.length || 0,
                                        isMine:         isMine
                                    });
                                }

                            }).catch((error) => {
                                console.log(error);
                            });
                        }
                    } else {
                        res.render(appDir + '/public/profile', {
                            publications:   [],
                            photo:          profile.Photo || 'https://miro.medium.com/fit/c/1360/1360/1*W35QUSvGpcLuxPo3SRTH4w.png',
                            name:           profile.Name,
                            surname:        profile.Surname,
                            typeStr:        accType.TypeStr || 'Adoptante',
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
                            isMine:         isMine
                        });
                    }
                }).catch((error) => {
                    console.log(error);
                })
            }).catch((error) => {
                console.log(error);
                res.redirect('/signin');
            })

        } else {
            res.redirect('/signin');
        }
    });
}

module.exports = { init };