var redtape = require('redtape')
var async = require('async')
var _curry = require('lodash.curry')
var callback = function() {}

var it = redtape();

it('should support custom duplicate key behaviour', function(test) {
    test.plan(2)

    var stashback = require('..')({ onDuplicateKey: function(key, next) {
        test.equal(key, 'key')
        next()
    }})
    var stash = _curry(stashback.stash)

    async.series([
        stash('key', callback, {}),
        stash('key', callback, {})
    ], function(err) {
        test.equal(err, null)
    })
})

it('should support custom unknown key behaviour', function(test) {
    test.plan(2)

    var stashback = require('..')({ onUnknownKey: function(key, next) {
        test.equal(key, 'key')
        next()
    }})

    stashback.unstash('key', {}, function(err) {
        test.equal(err, undefined)
    })
})

it('should support custom expiry behaviour', function(test) {
    test.plan(3)

    var stashback = require('..')({ timeout: 400, onExpiry: function(key, _callback) {
        test.equal(key, 'key')
        test.equal(callback, _callback)
    }})

    stashback.stash('key', callback, {}, function(err) {
        test.error(err)
    })
})


