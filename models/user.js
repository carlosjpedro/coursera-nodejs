const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    facebookId: {
        type: String
    }
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)