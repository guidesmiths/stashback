const stashback = require('..')();
const express = require('express');
const { v4: uuid } = require('uuid');
const exchange = require('./exchange')(stashback);

const app = express();

app.get('/greet/:id', (req, res, next) => {
  const callbackId = uuid();
  stashback.stash(
    callbackId,
    (err, user) => {
      if (err) return next(err);
      res.send(`Hello ${user.name}`);
    },
    { timeout: req.query.timeout },
    (err) => {
      if (err) return next(err);
      exchange.publish({ callbackId, userId: req.params.id });
    }
  );
});

app.listen(3000);

console.log('Try...');
console.log('open http://localhost:3000/greet/1234');
console.log('open http://localhost:3000/greet/1234?timeout=500');
