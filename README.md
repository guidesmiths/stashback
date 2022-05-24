## Stashback

[![CI](https://github.com/guidesmiths/stashback/actions/workflows/node-js-ci.yml/badge.svg)](https://github.com/guidesmiths/stashback/actions/workflows/node-js-ci.yml)
[![NPM version](https://img.shields.io/npm/v/stashback.svg?style=flat-square)](https://www.npmjs.com/package/stashback)
[![NPM downloads](https://img.shields.io/npm/dm/stashback.svg?style=flat-square)](https://www.npmjs.com/package/stashback)
[![Code Climate](https://codeclimate.com/github/guidesmiths/stashback/badges/gpa.svg)](https://codeclimate.com/github/guidesmiths/stashback)
[![Test Coverage](https://codeclimate.com/github/guidesmiths/stashback/badges/coverage.svg)](https://codeclimate.com/github/guidesmiths/stashback/coverage)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-brightgreen.svg)](https://github.com/prettier/prettier)
[![stashback](https://snyk.io/advisor/npm-package/stashback/badge.svg)](https://snyk.io/advisor/npm-package/stashback)
[![Discover zUnit](https://img.shields.io/badge/Discover-zUnit-brightgreen)](https://www.npmjs.com/package/zunit)

Stashback is a library for stashing and retrieving callbacks in a decoupled request/response workflow. Its primary use case is to enable code within an http request/response sequence to publish a message to an ESB, e.g. [RabbitMQ](http://www.rabbitmq.com/) and wait for a reply.

### Installation

```bash
npm install stashback
```

### Example Usage (Express)

```js
const rabbitmq = require('./my-rabbitmq-client');
const express = require('express');
const { v4: uuid } = require('uuid');
const stashback = require('stashback')({ timeout: 5000 });

var app = express();

app.get('/greet/:id', function (req, res, next) {
  // Generate a unique id for the callback
  var callbackId = uuid();

  // Define the callback
  var callback = (err, user) => {
    if (err) return next(err);
    res.send(`Hello ${user.name}`);
  };

  // Stash the callback for later execution
  stashback.stash(callbackId, callback, (err) => {
    // An error will occur if you've used a duplicate callbackId.
    if (err) return next(err);

    // Publish the message to the ESB, requesting user for the specified id. Using rabbitmq as an example.
    rabbitmq.publish({ callbackId, userId: req.params.id });
  });
});

app.listen(3000);

function onMessage(message) {
  // When we receive the user response unstash the callback using the callbackId specified in the message
  stashback.unstash(message.callbackId, (err, cb) => {
    // Execute the callback passing it the user object (the callback will be a no-op if something went wrong)
    cb(err, message.user);
  });
}
```

### Callback Expiry

In order to prevent a slow memory leak and to abort slow running requests it's a good idea to configure stashback with a timeout. This can be done globally and for each 'stash' operation. See the [api](api.md) for more details.

### Duplicates

Attempting to 'stash' multiple callbacks with the same id results in an error. Attempting to 'unstash' a callback twice (or after it has expired) results in both an error and a no-op callback being returned. i.e.

```js
stashback.unstash('never-stashed-or-expired', function (err, callback) {
  assert.equal(err.message, 'Unknown key: never-stashed-or-expired');
  assert.equal(typeof callback, 'function');
});
```

### API

<a name="module_stashback"></a>

#### options

Returns a configured stashback object

| Param                  | Type                      | Description                                                                                                                          |
| ---------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| options                | <code>Object</code>       |                                                                                                                                      |
| options.timeout        | <code>milliseconds</code> | This timeout is applied to the callback being stashed. If the timeout is exceeded the callback is executed with an error object.     |
| options.onUnknownKey   | <code>function</code>     | Function to be executed when instructed to unstash an unknown (or expired) key. It will be invoked with the key and next parameters. |
| options.onDuplicateKey | <code>function</code>     | Function to be executed when instructed to stash a duplicate key. It will be invoked with the key and next parameters.               |
| options.onExpiry       | <code>function</code>     | Function to be executed after expiring a key. It will be invoked with the key and callback to be expired.                            |

#### stash

Stashes a callback for subsequent retrieval

| Param                  | Type                      | Description                                                                                                                      |
| ---------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| key                    | <code>String</code>       | The callback id                                                                                                                  |
| callback               | <code>function</code>     | The callback to be stashed                                                                                                       |
| options                | <code>Object</code>       |                                                                                                                                  |
| options.timeout        | <code>milliseconds</code> | This timeout is applied to the callback being stashed. If the timeout is exceeded the callback is executed with an error object. |
| options.onDuplicateKey | <code>function</code>     | Function to be executed when instructed to stash a duplicate key. It will be invoked with the key and next parameters.           |
| options.onExpiry       | <code>function</code>     | Function to be executed after expiring a key. It will be invoked with the key and next parameters.                               |
| next                   | <code>callback</code>     | Callback which will be invoked an the error object                                                                               |

#### unstash

Unstashes a callback for execution

| Param                | Type                  | Description                                                                                                                                       |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| key                  | <code>String</code>   | The callback id                                                                                                                                   |
| options              | <code>Object</code>   |                                                                                                                                                   |
| options.onUnknownKey | <code>function</code> | Function to be executed when instructed to unstash an unknown (or expired) key. Will be invoked with the key and next parameters.                 |
| next                 | <code>callback</code> | Callback which will be invoked with the error object and the unstashed callback (or no-op function if the callback was not found or has expired). |

#### unstashAll

Unstashes all callbacks for execution

| Param   | Type                  | Description                                                                               |
| ------- | --------------------- | ----------------------------------------------------------------------------------------- |
| options | <code>Object</code>   |                                                                                           |
| next    | <code>callback</code> | Callback which will be invoked with the error object and an array of unstashed callbacks. |

#### stats

Provides statistics

**Returns**: <code>Object</code> - stats An object containing the number of 'stashed' and 'expired' callbacks
