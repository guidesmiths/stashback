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
 * @param {function} options.onUnknownKey      Function to be executed when instructed to unstash an unknown (or expired) key.
 * @param {function} options.onDuplicateKey    Function to be executed when instructed to stash a duplicate key.
 * @param {function} options.onExpiry          Function to be executed after expiring a key.
 */
module.exports = function(overrides) {

    var vault = {}
    var expired = 0
    var defaults = _.defaults(overrides || {}, {
        onUnknownKey: onUnknownKey,
        onDuplicateKey: onDuplicateKey,
        onExpiry: onExpiry
    })

    function stash(key, callback, overrides, next) {
        if (arguments.length === 3) return stash(key, callback, {}, arguments[2])
        debug('Stashing', key)

        var options = _.defaults(overrides, defaults)
        if (exists(key)) return options.onDuplicateKey(key, next)
        add(key, callback, options)
        next(null)
    }

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

    function stats() {
        return {
            stashed: Object.keys(vault).length,
            expired: expired
        }
    }

    return {
        /**
         * Stashes a callback for subsequent retrieval
         * @param {String}   key                       The callback id
         * @param {function} callback                  The callback to be stashed
         * @param {Object}   options
         * @param {function} options.onDuplicateKey    Function to be executed when instructed to stash a duplicate key.
         * @param {function} options.onExpiry          Function to be executed after expiring a key.
         * @param {callback} next                      Callback which will be excuted with the error object
         */
        stash: stash,

        /**
         * Unstashes a callback for execution
         * @param {String}   key                       The callback id
         * @param {Object}   options
         * @param {function} options.onUnknownKey      Function to be executed when instructed to unstash an unknown (or expired) key.
         * @param {function} options.onExpiry          Function to be executed after expiring a key.
         * @param {callback} next                      Callback which will be executed with the error object and the callback (or no-op function if the callback was not found or has expired)
         */
        unstash: unstash,

        /**
         * Provides statistics
         * @returns {Object}     stats                 An object containing the number of stashed and expired callbacks
         */
        stats: stats
    }
}
