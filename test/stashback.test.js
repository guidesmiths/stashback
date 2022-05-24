const { strictEqual: eq, ok, ifError } = require('assert');
const stashback = require('..');
const async = require('async');
const noop = () => {};

describe('stashback', () => {
  it('should stash callbacks', () => {
    const sb = stashback();
    sb.stash('key', noop, {}, (err) => {
      ifError(err);
      eq(sb.stats().stashed, 1);
    });
  });

  it('should unstash callbacks', () => {
    const sb = stashback();
    const stash = sb.stash.bind(sb, 'key', noop, {});
    const unstash = sb.unstash.bind(sb, 'key', {});
    async.waterfall([stash, unstash], (err, unstashed) => {
      ifError(err);
      eq(unstashed, noop);
      eq(sb.stats().stashed, 0);
    });
  });

  it('should unstash all callbacks', () => {
    const sb = stashback();
    const stash1 = sb.stash.bind(sb, 'key1', noop, {});
    const stash2 = sb.stash.bind(sb, 'key2', noop, {});
    const stash3 = sb.stash.bind(sb, 'key3', noop, {});
    const unstashAll = sb.unstashAll.bind(sb, {});
    async.waterfall([stash1, stash2, stash3, unstashAll], (err, unstashed) => {
      ifError(err);
      eq(unstashed.length, 3);
      eq(sb.stats().stashed, 0);
    });
  });

  it('should reject duplicate keys', () => {
    const sb = stashback();
    const stash1 = sb.stash.bind(sb, 'key', noop, {});
    const stash2 = sb.stash.bind(sb, 'key', noop, {});
    async.series([stash1, stash2], (err) => {
      ok(err);
      eq(err.message, 'Duplicate key: key');
    });
  });

  it('should unstash an unknown key', () => {
    const sb = stashback();
    sb.unstash('key', {}, (err, unstashed) => {
      ok(err);
      eq(err.message, 'Unknown key: key');
      eq(typeof unstashed, 'function');
      unstashed();
    });
  });

  it('should expire callbacks after the stash timeout', function (test, done) {
    const callback = (err) => {
      ok(err);
      eq(err.message, 'Expired by stashback');
    };

    const sb = stashback();
    sb.stash('key', callback, { timeout: 300 }, (err) => {
      ifError(err);
      setTimeout(() => {
        sb.unstash('key', {}, (err) => {
          ok(err);
          eq(err.message, 'Unknown key: key');
          eq(sb.stats().expired, 1);
          done();
        });
      }, 400);
    });
  });

  it('should expire callbacks after the global timeout', function (test, done) {
    const callback = (err) => {
      ok(err);
      eq(err.message, 'Expired by stashback');
    };

    const sb = stashback({ timeout: 500 });
    sb.stash('key', noop, {}, (err) => {
      ifError(err);
      setTimeout(() => {
        sb.unstash('key', {}, (err) => {
          ok(err);
          eq(err.message, 'Unknown key: key');
          eq(sb.stats().expired, 1);
          done();
        });
      }, 600);
    });
  });

  it('should support custom duplicate key behaviour', function () {
    const sb = stashback({
      onDuplicateKey: (key, next) => {
        eq(key, 'key');
        next();
      },
    });

    async.series([(cb) => sb.stash('key', noop, {}, cb), (cb) => sb.stash('key', noop, {}, cb)], (err) => {
      eq(err, null);
    });
  });

  it('should support custom unknown key behaviour', function () {
    const sb = stashback({
      onUnknownKey: (key, next) => {
        eq(key, 'key');
        next();
      },
    });

    sb.unstash('key', {}, (err) => {
      eq(err, undefined);
    });
  });

  it('should support custom expiry behaviour', function () {
    const sb = stashback({
      timeout: 400,
      onExpiry: (key, callback) => {
        eq(key, 'key');
        eq(noop, callback);
      },
    });

    sb.stash('key', noop, {}, function (err) {
      ifError(err);
    });
  });
});
