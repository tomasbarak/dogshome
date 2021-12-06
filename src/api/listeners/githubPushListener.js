
//Route to listen to github webhooks
const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const { exec } =        require("child_process");

function listen(app){
    app.post('/webhooks/github/', function(req, res){
        if(req.headers['x-github-event'] == 'push'){
            exec(`cd ${appDir} && git reset --hard HEAD && git pull && npm i`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            })
        }
    })
}

module.exports = {listen};