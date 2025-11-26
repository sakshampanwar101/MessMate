const mongoose = require('mongoose');

const Food = mongoose.model('Food');

const MenuSchema = mongoose.Schema({
    name: {
        type: String,
        required: "Name can't be empty",
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Daily', 'Special', 'Seasonal', 'Custom'],
        default: 'Daily'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    activeFrom: Date,
    activeTo: Date,
    menuItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Food
    }]
}, { timestamps: true });

module.exports = mongoose.model('Menu', MenuSchema);