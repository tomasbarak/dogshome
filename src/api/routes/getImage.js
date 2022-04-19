const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');
const fs = require('fs')

function init(app){
    app.get('/profile/image/uploaded/:filename', function(req, res){
        const filename = req.params.filename;
        console.log(logColor.debug, filename + ' accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());
        let filepath = appDir + '/uploads/' + filename;
        let altFilePath = appDir + '/uploads/profile/' + filename;


        if(fs.existsSync(filepath)) {
            res.sendFile(filepath);
        }else if (fs.existsSync(altFilePath)) {
            res.sendFile(altFilePath);
        }else {
            //Send 404 error
            res.status(404);
            res.render(appDir + '/public/404', {
                errorCode: "404",
                errorMessage: "Imagen no encontrada",
            });
        }
    });

    app.get('/profile/drafts/:draftId/uploaded/image/:id', function(req, res){
        const id = req.params.id || '1';
        const draftId = req.params.draftId || '';
        let filepath = `${appDir}/uploads/drafts/${draftId}/image-${id}.jpeg`;

        if(fs.existsSync(filepath)){
            res.sendFile(filepath);
        }
    });
    
}
module.exports = {init};