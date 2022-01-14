const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, database, firebaseAdmin, firebaseApp) {
    app.get(['/perfil/:u', '/perfil.html/:u'], (req, res) => {
        const token = req.cookies.session || ' ';
        if (token) {
            firebaseAdmin.auth().verifySessionCookie("eyJhbGciOiJSUzI1NiIsImtpZCI6IjM1MDZmMzc1MjI0N2ZjZjk0Y2JlNWQyZDZiNTlmYThhMmJhYjFlYzIiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoie1wibmFtZUFuZFN1cm5hbWVcIjp7XCJuYW1lXCI6XCJUb21hc1wiLFwic3VybmFtZVwiOlwiQmFyYWtcIixcImRpc3BsYXlOYW1lXCI6XCJUb21hcyBCYXJha1wifSxcImFjY291bnRUeXBlXCI6e1widHlwZVN0clwiOlwiXCIsXCJ0eXBlU2VsZWN0aW9uTnVtXCI6XCJcIn19IiwicGljdHVyZSI6Imh0dHBzOi8vYXBpLnNvZnR2aXNpb25kZXZlbG9wLmNvbS5hci9wcm9maWxlL2ltYWdlL3VwbG9hZGVkL3lmcmQyZjYxMVpOcUtIbUsxNzRKNElsVDNvdzIuanBnIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2RvZ3Nob21lLTZhZjg4IiwiYXVkIjoiZG9nc2hvbWUtNmFmODgiLCJhdXRoX3RpbWUiOjE2NDIxNDQzNTYsInVzZXJfaWQiOiJ5ZnJkMmY2MTFaTnFLSG1LMTc0SjRJbFQzb3cyIiwic3ViIjoieWZyZDJmNjExWk5xS0htSzE3NEo0SWxUM293MiIsImlhdCI6MTY0MjE0NDM1NiwiZXhwIjoxNjQyMTQ3OTU2LCJlbWFpbCI6ImRhcmt0b21kakBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJkYXJrdG9tZGpAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.BqT44UTqUnEI54mZd1pdkQ1kG_JdLQbnzjSES1pWXkAF9cLASkkWTrSgu9nsXNSAJeaKnNw-cBfPa3hL6Y_bsfnZP1R_Qn4jtvoUQ6sM_9FlIItUrONG9zURxzTaXgB3HZSezF4oEYVoW7727-nvKl6VpIkLi22vSCbZlswiox5TDxDukoG1wzUbeeqCW6hXPszFE0ct3rfheQYGiwpvyZlOK6rL0iWTkYle30kqUUBVOO6Lq4m-75eNMw3K0Nb9lRflrkMMrYrwPTB01C5lCWOwfJQ-6E9JuWCCOPUnj9os0no6_l7XVHTINc2CMQOPMzOxwGS9L61T4Q70RIMHjw", true /** checkRevoked */).then((decodedIdToken) => {
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
                    let renderVar = {
                        publications:   result,
                        photo:          profile.Photo || 'https://miro.medium.com/fit/c/1360/1360/1*W35QUSvGpcLuxPo3SRTH4w.png',
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
                        isMine:         isMine
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