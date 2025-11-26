require('../config/config');
require('../models/db');

const mongoose = require('mongoose');
const User = mongoose.model('User');

const DEFAULT_USERS = [{
        identifier: 'admin001',
        name: 'Mess Admin',
        role: 'admin',
        password: 'Admin@123',
        profile: {
            contact: 'admin@messmate.local'
        }
    },
    {
        identifier: 'kitchen001',
        name: 'Kitchen Staff',
        role: 'staff',
        password: 'Kitchen@123',
        profile: {
            contact: 'kitchen@messmate.local'
        }
    },
    {
        identifier: 'MM-1023',
        name: 'Student Test',
        role: 'student',
        password: 'Student@123',
        profile: {
            messId: 'MM-1023',
            rollNumber: '102303019',
            contact: '9876543210'
        }
    }
];

const seed = async() => {
    for (const user of DEFAULT_USERS) {
        const existing = await User.findOne({ identifier: user.identifier });
        if (existing) {
            console.log(`Skipping ${user.identifier} (already exists)`);
            continue;
        }
        const passwordHash = await User.hashPassword(user.password);
        const doc = new User({
            identifier: user.identifier,
            name: user.name,
            role: user.role,
            profile: user.profile,
            passwordHash
        });
        await doc.save();
        console.log(`Created ${user.role} account: ${user.identifier} / ${user.password}`);
    }
    mongoose.connection.close();
};

seed().then(() => {
    console.log('Seeding complete.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

