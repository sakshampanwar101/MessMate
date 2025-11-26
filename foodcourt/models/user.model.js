const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['student', 'staff', 'admin'];

const UserSchema = mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ROLES,
        required: true
    },
    profile: {
        messId: { type: String, trim: true },
        rollNumber: { type: String, trim: true },
        contact: { type: String, trim: true }
    }
}, { timestamps: true });

UserSchema.methods.verifyPassword = function(password) {
    return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

module.exports = mongoose.model('User', UserSchema);

