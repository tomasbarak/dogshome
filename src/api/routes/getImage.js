const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');

function init(app){
    app.get('/profile/image/uploaded/:filename', function(req, res){
        filename = req.params.filename;
        console.log(logColor.debug, filename + ' accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());
        var filepath = appDir + '/uploads/' + filename;
        res.sendFile(filepath);
    });
    
}
module.exports = {init};