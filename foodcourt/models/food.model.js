const mongoose = require('mongoose');

const FoodSchema = mongoose.Schema({
    name: {
        type: String,
        required: "Name can't be empty",
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    unitPrice: {
        type: Number,
        min: [0, 'Unit price must be a positive number'],
        required: "Unit price can't be empty"
    },
    category: {
        type: String,
        required: "Category can't be empty",
        trim: true
    },
    isSpecial: {
        type: Boolean,
        default: false
    },
    available: {
        type: Boolean,
        default: true
    },
    pickupWindow: {
        start: { type: String, trim: true },
        end: { type: String, trim: true }
    },
    tags: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });

module.exports = mongoose.model('Food', FoodSchema);