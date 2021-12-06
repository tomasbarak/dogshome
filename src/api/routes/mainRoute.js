const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);

function init(app){
    app.get('/', function(req, res){
        res.sendFile(appDir + '/src/web/index.html');
    })
    
}

module.exports = {init};