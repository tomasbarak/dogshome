//Route to listen to github webhooks
const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const { exec } =        require("child_process");
const logColor = require('../../config/logColors');

function listen(app){
    app.post('/webhooks/github/', function(req, res){
        if(req.headers['x-github-event'] == 'push'){

            console.log(logColor.warn, 'Trying to merge changes from github. Commit id: ' + req.body.head_commit.id);
            
            new Promise(function(resolve, reject){
                exec(`sudo -su barak cd ${appDir} && git reset --hard && git pull`, (error, stdout, stderr) => {
                    if (!error) {
                        console.log(logColor.success, 'Successfully updated the app.');
                        exec(`npm i`, (error, stdout, stderr) => {
                            if(!error){
                                exec(`pm2 restart app`, (error, stdout, stderr) => {
                                    if(!error){
                                        console.log(logColor.success, 'Restarting app');
                                        resolve();
                                    }else{
                                        console.log(logColor.error, 'Failed to restart the app');
                                        reject();
                                    }
                                })

                            }
                        })
                    }else{
                        console.log(logColor.error, 'Error while updating the app. Commit id: ' + req.body.head_commit.id);
                        console.log(logColor.error, error);
                    }
                })
                setTimeout(function() {
                    resolve("program still running");
                }, 2500);
            });

        }
    })
}

module.exports = {listen};