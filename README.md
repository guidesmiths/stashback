## Stashback
[![Build Status](https://travis-ci.org/guidesmiths/stashback.svg?branch=master)](https://travis-ci.org/guidesmiths/stashback)

[![NPM](https://nodei.co/npm/stashback.png?downloads=true)](https://nodei.co/npm/stashback/)

Stashback is a library for stashing and retrieving callbacks in a decoupled request/response workflow. Its primary use case is to enable code within an http request/response sequence to publish a message to an ESB, e.g. [RabbitMQ](http://www.rabbitmq.com/) and wait for a reply.

### Installation
```bash
npm install stashback
```

### Usage
```js
var express = require('express')
var format = require('util').format
var uuid = require('node-uuid').v4
var stashback = require('stashback')({ timeout: 5000 })

var app = express()

app.get('/greet/:id', function(req, res, next) {
    var callbackId = uuid()
    stashback.stash(callbackId, function(err, user) {
        if (err) return next(err)
        res.send(format('Hello %s', user.name))
    }, function(err) {
        if (err) return next(err)
        publish({ callbackId: callbackId, userId: req.params.id })
    })
})

app.listen(3000)


function publish(message) {
    // Publish the message to the ESB
    // ...
}

function onMessage(message) {
    // Receive the response from the ESB, unstash the callback and invoke it with the message data
    stashback.unstash(message.callbackId, function(err, callback) {
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
    assert.equal(typeof x, 'function')
})
```

### Further Customisation
You can further customise stashback's behaviour by providing your own onDuplicateKey, onUnknownKey and onExpiry handlers. See the [api](api.md) for more details.


