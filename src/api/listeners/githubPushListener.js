
//Route to get all publications
function listen(app){
    app.post('/webhooks/github', function(req, res){
        console.log(req.body);
        res.send('ok');
    })
}

module.exports = {listen};