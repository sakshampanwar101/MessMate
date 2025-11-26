const mongoose = require('mongoose');

const Menu = mongoose.model('Menu');

const buildMenuPayload = (body = {}) => ({
    name: body.name,
    menuItems: body.menuItems || [],
    type: body.type || 'Daily',
    isActive: body.isActive !== undefined ? body.isActive : true,
    activeFrom: body.activeFrom || undefined,
    activeTo: body.activeTo || undefined
});

module.exports.addMenu = async(req, res) => {
    try {
        const payload = buildMenuPayload(req.body);
        if (!payload.name) {
            return res.status(422).json({
                status: false,
                message: "Menu name is required."
            });
        }
        const menu = new Menu(payload);
        await menu.save();
        const populated = await menu.populate('menuItems');
        return res.status(201).json(populated);
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};

module.exports.updateMenu = async(req, res) => {
    try {
        const updates = buildMenuPayload(req.body);
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) delete updates[key];
        });

        const menu = await Menu.findOneAndUpdate(
            { name: req.params.name },
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('menuItems');

        if (!menu) {
            return res.status(404).json({
                status: false,
                message: "Menu not found."
            });
        }

        return res.status(200).json(menu);
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};

module.exports.getMenuByName = async(req, res) => {
    try {
        const menu = await Menu.findOne({ name: req.params.name }).populate('menuItems').lean();
        if (!menu) {
            return res.status(404).json({
                status: false,
                message: "Menu not found."
            });
        }
        return res.status(200).json(menu);
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};

module.exports.getAllMenus = async(req, res) => {
    try {
        const filter = {};
        if (req.query.type) filter.type = req.query.type;
        if (req.query.active) filter.isActive = req.query.active === 'true';
        const menus = await Menu.find(filter).populate('menuItems').sort({
            isActive: -1,
            updatedAt: -1
        }).lean();
        return res.status(200).json(menus);
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};

module.exports.deleteMenu = async(req, res) => {
    try {
        const result = await Menu.deleteOne({ name: req.params.name });
        if (!result.deletedCount) {
            return res.status(404).json({
                status: false,
                message: "Menu not found."
            });
        }
        return res.status(200).json({
            status: true,
            message: "Menu deleted"
        });
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
};
