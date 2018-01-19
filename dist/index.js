'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var tldr = require('node-tldr');
var summary = require('node-summary');

var _require = require('node-wit'),
    Wit = _require.Wit,
    log = _require.log;

/**
 * You'll use your own key here instead. I'm requiring it
 * from a file so I can test this code without publishing
 * my own private key.
 */


var _require2 = require('./keys'),
    YOUR_WIT_ACCESS_TOKEN = _require2.YOUR_WIT_ACCESS_TOKEN;

app.use(bodyParser.json());

app.get('/api/wiggum', function (req, res) {
    // Get the url from the query. Throw an error if undefined
    var url = req.query['url'];
    if (url === undefined) res.status(500).send({ error: 'url is undefined' });
    // Initialize your Wit.ai client
    var client = new Wit({
        accessToken: YOUR_WIT_ACCESS_TOKEN,
        logger: new log.Logger(log.DEBUG)
    });
    // Use node-tldr to summarize the content of the url
    tldr.summarize(url, function (result, err) {
        if (err) {
            res.status(500).send(err);
        } else {
            // Set the message we want to send to Wit.ai
            var message = '';
            // Try using the title and summary together
            if (result.title !== '' && result.summary.length > 0) {
                message = result.title.substring(0, 59) + '. ' + result.summary.join(' ').substring(0, 219);
                // Or just the summary
            } else if (result.summary.length > 0) {
                message = result.summary.join(' ').substring(0, 279);
                // Or just the title
            } else if (result.title !== '') {
                message = result.title.substring(0, 279);
            }
            // If the message never got set, send an error
            if (message === '') {
                res.status(500).send({ url: url, error: 'No title or summary' });
                // Otherwise, send the message to Wit.ai and send the response back to AdWords
            } else {
                client.message(message).then(function (data) {
                    return res.send(_extends({ url: url }, data));
                }).catch(function (err) {
                    return res.status(500).send(err);
                });
            }
        }
    });
});

var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;
app.listen(port, function () {
    console.log('Server running at http://localhost:%s', port);
});