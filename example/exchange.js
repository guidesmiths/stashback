const Chance = require('chance');

module.exports = (stashback) => {
  // Simulate publishing a request to some remote system and getting a decoupled response
  function publish(message) {
    setTimeout(() => {
      const chance = new Chance(message.userId);
      onMessage({ callbackId: message.callbackId, user: { id: message.userId, name: chance.name() } });
    }, 1000);
  }

  function onMessage(message) {
    stashback.unstash(message.callbackId, (err, cb) => {
      cb(err, message.user);
    });
  }

  return {
    publish,
    onMessage,
  };
};
