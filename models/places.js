const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    address: {type: String, required: true},
    image: {type: String, required: false},  // will be stored as url
    location: {
        lat: {type: Number, required: false},
        lng: {type: Number, required: false}
    },
    creator: {type: String, required: true}
})

module.exports = mongoose.model('Place', PlaceSchema)