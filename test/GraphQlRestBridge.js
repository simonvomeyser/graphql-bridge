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
});
