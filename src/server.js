const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const routes = require('./api/routes')
const compression = require('compression')
require('dotenv').config({silent: true})

console.log(`Server starting up...`)

const startServer = async () => {
    const server = express()

    server.use(bodyParser.json())
    routes.use(compression())

    server.use('/api/v1', routes)

    server.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'index.html'))
    })

    await mongoose.connect(process.env.MONGO_HOST, {
        useNewUrlParser: true,
        useCreateIndex: true,
    }).then(() => {
        console.log(`Connected to MongoDB`)
    })

    server.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
}

startServer()

