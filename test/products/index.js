"use strict";
const Product = require('../../src/api/models/Product')
const server = require('../../server')

//test dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
chai.use(chaiHttp)

// Test GET app
describe('App', () => {
  it('it should GET host and respond with "Hello Target" and link to API docs', (done) => {
    chai.request(server)
        .get('/')
        .end((err, res) => {
            if (err) {
              console.log('Error', err);
            }
            should.exist(res)
            should.exist(res.text)
            res.should.have.status(200)
          done();
        });
  });
});

describe('Products', () => {

  var demoProduct;

  //Empty TEST DB before test
  before((done) => { 
    Product.deleteMany({}, (err) => { 
        done()         
    })       
  })
  
  // Test GET all products expect 404 (resources empty)
  describe('/GET products', () => {
    it('it should GET all products (empty)', (done) => {
      chai.request(server)
          .get('/api/v1/products')
          .end((err, res) => {

              should.exist(err)
              should.exist(res)
              should.exist(res.body)
              should.exist(res.body.error)
              should.exist(res.body.status)
              should.exist(res.body.message)
              res.should.have.status(404)
              res.body.should.be.a('object')
              res.body.error.should.be.a('boolean')
              res.body.status.should.be.a('number')
              res.body.message.should.be.a('string')
              res.body.error.should.be.eql(true)
            done();
          });
    });
  });

  describe('/GET scraped data from target PDP', () => {
    it('it should scrape movie data from target PDP and save to Mongo DB ', (done) => {
      chai.request(server)
          .get(`/api/v1/scrape/movies?page=${process.env.TARGET_PDP_SCRAPE_TEST_URL}`)
          .end((err, res) => {
              if (err) {
                console.log('Error', err);
              }

              should.exist(res)
              should.exist(res.body)
              should.exist(res.body.done)
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.done.should.be.eql(true)
            done();
          });
    });
  });

  // Test GET all products
  describe('/GET products', () => {
    it('it should GET all products', (done) => {
      chai.request(server)
          .get('/api/v1/products')
          .end((err, res) => {
              if (err) {
                console.log('Error', err);
              }

              should.exist(res)
              should.exist(res.body)
              res.should.have.status(200)
              res.body.should.be.a('array')
              res.body.length.should.not.be.eql(0)
              //set demo product
              demoProduct = res.body[0]
            done();
          });
    });
  });

  describe('/GET product by id', () => {
    it('it should GET one product by id', (done) => {
      chai.request(server)
          .get(`/api/v1/products/${demoProduct.product_id}`)
          .end((err, res) => {
              if (err) {
                console.log('Error', err);
              }

              should.exist(res)
              should.exist(res.body)
              should.exist(res.body.product_id)
              should.exist(res.body.name)
              should.exist(res.body.current_price)
              should.exist(res.body.current_price.value)
              should.exist(res.body.current_price.currency_code)
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.product_id.should.be.a('number')
              res.body.name.should.be.a('string')
              res.body.current_price.should.be.a('object')
              res.body.current_price.value.should.be.a('object')
              res.body.current_price.value.$numberDecimal.should.be.a('string')
              res.body.current_price.currency_code.should.be.a('string')
              res.body.product_id.should.be.eql(demoProduct.product_id)
              res.body.current_price.should.be.eql(demoProduct.current_price)
            done();
          });
    });
  });

  describe('/GET enter invalid product_id', () => {
    it('it should fail to GET product by id', (done) => {
      chai.request(server)
          .get(`/api/v1/products/ljenfb`)
          .end((err, res) => {

              should.exist(err)
              should.exist(res)
              should.exist(res.body)
              should.exist(res.body.error)
              should.exist(res.body.status)
              should.exist(res.body.message)
              res.should.have.status(400)
              res.body.should.be.a('object')
              res.body.error.should.be.a('boolean')
              res.body.status.should.be.a('number')
              res.body.message.should.be.a('string')
              res.body.error.should.be.eql(true)
            done();
          });
    });
  });

  describe('/GET enter non-existent product_id', () => {
    it('it should fail to GET product by id', (done) => {
      chai.request(server)
          .get(`/api/v1/products/1`)
          .end((err, res) => {

            //console.log(res)
              should.exist(err)
              should.exist(res)
              should.exist(res.body)
              should.exist(res.body.error)
              should.exist(res.body.status)
              should.exist(res.body.message)
              res.should.have.status(404)
              res.body.should.be.a('object')
              res.body.error.should.be.a('boolean')
              res.body.status.should.be.a('number')
              res.body.message.should.be.a('string')
              res.body.error.should.be.eql(true)
            done();
          });
    });
  });

  describe('/PUT product by id', () => {
    it('it should UPDATE currency of one product by id', (done) => {
      chai.request(server)
          .put(`/api/v1/products/${demoProduct.product_id}`)
          .set('content-type', 'application/json')
          .send({ current_price: 
            {
              value: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * (99 - 10) ) + 10}`,
              currency_code: "USD"
            }
          })
          .end((err, res) => {
              if (err) {
                console.log('Error', err);
              }

              should.exist(res)
              should.exist(res.body)
              should.exist(res.body.product_id)
              should.exist(res.body.current_price)
              should.exist(res.body.current_price.value)
              should.exist(res.body.current_price.currency_code)
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.product_id.should.be.a('number')
              res.body.current_price.should.be.a('object')
              res.body.current_price.value.should.be.a('object')
              res.body.current_price.value.$numberDecimal.should.be.a('string')
              res.body.current_price.currency_code.should.be.a('string')
              res.body.product_id.should.be.eql(demoProduct.product_id)
              res.body.current_price.value.should.not.be.eql(demoProduct.current_price.value)
            done();
          });
    });
  });

  describe('/PUT enter invalid product_id', () => {
    it('it should fail to UPDATE product by id', (done) => {
      chai.request(server)
          .put(`/api/v1/products/ljenfb`)
          .set('content-type', 'application/json')
          .send({ current_price: 
            {
              value: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * (99 - 10) ) + 10}`,
              currency_code: "USD"
            }
          })
          .end((err, res) => {

              //console.log(res)
              should.exist(err)
              should.exist(res)
              should.exist(res.body)
              should.exist(res.body.error)
              should.exist(res.body.status)
              should.exist(res.body.message)
              res.should.have.status(400)
              res.body.should.be.a('object')
              res.body.error.should.be.a('boolean')
              res.body.status.should.be.a('number')
              res.body.message.should.be.a('string')
              res.body.error.should.be.eql(true)
            done();
          });
    });
  });

  describe('/PUT enter non-existent product_id', () => {
    it('it should fail to UPDATE product by id', (done) => {
      chai.request(server)
          .put(`/api/v1/products/1`)
          .set('content-type', 'application/json')
          .send({ current_price: 
            {
              value: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * (99 - 10) ) + 10}`,
              currency_code: "USD"
            }
          })
          .end((err, res) => {

              should.exist(err)
              should.exist(res)
              should.exist(res.body)
              should.exist(res.body.error)
              should.exist(res.body.status)
              should.exist(res.body.message)
              res.should.have.status(404)
              res.body.should.be.a('object')
              res.body.error.should.be.a('boolean')
              res.body.status.should.be.a('number')
              res.body.message.should.be.a('string')
              res.body.error.should.be.eql(true)
            done();
          });
    });
  });

  describe('/PUT bad request body', () => {
    it('it should fail to UPDATE product by id', (done) => {
      chai.request(server)
          .put(`/api/v1/products/${demoProduct.product_id}`)
          .set('content-type', 'application/json')
          .send({})
          .end((err, res) => {

              should.exist(err)
              should.exist(res)
              should.exist(res.body)
              should.exist(res.body.error)
              should.exist(res.body.status)
              should.exist(res.body.message)
              res.should.have.status(400)
              res.body.should.be.a('object')
              res.body.error.should.be.a('boolean')
              res.body.status.should.be.a('number')
              res.body.message.should.be.a('string')
              res.body.error.should.be.eql(true)
            done();
          });
    });
  });

  

  after((done) => {
    done()
  })

});