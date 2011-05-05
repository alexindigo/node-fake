var common = require('../../common');
var assert = common.assert;
var fake = common.fake;

var object = {};
var fake = fake.create();

(function testInOrder() {
  fake.expect(object, 'a');
  fake.expect(object, 'b');

  object.a();
  object.b();
})();

(function testOutOfOrder() {
  fake.expect(object, 'a');
  fake.expect(object, 'b');

  assert.throws(function() {
    new object.b();
  }, /different call[\s\S]+got: new object#b/i);

  fake.reset();
})();