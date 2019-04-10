'use strict'
const fs = require('fs')
const express = require('express')
const expressjwt = require('express-jwt')
const jwt = require('jsonwebtoken');
const config = require('./configs/configs')
const bodyParser = require('body-parser')
const app = express()

var privateKEY  = fs.readFileSync('./configs/private.key', 'utf8');
var publicKEY  = fs.readFileSync('./configs/public.key', 'utf8');


app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

// all get protected by jwt otherwise for getToken
app.use(expressjwt({
    secret: privateKEY   
}).unless({
    path: ['/getToken']
}));

// error handling for unauthorized Error
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {   
    res.status(401).send('invalid token...');
  }
});

app.get('/getToken', function (req, res) {
    console.log('ip');
    console.log(req.ip);
    res.json({
        result: 'ok',
        token: jwt.sign({
            name: "Shaochi Zhou",
            data: "some sample json data here"
        }, privateKEY, {
                expiresIn: 60 * 1
            })
    })
});

app.get('/getData', function (req, res) {
    res.status(200)
    res.send(req.body.data)
});

var server = app.listen(50001, function() {
    console.log("App started on port 50001");
});

module.exports = server;