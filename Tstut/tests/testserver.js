var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var server = require('../app/server');

chai.use(chaiHttp);

describe('Blobs', function() {
    it('should list ALL conversations on /api/userconversation/<alias> GET', function(done){
        chai.request(server)
            .get('/api/userconversation/jay')
            .end(function(err,res){
                res.should.have.status(200);
                done();
            })
    });
    it('should list a SINGLE blob on /blob/<id> GET');
    it('should add a SINGLE blob on /blobs POST');
    it('should update a SINGLE blob on /blob/<id> PUT');
    it('should delete a SINGLE blob on /blob/<id> DELETE');
})