var Chance = require('chance')

module.exports = function(stashback) {

    // Simulate publishing a request to some remote system and getting a decoupled response
    function publish(message) {
        setTimeout(function() {
            var chance = new Chance(message.userId);
            onMessage({ callbackId: message.callbackId, user: { id: message.userId, name: chance.name() } })
        }, 1000)
    }

    function onMessage(message) {
        stashback.unstash(message.callbackId, function(err, callback) {
            callback(err, message.user)
        })
    }

    return {
        publish: publish,
        onMessage: onMessage
    }
}