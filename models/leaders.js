const mongoose = require('mongoose')
require('mongoose-currency').loadType(mongoose)

const Currency = mongoose.Types.Currency

const leadersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    abbr: {
        type: String,
        required: true
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
    }
)




var Leaders = mongoose.model('Leaders', leadersSchema)

module.exports = Leaders