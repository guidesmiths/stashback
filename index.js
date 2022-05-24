const debug = require('debug')('stashback');

module.exports = (overrides) => {
  const vault = {};
  let expired = 0;
  const defaults = Object.assign(
    {},
    {
      onUnknownKey,
      onDuplicateKey,
      onExpiry,
    },
    overrides
  );

  function stash(key, callback, overrides, next) {
    if (arguments.length === 3) return stash(key, callback, {}, arguments[2]);
    debug('Stashing', key);

    const options = Object.assign({}, defaults, overrides);
    if (exists(key)) return options.onDuplicateKey(key, next);
    add(key, callback, options);
    next(null);
  }

  function unstash(key, overrides, next) {
    if (arguments.length === 2) return unstash(key, {}, arguments[1]);
    debug('Unstashing', key);

    const options = Object.assign({}, defaults, overrides);
    if (!exists(key)) return options.onUnknownKey(key, next);
    next(null, remove(key).callback);
  }

  function unstashAll(overrides, next) {
    if (arguments.length === 1) return unstashAll({}, arguments[0]);

    const results = Object.keys(vault).reduce((callbacks, key) => {
      debug('Unstashing', key);
      return callbacks.concat(remove(key));
    }, []);

    next(null, results);
  }

  function add(key, callback, options) {
    vault[key] = {
      callback: callback,
      timeout: options.timeout ? expire(key, options.timeout) : undefined,
      options: options,
    };
  }

  function expire(key, timeout) {
    return setTimeout(() => {
      debug('Expiring:', key);
      expired++;
      const entry = remove(key);
      entry.options.onExpiry(key, entry.callback);
    }, timeout);
  }

  function remove(key) {
    const entry = vault[key];
    delete vault[key];
    clearTimeout(entry.timeout);
    return entry;
  }

  function exists(key) {
    return vault.hasOwnProperty(key);
  }

  function onDuplicateKey(key, next) {
    next(new Error('Duplicate key: ' + key));
  }

  function onUnknownKey(key, next) {
    return next(new Error('Unknown key: ' + key), () => {
      debug('Unknown key:', key);
    });
  }

  function onExpiry(key, callback) {
    callback(new Error('Expired by stashback'));
  }

  function stats() {
    return {
      stashed: Object.keys(vault).length,
      expired: expired,
    };
  }

  return {
    stash,
    unstash,
    unstashAll,
    stats,
  };
};
