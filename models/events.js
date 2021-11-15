const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    date: String,
    description: String,
    special: Boolean 
})

const Events = mongoose.model('Events', eventSchema)

module.exports = Events;