const express = require('express');
const router = express.Router();
const csrf = require('csurf');

const ctrlFood = require('../controllers/food.controller');
const ctrlMenu = require('../controllers/menu.controller');
const ctrlCart = require('../controllers/cart.controller');
const ctrlOrder = require('../controllers/order.controller');
const ctrlFeedback = require('../controllers/feedback.controller');
const ctrlAuth = require('../controllers/auth.controller');
const ctrlUsers = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/test', (req, res, next) => {
    res.status(200).send('Success route connection');
});


// Auth routes
router.post('/auth/register', ctrlAuth.register);
router.post('/auth/login', ctrlAuth.login);
router.post('/auth/logout', ctrlAuth.logout);
router.get('/auth/me', ctrlAuth.me);

// Food routes
router.get('/food-item/:id', ctrlFood.getFoodItemById);
router.get('/food-items/:category', ctrlFood.getFoodItemByCategory);
router.get('/food-items', ctrlFood.getAllFoodItems);
router.post('/food-item', requireRole(['admin']), ctrlFood.addFoodItem);
router.put('/food-item/:id', requireRole(['admin']), ctrlFood.updateFoodItem);
router.delete('/food-item/:id', requireRole(['admin']), ctrlFood.deleteFoodItem);

// Menu routes
router.get('/menus', ctrlMenu.getAllMenus);
router.get('/menu/:name', ctrlMenu.getMenuByName);
router.post('/menu', requireRole(['admin']), ctrlMenu.addMenu);
router.put('/menu/:name', requireRole(['admin']), ctrlMenu.updateMenu);
router.delete('/menu/:name', requireRole(['admin']), ctrlMenu.deleteMenu);

// Cart routes
router.post('/cart/add', requireRole(['student']), ctrlCart.addCartItem);
router.get('/cart', requireRole(['student']), ctrlCart.getCart);
router.delete('/cart', requireRole(['student']), ctrlCart.deleteCart);
router.delete('/cart/item/:id', requireRole(['student']), ctrlCart.removeCartItem);

// Order routes
router.post('/order/create', requireRole(['student']), ctrlOrder.createOrder);
router.get('/orders', requireRole(['admin', 'staff']), ctrlOrder.getOrders);
router.get('/order', requireAuth, ctrlOrder.getOrder);
router.get('/order/ticket/:ticketId', ctrlOrder.trackOrderByTicket);
router.get('/order/history', requireRole(['student']), ctrlOrder.getStudentOrders);
router.get('/queue', requireRole(['staff', 'admin']), ctrlOrder.getQueueSnapshot);
router.patch('/order/:id/status', requireRole(['staff', 'admin']), ctrlOrder.updateOrderStatus);
router.patch('/order/:id/cancel', requireAuth, ctrlOrder.cancelOrder);

// Feedback routes
router.post('/feedback', ctrlFeedback.createFeedback);
router.get('/feedbacks', ctrlFeedback.getFeedbacks);
router.get('/feedback', ctrlFeedback.getFeedback);

// User admin routes
router.get('/users', requireRole(['admin']), ctrlUsers.listUsers);
router.post('/users', requireRole(['admin']), ctrlUsers.createUser);
router.patch('/users/:id', requireRole(['admin']), ctrlUsers.updateUserRole);
router.delete('/users/:id', requireRole(['admin']), ctrlUsers.deleteUser);

// Reports
router.get('/reports/orders', requireRole(['admin']), ctrlOrder.getOrderReport);

module.exports = router;