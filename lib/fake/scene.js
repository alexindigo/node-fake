var Expectation = require('./expectation');
var FakeFunction = require('./fake_function');

function Scene() {
  this._anytime = [];
  this._next = [];

  this._functions = [];
  this._calls = [];
}
module.exports = Scene;

Scene.prototype.expect = function(object, method) {
  return this._expect(this._next, object, method);
};

Scene.prototype.anytime = function(object, method) {
  return this._expect(this._anytime, object, method);
};

Scene.prototype._expect = function(list, object, method) {
  var fakeFunction = this.fakeFunction(object, method);
  this._functions.push(fakeFunction);

  var expectation = Expectation.create(fakeFunction);

  list.push(expectation);

  return expectation;
};

Scene.prototype.callback = function() {
  return this
    .fakeFunction()
    .getDelegator();
};

Scene.prototype.fakeFunction = function(object, method) {
  var fakeFunction;

  if (arguments.length === 2) {
    for (var i = 0; i < this._functions.length; i++) {
      var fakeFunction = this._functions[i];
      if (fakeFunction.getDelegator() === object[method]) {
        return fakeFunction;
      }
    }
  }

  fakeFunction = FakeFunction.create(object, method);

  var self = this;
  fakeFunction.setDelegate(function(fakeCall) {
    return self._handleFakeCall(fakeCall);
  });

  return fakeFunction;
};

Scene.prototype._handleFakeCall = function(fakeCall) {
  var error = null;
  for (var i = 0; i < this._anytime.length; i++) {
    var expectation = this._anytime[i];
    if (expectation.isSatisifed()) {
      continue;
    }

    error = expectation.matches(fakeCall);
    if (!error) {
      return expectation.fullfil(fakeCall);
    }
  }

  for (var i = 0; i < this._next.length; i++) {
    var expectation = this._next[i];
    if (expectation.isSatisifed()) {
      continue;
    }

    error = expectation.matches(fakeCall);
    if (!error) {
      return expectation.fullfil(fakeCall);
    } else {
      throw error;
    }
  }

  if (error) {
    throw error;
  } else{
    throw new Error('unexpected call');
  }
};