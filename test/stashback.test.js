var async = require('async')
var assert = require('assert')
var _curry = require('lodash.curry')
var callback = function() {}

describe('stashback', function() {

    var stashback
    var stash
    var unstash
    var unstashAll
    var stats

    beforeEach(function() {
        stashback = require('..')({ timeout: 500 })
        stash = _curry(stashback.stash)
        unstash = _curry(stashback.unstash)
        unstashAll = _curry(stashback.unstashAll)
        stats = _curry(stashback.stats)
    })

    it('should stash callbacks', function() {
        stash('key', callback, {}, function(err) {
            assert.ifError(err)
            assert.equal(stats().stashed, 1)
        })
    })

    it('should unstash callbacks', function() {
        async.waterfall([
            stash('key', callback, {}),
            unstash('key', {})
        ], function(err, unstashed) {
            assert.ifError(err)
            assert.equal(unstashed, callback)
            assert.equal(stats().stashed, 0)
        })
    })

    it('should unstash all callbacks', function() {
        async.waterfall([
            stash('key1', callback, {}),
            stash('key2', callback, {}),
            stash('key3', callback, {}),
            unstashAll({})
        ], function(err, unstashed) {
            assert.ifError(err)
            assert.equal(unstashed.length, 3)
            assert.equal(stats().stashed, 0)
        })
    })

    it('should reject duplicate keys', function() {
        async.series([
            stash('key', callback, {}),
            stash('key', callback, {})
        ], function(err) {
            assert.ok(err)
            assert.equal(err.message, "Duplicate key: key")
        })
    })

    it('should unstash an unknown key', function() {
        async.waterfall([
            unstash('key', {})
        ], function(err, unstashed) {
            assert.ok(err)
            assert.equal(err.message, "Unknown key: key")
            assert.equal(typeof unstashed, 'function')
            unstashed()
        })
    })

    it('should expire callbacks after the stash timeout', function(test, done) {

        var callback = function(err) {
            assert.ok(err)
            assert.equal(err.message, "Expired by stashback")
        }

        stash('key', callback, { timeout: 300 }, function(err) {
            assert.ifError(err)
            setTimeout(function() {
                unstash('key', {}, function(err) {
                    assert.ok(err)
                    assert.equal(err.message, "Unknown key: key")
                    assert.equal(stats().expired, 1)
                    done();
                })
            }, 400)
        })
    })

    it('should expire callbacks after the global timeout', function(test, done) {

        var callback = function(err) {
            assert.ok(err)
            assert.equal(err.message, "Expired by stashback")
        }

        stash('key', callback, {}, function(err) {
            assert.ifError(err)
            setTimeout(function() {
                unstash('key', {}, function(err) {
                    assert.ok(err)
                    assert.equal(err.message, "Unknown key: key")
                    assert.equal(stats().expired, 1)
                    done();
                })
            }, 600)
        })
    })




})
