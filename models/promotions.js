const mongoose = require('mongoose')
require('mongoose-currency').loadType(mongoose)

const Currency = mongoose.Types.Currency

const promosSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    }
},
{
    usePushEach: true
})

var Promotions = mongoose.model('Promotions', promosSchema)

module.exports = Promotions