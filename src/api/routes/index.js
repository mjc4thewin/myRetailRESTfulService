"use strict";
const PromiseRouter = require('express-promise-router')
const products = require('./products')

const router = new PromiseRouter()

products(router)

module.exports = router

