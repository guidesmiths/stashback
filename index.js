'use strict';
var debug = require('debug')('stashback')
var _defaults = require('lodash.defaults')
var _reduce = require('lodash.reduce')

/**
 * A library for stashing and retrieving callbacks
 * @module stashback
 */


/**
 * Returns a configured stashback object
 * @param {Object}       options
 * @param {milliseconds} options.timeout           This timeout is applied to the callback being stashed. If the timeout is exceeded the callback is executed with an error object.
 * @param {function}     options.onUnknownKey      Function to be executed when instructed to unstash an unknown (or expired) key. It will be invoked with the key and next parameters.
 * @param {function}     options.onDuplicateKey    Function to be executed when instructed to stash a duplicate key. It will be invoked with the key and next parameters.
 * @param {function}     options.onExpiry          Function to be executed after expiring a key. It will be invoked with the key and callback to be expired.
 */
module.exports = function(overrides) {

    var vault = {}
    var expired = 0
    var defaults = _defaults(overrides || {}, {
        onUnknownKey: onUnknownKey,
        onDuplicateKey: onDuplicateKey,
        onExpiry: onExpiry
    })

    function stash(key, callback, overrides, next) {
        if (arguments.length === 3) return stash(key, callback, {}, arguments[2])
        debug('Stashing', key)

        var options = _defaults(overrides, defaults)
        if (exists(key)) return options.onDuplicateKey(key, next)
        add(key, callback, options)
        next(null)
    }

    function unstash(key, overrides, next) {
        if (arguments.length === 2) return unstash(key, {}, arguments[1])
        debug('Unstashing', key)

        var options = _defaults(overrides, defaults)
        if (!exists(key)) return options.onUnknownKey(key, next)
        next(null, remove(key).callback)
    }

    function unstashAll(overrides, next) {
        if (arguments.length === 1) return unstashAll({}, arguments[0])

        next(null, _reduce(vault, function(callbacks, callback, key) {
            debug('Unstashing', key)
            return callbacks.concat(remove(key))
        }, []))
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

    function stats() {
        return {
            stashed: Object.keys(vault).length,
            expired: expired
        }
    }

    return {
        /**
         * Stashes a callback for subsequent retrieval
         * @param {String}       key                       The callback id
         * @param {function}     callback                  The callback to be stashed
         * @param {Object}       options
         * @param {milliseconds} options.timeout           This timeout is applied to the callback being stashed. If the timeout is exceeded the callback is executed with an error object.
         * @param {function}     options.onDuplicateKey    Function to be executed when instructed to stash a duplicate key. It will be invoked with the key and next parameters.
         * @param {function}     options.onExpiry          Function to be executed after expiring a key. It will be invoked with the key and next parameters.
         * @param {callback}     next                      Callback which will be invoked an the error object
         */
        stash: stash,

        /**
         * Unstashes a callback for execution
         * @param {String}   key                       The callback id
         * @param {Object}   options
         * @param {function} options.onUnknownKey      Function to be executed when instructed to unstash an unknown (or expired) key. Will be invoked with the key and next parameters.
         * @param {callback} next                      Callback which will be invoked with the error object and the unstashed callback (or no-op function if the callback was not found or has expired).
         */
        unstash: unstash,

        /**
         * Unstashes all callbacks for execution
         * @param {Object}   options
         * @param {callback} next                      Callback which will be invoked with the error object and an array of unstashed callbacks.
         */
        unstashAll: unstashAll,

        /**
         * Provides statistics
         * @returns {Object}     stats                 An object containing the number of 'stashed' and 'expired' callbacks
         */
        stats: stats
    }
}
