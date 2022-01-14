const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, database, firebaseAdmin, firebaseApp) {
    app.get(['/perfil/:u', '/perfil.html/:u'], (req, res) => {
        const token = req.cookies.session || ' ';
        if (token) {
            firebaseAdmin.auth().verifySessionCookie("eyJhbGciOiJSUzI1NiIsImtpZCI6InRCME0yQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9kb2dzaG9tZS02YWY4OCIsIm5hbWUiOiJ7XCJuYW1lQW5kU3VybmFtZVwiOntcIm5hbWVcIjpcIlRvbWFzXCIsXCJzdXJuYW1lXCI6XCJCYXJha1wiLFwiZGlzcGxheU5hbWVcIjpcIlRvbWFzIEJhcmFrXCJ9LFwiYWNjb3VudFR5cGVcIjp7XCJ0eXBlU3RyXCI6XCJcIixcInR5cGVTZWxlY3Rpb25OdW1cIjpcIlwifX0iLCJwaWN0dXJlIjoiaHR0cHM6Ly9hcGkuc29mdHZpc2lvbmRldmVsb3AuY29tLmFyL3Byb2ZpbGUvaW1hZ2UvdXBsb2FkZWQveWZyZDJmNjExWk5xS0htSzE3NEo0SWxUM293Mi5qcGciLCJhdWQiOiJkb2dzaG9tZS02YWY4OCIsImF1dGhfdGltZSI6MTY0MjE0NDM1NiwidXNlcl9pZCI6InlmcmQyZjYxMVpOcUtIbUsxNzRKNElsVDNvdzIiLCJzdWIiOiJ5ZnJkMmY2MTFaTnFLSG1LMTc0SjRJbFQzb3cyIiwiaWF0IjoxNjQyMTQ0MzU4LCJleHAiOjE2NDI1NzYzNTgsImVtYWlsIjoiZGFya3RvbWRqQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImRhcmt0b21kakBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.ahn_PDGTmGAcFxpwaMhN9LvjnOPv4IRg9sdS3qo8LudlVal5rvLAjj-RZiiqI-fXU9RAAKkPUuL7nFgEl0gZnlRPuU6LzOWO-n0zfQbB68Fon9HlxEaI0Ll_abHIJq5ck1Qr7L0r95ReRGvAADZH-6Nhs-6jiHYglriFBU3uU4xNB8s8sYncA8OAl5axKgE2Cwp4eNZ4lEBvFmRTIN7OAS-2iyM0_Zz7zX2vxE6_8S2Rh3OBN0fUuXYUDx2nEpfwuqJ6rg0NMcIMFT2gr2tzthqbSvCMZ0ra8DwM9xiPKyjaNS6aVeBnrfostQnGKOIZO6pm_kuforBsLD1t8GH4Zw", true /** checkRevoked */).then((decodedIdToken) => {
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