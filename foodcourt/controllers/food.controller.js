const mongoose = require('mongoose');

const Food = mongoose.model('Food');

const buildFoodPayload = (body = {}) => {
    const unitPrice = Number(body.unitPrice);
    return {
        name: body.name,
        description: body.description,
        unitPrice: unitPrice,
        category: body.category,
        isSpecial: body.isSpecial !== undefined ? body.isSpecial : false,
        available: body.available !== undefined ? body.available : true,
        pickupWindow: body.pickupWindow || undefined,
        tags: body.tags || []
    };
};

module.exports.addFoodItem = async(req, res) => {
    try {
        const payload = buildFoodPayload(req.body);
        if (isNaN(payload.unitPrice)) {
            return res.status(422).json({
                status: false,
                message: "unitPrice must be a number."
            });
        }
        const foodItem = new Food(payload);
        await foodItem.save();
        return res.status(201).json(foodItem);
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};

module.exports.updateFoodItem = async(req, res) => {
    try {
        const updates = buildFoodPayload(req.body);
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) delete updates[key];
        });

        if (updates.unitPrice !== undefined && isNaN(updates.unitPrice)) {
            return res.status(422).json({
                status: false,
                message: "unitPrice must be a number."
            });
        }

        const foodItem = await Food.findByIdAndUpdate(
            req.params.id, { $set: updates }, { new: true, runValidators: true }
        );

        if (!foodItem) {
            return res.status(404).json({
                status: false,
                message: "Food item not found."
            });
        }

        return res.status(200).json(foodItem);
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};

module.exports.getFoodItemById = async(req, res) => {
    try {
        const foodItem = await Food.findById(req.params.id).lean();
        if (!foodItem) {
            return res.status(404).json({
                status: false,
                message: "Food item not found."
            });
        }
        return res.status(200).json(foodItem);
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};

module.exports.getFoodItemByCategory = async(req, res) => {
    try {
        const query = {
            category: req.params.category
        };
        if (req.query.available) {
            query.available = req.query.available === 'true';
        }
        const foodItems = await Food.find(query).lean();
        return res.status(200).json(foodItems);
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};

module.exports.getAllFoodItems = async(req, res) => {
    try {
        const query = {};
        if (req.query.category) query.category = req.query.category;
        if (req.query.special) query.isSpecial = req.query.special === 'true';
        if (req.query.available) query.available = req.query.available === 'true';

        const foodItems = await Food.find(query).sort({
            isSpecial: -1,
            name: 1
        }).lean();
        return res.status(200).json(foodItems);
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};

module.exports.deleteFoodItem = async(req, res) => {
    try {
        const result = await Food.deleteOne({ _id: req.params.id });
        if (!result.deletedCount) {
            return res.status(404).json({
                status: false,
                message: "Food item not found."
            });
        }
        return res.status(200).json({
            status: true,
            message: "Item deleted"
        });
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};
