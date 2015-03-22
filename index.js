'use strict';
var debug = require('debug')('stashback')
var _ = require('lodash')

/**
 * A library for stashing and retrieving callbacks
 * @module stashback
 */


/**
 * Returns a configured stashback object
 * @param {Object} options
 * @param {integer} options.timeout            Callback timeout in milliesconds
 * @param {function} options.onUnknownKey      Function to be executed when instructed to unstash an unknown (or expired) key. Must be bound to the stashback instance
 * @param {function} options.onDuplicateKey    Function to be executed when instructed to stash a duplicate key. Must be bound to the stashback instance
 * @param {function} options.onExpiry          Function to be executed after expiring a key. Must be bound to the stashback instance
 */
module.exports = function(overrides) {

    var vault = {}
    var expired = 0
    var defaults = _.defaults(overrides || {}, {
        onUnknownKey: onUnknownKey,
        onDuplicateKey: onDuplicateKey,
        onExpiry: onExpiry
    })

    /**
     * Stashes a callback for subsequent retrieval
     * @param {String}   key
     * @param {function} callback
     * @param {Object}   options
     * @param {function} options.onDuplicateKey    Function to be executed when instructed to stash a duplicate key. Must be bound to the stashback instance
     * @param {function} options.onExpiry          Function to be executed after expiring a key. Must be bound to the stashback instance
     * @param {callback}
     * @param {Error}
     */
    function stash(key, callback, overrides, next) {
        if (arguments.length === 3) return stash(key, callback, {}, arguments[2])
        debug('Stashing', key)

        var options = _.defaults(overrides, defaults)
        if (exists(key)) return options.onDuplicateKey(key, next)
        add(key, callback, options)
        next(null)
    }

    /**
     * Unstashes a callback for execution
     * @param {String}   key
     * @param {Object}   options
     * @param {function} options.onUnknownKey      Function to be executed when instructed to unstash an unknown (or expired) key. Must be bound to the stashback instance
     * @param {function} options.onExpiry          Function to be executed after expiring a key. Must be bound to the stashback instance
     * @param {callback}
     * @param {Error}
     * @param {function}                           The stashed callback or a no-op callback in the event of an error
     */
    function unstash(key, overrides, next) {
        if (arguments.length === 2) return unstash(key, {}, arguments[1])
        debug('Unstashing', key)

        var options = _.defaults(overrides, defaults)
        if (!exists(key)) return options.onUnknownKey(key, next)
        next(null, remove(key).callback)
    }

    function add(key, callback, options) {
        vault[key] = {
            callback: callback,
            timeout: options.timeout ? expire(key, options.timeout) : undefined,
            options: options
        }
    }

    function expire(key, timeout) {
        return setTimeout(function() {
            debug('Expiring key:', key)
            expired++
            var entry = remove(key)
            entry.options.onExpiry(key, entry.callback)
        }, timeout)
    }

    function remove(key) {
        var entry = vault[key]
        delete vault[key]
        clearTimeout(entry.timeout)
        return entry
    }

    function exists(key) {
        return vault.hasOwnProperty(key)
    }

    function onDuplicateKey(key, next) {
        next(new Error('Duplicate key: ' + key))
    }

    function onUnknownKey(key, next) {
        return next(new Error('Unknown key: ' + key), function() {
            debug('Unknown key:', key)
        })
    }

    function onExpiry(key, callback) {
        callback(new Error('Expired by stashback'))
    }

    /**
     * Provides statistics
     * @returns {Object}      stats
     * @returns {integer}     stats.stashed      The number of currently stashed callbacks
     * @returns {function}    stats.expired      The number of expired callbacks
     */
    function stats() {
        return {
            stashed: Object.keys(vault).length,
            expired: expired
        }
    }

    return {
        stash: stash,
        unstash: unstash,
        stats: stats
    }
}
