const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const tldr = require('node-tldr')
const summary = require('node-summary')
const { Wit, log } = require('node-wit')

/**
 * You'll use your own key here instead. I'm requiring it
 * from a file so I can test this code without publishing
 * my own private key.
 */
const { YOUR_WIT_ACCESS_TOKEN } = require('./keys')

app.use(bodyParser.json())

app.get('/api/wiggum', (req, res) => {
    // Get the url from the query. Throw an error if undefined
    const url = req.query['url']
    if (url === undefined) res.status(500).send({ error: 'url is undefined' })
    // Initialize your Wit.ai client
    const client = new Wit({
        accessToken: YOUR_WIT_ACCESS_TOKEN,
        logger: new log.Logger(log.DEBUG)
    })
    // Use node-tldr to summarize the content of the url
    tldr.summarize(url, (result, err) => {
        if (err) {
            res.status(500).send(err)
        } else {
            // Set the message we want to send to Wit.ai
            let message = '';
            // Try using the title and summary together
            if (result.title !== '' && result.summary.length > 0) {
                message = `${result.title.substring(0, 59)}. ${result.summary.join(' ').substring(0, 219)}`
            // Or just the summary
            } else if (result.summary.length > 0) {
                message = result.summary.join(' ').substring(0, 279)
            // Or just the title
            } else if (result.title !== '') {
                message = result.title.substring(0, 279)
            }
            // If the message never got set, send an error
            if (message === '') {
                res.status(500).send({ url, error: 'No title or summary' })
            // Otherwise, send the message to Wit.ai and send the response back to AdWords
            } else {
                client.message(message)
                    .then(data => res.send({ url, ...data }))
                    .catch(err => res.status(500).send(err))
            }
        }
    })
})

const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000
app.listen(port, () => {
    console.log('Server running at http://localhost:%s', port)
})