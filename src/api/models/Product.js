const mongoose = require('mongoose')

const schema = new mongoose.Schema(
    {
        product_id: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: false
        },
        current_price: {
            value: {
                type: mongoose.Schema.Types.Decimal128,
                required: true,
            },
            currency_code: {
                type: String,
                uppercase: true,
                required: true,
            }
        },
    },
    {
        strict: false,
    }
)

module.exports = mongoose.model('Product', schema)