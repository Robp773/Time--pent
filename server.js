const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {DATABASE_URL, PORT} = require('./config');
const {SpentMin} = require('./models')
const faker = require('faker')
mongoose.promise = global.promise;
app.use(express.static('public'));

app.get('/', function(req, res){
	// what does __dirname actually look like? ********
	res.sendFile(__dirname + '/public/index.html')
})
app.get('/charts', function(req, res){
	res.sendFile(__dirname + '/public/charts.html')
});
app.get('/homeRecorded', function(req, res){
	SpentMin
	.find()
	.exec()
	.then(function(items){
		// returning empty array
		res.json(items.map(function(item){item.apiRepr()}))
			})

	.catch(function(err) {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });

})

let server;
// connects mongoose and starts server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
     // identifies the server url to connect to for mongoDB database server.
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      // begins accepting connections on the specified port.
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      // node method that binds event handlers to events by their string name ('error'), identical jquery method.
      // why does the mongoose.connect function use a different way of handling errors by using an if statement? ********
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// I dont fully understand why promises need to be used in the close and run server functions. 
// Why couldn't I just do the same code without the promise? ********

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}
// I'm also really struggling to understand the block below. ********
if (require.main === module) {
  runServer().catch(err => console.error(err));
};
module.exports = {app, runServer, closeServer}