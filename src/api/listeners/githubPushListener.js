
//Route to listen to github webhooks
const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const { exec } =        require("child_process");
const logColor = require('../../config/logColors');

function listen(app){
    app.post('/webhooks/github/', function(req, res){
        if(req.headers['x-github-event'] == 'push'){
            exec(`cd ${appDir} && git reset --hard && git pull && npm i`, (error, stdout, stderr) => {
                if (error) {
                    console.error(logColor.error, `Error updating: ${error}`);
                    return;
                }
                console.log(logColor.warn, `stdout: ${stdout}`);
                console.log(logColor.warn, `stderr: ${stderr}`);
                console.log(logColor.success, `Successfully updated`);
            })
        }
    })
}
module.exports = {listen};