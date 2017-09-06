
const {app} = require('../server.js')
const chai =  require('chai');
const chaiHttp = require('chai-Http');
const should = chai.should();
chai.use(chaiHttp);

describe('test of test', function(){
	it('should return a 200 status code and html', function(){
		return chai.request(app)
		.get('/')
		.then(function(res){
			res.should.have.status(200);
			res.should.be.html
		})
	})
})