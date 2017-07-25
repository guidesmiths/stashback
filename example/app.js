var stashback = require('..')()
var express = require('express')
var format = require('util').format
var uuid = require('uuid').v4
var exchange = require('./exchange')(stashback)

var app = express()

app.get('/greet/:id', function(req, res, next) {
    var callbackId = uuid()
    stashback.stash(callbackId, function(err, user) {
        if (err) return next(err)
        res.send(format('Hello %s\n', user.name))
    }, { timeout: req.query.timeout }, function(err) {
        if (err) return next(err)
        exchange.publish({ callbackId: callbackId, userId: req.params.id })
    })
})

app.listen(3000)

console.log('Try...')
console.log('open http://localhost:3000/greet/1234')
console.log('open http://localhost:3000/greet/1234?timeout=500')
