const mongoose = require('mongoose')
require('dotenv').config({silent: true})

connectToDb = async () => {
    const connection_string = (process.env.NODE_ENV === 'test') ? process.env.MONGO_HOST_TEST : process.env.MONGO_HOST

    await mongoose.connect(connection_string, {
        useNewUrlParser: true,
        useCreateIndex: true,
    }).then(() => {
        console.log(`Connected to ${(process.env.NODE_ENV === 'test') ? 'test ' : ''}MongoDB`)
    }).catch((err) => {
        console.log(`Error connecting to ${(process.env.NODE_ENV === 'test') ? 'test ' : ''}MongoDB ${err}`)
        process.exit(1)
    })
} 

var db = connectToDb()

module.exports = db