var redtape = require('redtape')
var async = require('async')
var _curry = require('lodash.curry')
var callback = function() {}

var it = redtape({
    beforeEach: function (next) {
        var stashback = require('..')({ timeout: 500 })
        var stash = _curry(stashback.stash)
        var unstash = _curry(stashback.unstash)
        var unstashAll = _curry(stashback.unstashAll)
        next(null, stash, unstash, unstashAll, stashback.stats)
    }
});

it('should stash callbacks', function(test, stash, unstash, unstashAll, stats) {
    test.plan(2)
    stash('key', callback, {}, function(err) {
        test.error(err)
        test.equal(stats().stashed, 1)
    })
})

it('should unstash callbacks', function(test, stash, unstash, unstashAll, stats) {
    test.plan(3)
    async.waterfall([
        stash('key', callback, {}),
        unstash('key', {})
    ], function(err, unstashed) {
        test.error(err)
        test.equal(unstashed, callback)
        test.equal(stats().stashed, 0)
    })
})

it('should unstash all callbacks', function(test, stash, unstash, unstashAll, stats) {
    test.plan(3)
    async.waterfall([
        stash('key1', callback, {}),
        stash('key2', callback, {}),
        stash('key3', callback, {}),
        unstashAll({})
    ], function(err, unstashed) {
        test.error(err)
        test.equal(unstashed.length, 3)
        test.equal(stats().stashed, 0)
    })
})

it('should reject duplicate keys', function(test, stash, unstash, unstashAll, stats) {
    test.plan(2)
    async.series([
        stash('key', callback, {}),
        stash('key', callback, {})
    ], function(err) {
        test.assert(err)
        test.equal(err.message, "Duplicate key: key")
    })
})

it('should unstash an unknown key', function(test, stash, unstash, unstashAll, stats) {
    test.plan(3)
    async.waterfall([
        unstash('key', {})
    ], function(err, unstashed) {
        test.assert(err)
        test.equal(err.message, "Unknown key: key")
        test.equal(typeof unstashed, 'function')
        unstashed()
    })
})

it('should expire callbacks after the stash timeout', function(test, stash, unstash, unstashAll, stats) {
    test.plan(6)

    var callback = function(err) {
        test.assert(err)
        test.equal(err.message, "Expired by stashback")
    }

    stash('key', callback, { timeout: 300 }, function(err) {
        test.error(err)
        setTimeout(function() {
            unstash('key', {}, function(err) {
                test.assert(err)
                test.equal(err.message, "Unknown key: key")
                test.equal(stats().expired, 1)
            })
        }, 400)
    })
})

it('should expire callbacks after the global timeout', function(test, stash, unstash, unstashAll, stats) {
    test.plan(6)

    var callback = function(err) {
        test.assert(err)
        test.equal(err.message, "Expired by stashback")
    }

    stash('key', callback, {}, function(err) {
        test.error(err)
        setTimeout(function() {
            unstash('key', {}, function(err) {
                test.assert(err)
                test.equal(err.message, "Unknown key: key")
                test.equal(stats().expired, 1)
            })
        }, 600)
    })
})


