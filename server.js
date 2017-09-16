'use strict';
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {DATABASE_URL, PORT} = require('./config');
const {SpentMin, PlannedMin} = require('./models');
const faker = require('faker');
const bodyParser = require('body-parser');
const cors =  require('cors');
mongoose.promise = global.promise;
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
// Public files

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/charts', function(req, res){
  res.sendFile(__dirname + '/public/charts.html');
});

let reservedArray = [];
// Get requests

app.get('/homeRecorded', function(req, res){
  SpentMin
    .find()
    .exec()
    .then(function(items){
      res.json(items);
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

app.get('/homePlanned', function(req, res){
  PlannedMin
    .find()
    .exec()
    .then(function(items){
      res.json(items);
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

// Post Requests

app.post('/homeRecorded', function(req, res){
  const requiredItems = ['name', 'cost', 'productive', 'category'];
  for(let i = 0 ;i<requiredItems.length;i++){
    const field = requiredItems[i];

    if (!(field in req.body)){
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  SpentMin
    .create({
      name: req.body.name,
      cost: req.body.cost,
      productive: req.body.productive,
      category: req.body.category
    })
    .then(function(spentMinPost){
      res.status(201).json(spentMinPost);
    }) 
    .catch(function(err){
      console.error(err);
      res.status(500).json({error: 'Something went wrong'});
    });
});
  




app.post('/homePlanned', function(req, res){
  const requiredItems = ['name', 'cost', 'productive', 'category'];
  for(let i=0;i<requiredItems.length;i++){
    const field = requiredItems[i];
    if (!(field in req.body)){
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  PlannedMin
    .create({
      name: req.body.name,
      cost: req.body.cost,
      productive: req.body.productive,
      category: req.body.category
    })
    .then(function(plannedMinPost){
      res.status(201).json(plannedMinPost);
    }) 
    .catch(function(err){
      console.error(err);
      res.status(500).json({error: 'Something went wrong'});
    });
});


// Put Requests

app.put('/homeRecorded/:id', function(req, res){
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }


  const updated = {};
  const updateableFields = ['name', 'cost', 'productive', 'category'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  SpentMin
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(function(updatedPost){
      res.status(201).json(updatedPost.apiRepr())
        .catch(function(err){ 
          res.status(500).json({message: 'Something went wrong'});
        });
    });
});

app.put('/homePlanned/:id', function(req, res){
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }


  const updated = {};
  const updateableFields = ['name', 'cost', 'productive', 'category'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  PlannedMin
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(function(updatedPost){
      res.status(201).json(updatedPost.apiRepr())
        .catch(function(err){ 
          res.status(500).json({message: 'Something went wrong'});
        });
    });
});

// Delete requests

app.delete('/homeRecorded/:id', function(req, res){
  SpentMin
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(function(){
      console.log(`Deleted blog post with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});

app.delete('/homePlanned/:id', function(req, res){
  PlannedMin
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(function() {
      console.log(`Deleted blog post with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});



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
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

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
if (require.main === module) {
  runServer().catch(err => console.error(err));
}
module.exports = {app, runServer, closeServer};