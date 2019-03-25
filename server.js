const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const routes = require('./src/api/routes')
const compression = require('compression')
const db = require('./src/db')
require('dotenv').config({silent: true})

const server = express()

var connectToDb = async () => {
    var result = await db;
    return result;
};

var startServer = async () => {
    console.log(`Server starting up...`)
    server.use(bodyParser.json())
    routes.use(compression())

    server.use('/api/v1', routes)

    server.get('/docs', (req, res) => {
        res.sendFile(path.join(__dirname, './public', 'docs.html'))
    })

    server.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, './public', 'index.html'))
    })

    server.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
};

connectToDb().then(() => {
    startServer()
});

module.exports = server





