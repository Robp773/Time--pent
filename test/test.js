const {app, runServer, closeServer} = require('../server.js')
const chai = require('chai');
const chaiHttp = require('chai-Http');
const should = chai.should();
const {SpentMin} = require('../models')
const faker = require('faker')
const mongoose = require('mongoose')

chai.use(chaiHttp);

function seedData(){
    const dataArray = [];
    for(i=0; i<=20; i++){
        dataArray.push(generateData());
    }
    return SpentMin.insertMany(dataArray);
}
function randomNumber(){
    const numberArray = [5, 22, 43, 75, 234, 121, 15, 44, 94, 55, 230, 34]
    return numberArray[Math.floor(Math.random() * numberArray.length)];
}
function generateData(){
    let random_boolean = Math.random() >= 0.5;

    return {
            name: faker.lorem.words(),
            cost: randomNumber(),
            productive: random_boolean,
            category: faker.hacker.verb()
        }
    }
 function dropDB(){
    
    return new Promise(function(resolve, reject){
        mongoose.connection.dropDatabase()
        .then(function(result){
            resolve(result)
        })
        .catch(function(err){
            reject(err)
        });
    });
 };

describe('get request to root and charts.html', function() {
    before(function(){
        return runServer()
    })

    beforeEach(function(){
        return seedData()
    })

    afterEach(function(){
       return dropDB()
    })
    after(function(){
       return closeServer()
    })

    it('should return a 200 status code and html for root requests', function() {
        return chai.request(app)
            .get('/')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.html;
            });
    });
    it('should return a 200 status code and html for requests to /charts', function() {
        return chai.request(app)
            .get('/charts')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.html;
            });
    });

});

describe('get request for home page lists', function(){
    it('should return all recorded and planned spent minutes from /homeRecorded', function(){
        return chai.request(app)
        .get('/homeRecorded')
        .then(function(res){
            res.should.be.json


        })
    })
})