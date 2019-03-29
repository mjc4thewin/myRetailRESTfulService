"use strict";
const db = require('../src/db')

describe('All tests', () => {
  it('should pass', () => {
    return db
      .then(() => {
        require('./products')
      }).catch((err) => {
        console.log(err)
      })
  })
})