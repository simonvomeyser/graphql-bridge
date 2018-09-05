var assert = require('assert');

var nock = require('nock');

const GraphQlRestBridge = require('../lib/graphql-bridge.min')
  .GraphQlRestBridge;

describe('GraphQLBridge', function() {
  it('an-instance-can-be-create', function() {
    var restBridge = new GraphQlRestBridge();
    assert.equal(typeof restBridge, 'object');
  });

  it('an-instance-saves-constructor-params', function() {
    var restBridge = new GraphQlRestBridge(
      {
        someDefaultData: 'some default data',
      },
      {
        Accept: 'application/json',
      }
    );
    assert.equal(restBridge.defaultData.someDefaultData, 'some default data');
    assert.equal(restBridge.defaultHeaders.Accept, 'application/json');
  });

  it('makes-a-simple-request', function(done) {
    nock('http://example-api.com')
      .get('/users/1')
      .reply(200, {
        _id: '123ABC',
      });

    var restBridge = new GraphQlRestBridge(
      {},
      {
        Accept: 'application/json',
      }
    );

    restBridge
      .request({
        endpoint: 'http://example-api.com/users/1',
      })
      .then(function(data) {
        assert.equal(data._id, '123ABC');
        done();
      });
  });

  it('sends-multiple-parameters', function(
    done
  ) {

    nock('http://example-api.com')
      .get('/login?username=admin&password=123456')
      .reply(200, { id: '123ABC' });

    var restBridge = new GraphQlRestBridge();

    restBridge
      .request({
        endpoint: 'http://example-api.com/login',
        data: {username: 'admin', password: '123456'}
      })
      .then(function(data) {
        assert.equal(data.id, '123ABC');
        done();
      });
  });

  it('sends-multiple-parameters-and-default-ones-too', function(
    done
  ) {

    nock('http://example-api.com')
      .get('/login?username=admin&password=123456&apiKey=123')
      .reply(200, { id: '123ABC' });

    var restBridge = new GraphQlRestBridge({apiKey:123});

    restBridge
      .request({
        endpoint: 'http://example-api.com/login',
        data: {username: 'admin', password: '123456'}
      })
      .then(function(data) {
        assert.equal(data.id, '123ABC');
        done();
      });
  });

});
