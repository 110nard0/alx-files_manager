import chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';

chai.use(chaiHttp);

describe('/status', () => {
  it('it should GET the status of the service', (done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('redis').to.eql(true);
        expect(res.body).to.have.property('db').to.deep.equal(true);
        done();
      });
  });
});

describe('/stats', () => {
  it('it should GET statistics about the service', (done) => {
    chai.request(app)
      .get('/stats')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('users').to.be.a('number');
        expect(res.body).to.have.property('files').to.be.a('number');
        done();
      });
  });
});
