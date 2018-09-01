var assert = require('assert');
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
        Accept: 'application/json'
      }
    );
    assert.equal(restBridge.defaultData.someDefaultData, 'some default data');
    assert.equal(restBridge.defaultHeaders.Accept, 'application/json');
  });
});
