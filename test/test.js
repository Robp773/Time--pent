'use strict';

const {app, runServer, closeServer} = require('../server.js');
const chai = require('chai');
const chaiHttp = require('chai-Http');
const {SpentMin, PlannedMin} = require('../models');
const faker = require('faker');
const mongoose = require('mongoose');
const should = chai.should();
mongoose.promise = global.promise;
chai.use(chaiHttp);

function seedData(){
  let dataArray = [];
  for(let i=0; i<10; i++){
    dataArray.push(generateData());
  }
  return SpentMin.insertMany(dataArray) && PlannedMin.insertMany(dataArray);
}
function randomNumber(){
  const numberArray = [5, 22, 43, 75, 234, 121, 15, 44, 94, 55, 230, 34];
  return numberArray[Math.floor(Math.random() * numberArray.length)];
}
function generateData(){
  let random_boolean = Math.random() >= 0.5;
  return {
    name: faker.lorem.words(),
    cost: randomNumber(),
    productive: random_boolean,
    category: faker.hacker.verb()
  };
}
function dropDB(){
    
  return new Promise(function(resolve, reject){
    mongoose.connection.dropDatabase()
      .then(function(result){
        resolve(result);
      })
      .catch(function(err){
        reject(err);
      });
  });
}


describe('all API endpoints', function(){

  before(function(){
    return runServer();
  });

  beforeEach(function(){
    return seedData();
  });

  afterEach(function(){
    return dropDB();
  });
  after(function(){
    return closeServer();
  });

  describe('get requests', function() { 

    it('should return an index.html page for / reqs', function() {
      return chai.request(app)
        .get('/')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.html;
        });
    });
    it('should return an index.html page for /charts reqs', function() {
      return chai.request(app)
        .get('/charts')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.html;
        });
    });
    
    it('should return all recorded minutes from /homeRecorded', function(){
      return chai.request(app)
        .get('/homeRecorded')
        .then(function(res){
          res.should.be.json;
          res.should.have.status(200);
          return SpentMin.count()
            .then(function(count){
              res.body.length.should.equal(count);
            });
        });
    });

    it('should return all recorded minutes from /homePlanned', function(){
      return chai.request(app)
        .get('/homePlanned')
        .then(function(res){
          res.should.be.json;
          res.should.have.status(200);
          return PlannedMin.count()
            .then(function(count){
              res.body.length.should.equal(count);
            });
        });
    });
  });

  describe('post requests', function(){
        
    it('should add a new record to SpentMin on requests to /homeRecorded', function(){
      let testPost =  generateData();
      return chai.request(app)
        .post('/homeRecorded')
        .send(testPost)
        .then(function(res){
          res.should.have.status(201);
          res.body.name && res.body.cost.should.equal(testPost.name && testPost.cost);
          res.body.category && res.body.productive.should.equal(testPost.category && testPost.productive);
        });
    });

    it('should add a new record to PlannedMin on requests to /homePlanned', function(){
      let testPost =  generateData();
      return chai.request(app)
        .post('/homePlanned')
        .send(testPost)
        .then(function(res){
          res.should.have.status(201);
          res.body.name && res.body.cost.should.equal(testPost.name && testPost.cost);
          res.body.category && res.body.productive.should.equal(testPost.category && testPost.productive);
        });

    });
  });
  describe('put requests', function(){
    let updateItem = {name: 'updatedName', category: 'test'};
        
    it('should update a single item from SpentMin on requests to /homeRecorded/:id', function(){
      return SpentMin
        .findOne()
        .then(function(item){
          console.log(item);
          updateItem.id = item.id;
          return chai.request(app)
            .put(`/homeRecorded/${updateItem.id}`)
            .send(updateItem)
            .then(function(res){
              console.log(res);
              res.should.have.status(201);
              res.body.name && res.body.category.should.equal(updateItem.name && updateItem.category);
              return; 
            });
        });        
    });

    it('should update a single item from PlannedMin on requests to /homePlanned/:id', function(){
      let updateItemTwo = {name: 'updatedNameTwo', category: 'Test-Two'};
      return PlannedMin
        .findOne()
        .then(function(itemTwo){
          updateItemTwo.id = itemTwo.id;
          return chai.request(app)
            .put(`/homePlanned/${updateItemTwo.id}`)
            .send(updateItemTwo)
            .then(function(res){
              res.should.have.status(201);
              res.body.name && res.body.category.should.equal(updateItemTwo.name && updateItemTwo.category);
            });

        });
    });
  });

  describe('delete endpoints', function(){
    it('should successfully delete items on requests to homeRecorded/:id', function(){
      let deleteId;
      return SpentMin
        .findOne()
        .then(function(res){
          deleteId =  res.id;
        });
      return chai.request(app)
        .delete(`homeRecorded/${deleteId}`)
        .then(function(res){
          res.should.have.status(204);
        });
    });
  });
});
