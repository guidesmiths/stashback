## Stashback
[![NPM version](https://img.shields.io/npm/v/stashback.svg?style=flat-square)](https://www.npmjs.com/package/stashback)
[![NPM downloads](https://img.shields.io/npm/dm/stashback.svg?style=flat-square)](https://www.npmjs.com/package/stashback)
[![Build Status](https://img.shields.io/travis/guidesmiths/stashback/master.svg)](https://travis-ci.org/guidesmiths/stashback)
[![Code Climate](https://codeclimate.com/github/guidesmiths/stashback/badges/gpa.svg)](https://codeclimate.com/github/guidesmiths/stashback)
[![Test Coverage](https://codeclimate.com/github/guidesmiths/stashback/badges/coverage.svg)](https://codeclimate.com/github/guidesmiths/stashback/coverage)
[![Code Style](https://img.shields.io/badge/code%20style-imperative-brightgreen.svg)](https://github.com/guidesmiths/eslint-config-imperative)
[![Dependency Status](https://david-dm.org/guidesmiths/stashback.svg)](https://david-dm.org/guidesmiths/stashback)
[![devDependencies Status](https://david-dm.org/guidesmiths/stashback/dev-status.svg)](https://david-dm.org/guidesmiths/stashback?type=dev)

Stashback is a library for stashing and retrieving callbacks in a decoupled request/response workflow. Its primary use case is to enable code within an http request/response sequence to publish a message to an ESB, e.g. [RabbitMQ](http://www.rabbitmq.com/) and wait for a reply.

### Installation
```bash
npm install stashback
```

### Example Usage (Express)
```js
var rabbitmq = require('./my-rabbitmq-client')
var express = require('express')
var format = require('util').format
var uuid = require('node-uuid').v4
var stashback = require('stashback')({ timeout: 5000 })

var app = express()

app.get('/greet/:id', function(req, res, next) {

    // Generate a unique id for the callback
    var callbackId = uuid()

    // Define the callback
    var callback = function(err, user) {
        if (err) return next(err)
        res.send(format('Hello %s', user.name))
    }

    // Stash the callback for later execution
    stashback.stash(callbackId, callback, function(err) {

        // An error will occur if you've used a duplicate callbackId.
        if (err) return next(err)

        // Publish the message to the ESB, requesting user for the specified id. Using rabbitmq as an example.
        rabbitmq.publish({ callbackId: callbackId, userId: req.params.id })
    })
})

app.listen(3000)


function onMessage(message) {

    // When we receive the user response unstash the callback using the callbackId specified in the message
    stashback.unstash(message.callbackId, function(err, callback) {

        // Execute the callback passing it the user object (the callback will be a no-op if something went wrong)
        callback(err, message.user)
    })
}
```

### Callback Expiry
In order to prevent a slow memory leak and to abort slow running requests it's a good idea to configure stashback with a timeout. This can be done globally and for each 'stash' operation. See the [api](api.md) for more details.


### Duplicates
Attempting to 'stash' multiple callbacks with the same id results in an error. Attempting to 'unstash' a callback twice (or after it has expired) results in both an error and a no-op callback being returned. i.e.

```js
stashback.unstash('never-stashed-or-expired', function(err, callback) {
    assert.equal(err.message, 'Unknown key: never-stashed-or-expired')
    assert.equal(typeof callback, 'function')
})
```

### Further Customisation
You can further customise stashback's behaviour by providing your own onDuplicateKey, onUnknownKey and onExpiry handlers. See the [api](api.md) for more details.

