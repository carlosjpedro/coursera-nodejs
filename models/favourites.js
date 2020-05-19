const mongoose = require('mongoose')

const favouritesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dishes: [{
        type: mongoose.Types.ObjectId,
        ref: 'Dish'
    }]
})

module.exports = mongoose.model('Favourites', favouritesSchema)