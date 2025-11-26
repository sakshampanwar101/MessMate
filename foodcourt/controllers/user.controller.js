const mongoose = require('mongoose');

const User = mongoose.model('User');

const sanitizeUser = (user) => ({
    id: user._id,
    identifier: user.identifier,
    name: user.name,
    role: user.role,
    profile: user.profile,
    createdAt: user.createdAt
});

module.exports.listUsers = async(req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).lean();
        return res.status(200).json(users.map(user => ({
            id: user._id,
            identifier: user.identifier,
            name: user.name,
            role: user.role,
            profile: user.profile,
            createdAt: user.createdAt
        })));
    } catch (err) {
        return next(err);
    }
};

module.exports.createUser = async(req, res, next) => {
    try {
        const { identifier, name, password, role, profile } = req.body;
        if (!identifier || !name || !password || !role) {
            return res.status(422).json({
                status: false,
                message: "identifier, name, password and role are required."
            });
        }
        const existing = await User.findOne({ identifier });
        if (existing) {
            return res.status(409).json({
                status: false,
                message: "Identifier already exists."
            });
        }
        const passwordHash = await User.hashPassword(password);
        const doc = new User({
            identifier,
            name,
            role,
            profile,
            passwordHash
        });
        await doc.save();
        return res.status(201).json(sanitizeUser(doc));
    } catch (err) {
        return next(err);
    }
};

module.exports.updateUserRole = async(req, res, next) => {
    try {
        const { role, profile } = req.body;
        if (!role) {
            return res.status(422).json({
                status: false,
                message: "role is required."
            });
        }
        const updated = await User.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                role,
                profile: profile || undefined
            }
        }, { new: true }).lean();

        if (!updated) {
            return res.status(404).json({
                status: false,
                message: "User not found."
            });
        }
        return res.status(200).json(sanitizeUser(updated));
    } catch (err) {
        return next(err);
    }
};

module.exports.deleteUser = async(req, res, next) => {
    try {
        const result = await User.deleteOne({ _id: req.params.id });
        if (!result.deletedCount) {
            return res.status(404).json({
                status: false,
                message: "User not found."
            });
        }
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

