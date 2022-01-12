//Route to listen to github webhooks
const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const { exec } =        require("child_process");
const logColor =        require('../../config/logColors');

function listen(app){
    app.post('/webhooks/github/', function(req, res){
        if(req.headers['x-github-event'] == 'push'){
            console.log(logColor.blue, 'Trying to merge changes from github. Commit id: ' + req.body.head_commit.id);
                let branch = req.body.ref.split('/').pop();
                console.log(logColor.blue, 'Branch: ' + branch);
                exec(`sudo -su barak cd ${appDir} && git reset --hard && git pull origin testing`, (error, stdout, stderr) => {
                    if (!error) {

                        console.log(logColor.success, 'Successfully merged changes from github');

                        console.log(logColor.blue, 'Updating npm packages');

                        exec(`npm i`, (error, stdout, stderr) => {
                            if(!error){

                                console.log(logColor.success, 'Successfully updated npm packages');

                                exec(`pm2 restart app`, (error, stdout, stderr) => {
                                    if(!error){
                                        console.log(logColor.blue, 'Restarting app');
                                    }else{
                                        console.log(logColor.error, 'Failed to restart the app');
                                    }
                                })
                            }
                        })
                    }else{
                        console.log(logColor.error, 'Error while updating the app. Commit id: ' + req.body.head_commit.id);
                        console.log(logColor.error, error);
                    }
                })
        }
    })
}

module.exports = {listen};