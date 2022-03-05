const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';

function init(app){
    app.get(['/create/publication/:draftId/', '/crear/publicacion/:draftId/'], (req, res) => {
        connectClient(mongoURL).then( (client) => {    
            const draftId = req.params.draftId;
            const isPrivate =       res.locals.isPrivate;
            const isVerified =      res.locals.isVerified;
            const user =            res.locals.user || {};

            let name =                          user.name || '{}';
            let parsedDisplayName =             JSON.parse(name);
            const nameAndSurname =              parsedDisplayName.nameAndSurname || {};
            const nameAndSurname_name =         nameAndSurname.name || ' ';
            const nameAndSurname_surname =      nameAndSurname.surname || ' ';
            const nameAndSurname_fullName =     nameAndSurname.displayName || ' ';

            const mongoDB =             client.db(mongoDBName);
            const collection =          mongoDB.collection('PublicationDrafts');
            let requestProjection =     { _id: 0};
            let requestQuery =          { Id: draftId, RefId: user.user_id };

            getMany(collection, requestProjection, requestQuery).then( (data) => {
                if(data.length > 0){   
                    snapshot = data[0] || {};
                    const step = snapshot.Step || 1;
                    const provincesArr = ['Ciudad de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucuman']
                    const provinceName = provincesArr[provincesArr.indexOf(snapshot.Province)]
                    res.render(appDir + '/public/create-publication', {
                        uid:            user.user_id,
                        displayName:    nameAndSurname_fullName || ' ',
                        name:           nameAndSurname_name || ' ',
                        surname:        nameAndSurname_surname || ' ',
                        photoUrl:       user.picture || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                        isPrivate:      isPrivate,
                        step:           step,
                        draftId:        draftId,
                        draftData:      {

                        }
                    });
                    client.close();
                }else{
                    res.render(appDir + '/public/404', {
                        errorCode: '404',
                        errorMessage: 'No se encontró el borrador de publicación',
                    });
                    client.close();
                }
            }).catch( (err) => {
                console.log(err);
                res.status(500).send({error: err, success: false});
                client.close();
            });
            
        }).catch( (err) => {
            console.log(err);
            res.status(500).send({error: err});
        });
    });
}

module.exports = {init};