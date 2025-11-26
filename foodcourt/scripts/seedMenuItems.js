require('../config/config');
require('../models/db');

const mongoose = require('mongoose');
const Food = mongoose.model('Food');

const MENU_ITEMS = [{
        name: 'Classic Masala Dosa',
        description: 'Crispy dosa stuffed with spiced potato filling and served with sambar.',
        unitPrice: 70,
        category: 'south-indian',
        isSpecial: true,
        pickupWindow: { start: '08:00', end: '11:30' }
    },
    {
        name: 'Paneer Butter Masala',
        description: 'Creamy tomato gravy with cottage cheese cubes. Served with butter naan.',
        unitPrice: 120,
        category: 'main-course',
        tags: ['vegetarian']
    },
    {
        name: 'MessMate Veg Thali',
        description: 'Two sabzi, dal, rice, roti, salad and dessert.',
        unitPrice: 95,
        category: 'thali'
    },
    {
        name: 'Hakka Noodles',
        description: 'Wok tossed noodles with crunchy vegetables.',
        unitPrice: 80,
        category: 'chinese'
    },
    {
        name: 'Grilled Sandwich Combo',
        description: 'Cheese & veggie sandwich with fries and mint mayo.',
        unitPrice: 65,
        category: 'snacks'
    },
    {
        name: 'Cold Coffee Frappe',
        description: 'Chilled coffee with ice-cream and chocolate drizzle.',
        unitPrice: 60,
        category: 'beverages',
        isSpecial: true,
        pickupWindow: { start: '10:00', end: '20:00' }
    },
    {
        name: 'Ghee Idli Platter',
        description: 'Mini idlis tossed in ghee podi with coconut chutney.',
        unitPrice: 55,
        category: 'south-indian',
        tags: ['gluten-free']
    },
    {
        name: 'Smoked Veg Burger',
        description: 'Char-grilled patty, cheddar cheese, caramelized onions.',
        unitPrice: 90,
        category: 'fast-food'
    },
    {
        name: 'Protein Power Bowl',
        description: 'Quinoa, sprouts, roasted veggies & yogurt dressing.',
        unitPrice: 110,
        category: 'healthy',
        tags: ['high-protein']
    },
    {
        name: 'Tandoori Chicken Tikka',
        description: 'Charred chicken tikka with mint chutney and onion salad.',
        unitPrice: 140,
        category: 'non-veg',
        tags: ['chef-special']
    }
];

const seedMenu = async() => {
    for (const item of MENU_ITEMS) {
        const existing = await Food.findOne({ name: item.name });
        if (existing) {
            console.log(`Skipping ${item.name} (already exists)`);
            continue;
        }
        const doc = new Food(item);
        await doc.save();
        console.log(`Added menu item: ${item.name}`);
    }
    mongoose.connection.close();
};

seedMenu().then(() => {
    console.log('Menu seeding complete.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

