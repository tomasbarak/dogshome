
//Route to listen to github webhooks
function listen(app){
    app.post('/webhooks/github', function(req, res){
        console.log(req.body);
        res.send('ok');
    })
}

module.exports = {listen};