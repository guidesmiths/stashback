var assert = require('assert');
var async = require('async');
var _curry = require('lodash.curry');
var callback = function () {};

describe('customisation', function () {
  it('should support custom duplicate key behaviour', function () {
    var stashback = require('..')({
      onDuplicateKey: function (key, next) {
        assert.equal(key, 'key');
        next();
      },
    });
    var stash = _curry(stashback.stash);

    async.series([stash('key', callback, {}), stash('key', callback, {})], function (err) {
      assert.equal(err, null);
    });
  });

  it('should support custom unknown key behaviour', function () {
    var stashback = require('..')({
      onUnknownKey: function (key, next) {
        assert.equal(key, 'key');
        next();
      },
    });

    stashback.unstash('key', {}, function (err) {
      assert.equal(err, undefined);
    });
  });

  it('should support custom expiry behaviour', function () {
    var stashback = require('..')({
      timeout: 400,
      onExpiry: function (key, _callback) {
        assert.equal(key, 'key');
        assert.equal(callback, _callback);
      },
    });

    stashback.stash('key', callback, {}, function (err) {
      assert.ifError(err);
    });
  });
});
