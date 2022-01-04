const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const authRequest = require(appDir + '/src/api/auth/authRequest');
const axios = require('axios');

function init(app, firebaseAdmin){
    authRequest.setFirebaseAdmin(firebaseAdmin);
    app.get('/publication/:id', function(req, res){
        authRequest.getUIDFromReq(req).then((uid) => {
            console.log(req.headers.authtoken)
            axios.get(
                `https://127.0.0.1/user/${uid}/displayName/`, 
                {
                headers: {
                  'authtoken': req.headers.authtoken,
                }
              }).then((response) => {
                  console.log(response)
                res.render(appDir + '/public/dog.ejs', {
                    postID: req.params.id,
                    displayName: response.data.nameAndSurname.displayName,
                    name: response.data.nameAndSurname.name,
                    surname: response.data.nameAndSurname.surname,
                    uid: uid,
                });
            }).catch((error) => {
                console.log(error);
            });
        }).catch((error) => {
            console.log(error);
        })
        //Make http request to get user display name
        
        console.log();
        
    })
    
}

module.exports = {init};