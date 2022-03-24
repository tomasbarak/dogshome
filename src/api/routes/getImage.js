const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');
const fs = require('fs')

function init(app){
    app.get('/profile/image/uploaded/:filename', function(req, res){
        filename = req.params.filename;
        console.log(logColor.debug, filename + ' accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());
        let filepath = appDir + '/uploads/' + filename;
        let altFilePath = appDir + '/uploads/profile/' + filename;


        if(fs.existsSync(filepath)){
            res.sendFile(filepath);
        }else if(fs.existsSync(altFilePath)){
            res.sendFile(altFilePath);
        }
    });
    
}
module.exports = {init};