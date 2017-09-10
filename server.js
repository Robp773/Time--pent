var express = require('express');
var app = express();
app.use(express.static('public'));


app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html')
})
app.get('/charts', function(req, res){
	res.sendFile(__dirname + '/public/charts.html')
})


app.listen(process.env.PORT || 8080);
module.exports = {app}