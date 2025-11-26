const mongoose = require('mongoose');

const QUEUE_STATUSES = ['Queued', 'Preparing', 'Ready', 'Collected', 'Cancelled'];

const StatusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: QUEUE_STATUSES,
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const NotificationSchema = new mongoose.Schema({
    channel: {
        type: String,
        default: 'in-app'
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const OrderSchema = mongoose.Schema({
    orderItems: [{
        food: {
            type: String,
            required: true
        },
        unitPrice: {
            type: Number,
            required: true,
            min: [0, 'Unit price must be positive']
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at-least 1'],
            default: 1
        }
    }],
    total: {
        type: Number,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: QUEUE_STATUSES,
        default: 'Queued'
    },
    queueNumber: {
        type: Number,
        index: true
    },
    ticketId: {
        type: String,
        unique: true
    },
    estimatedPickup: {
        type: Date
    },
    deliveryDate: {
        type: Date
    },
    pickupWindow: {
        start: Date,
        end: Date
    },
    specialInstructions: {
        type: String,
        trim: true
    },
    customer: {
        messId: {
            type: String,
            required: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        rollNumber: {
            type: String,
            required: true,
            trim: true
        },
        contact: {
            type: String,
            trim: true
        }
    },
    statusHistory: [StatusHistorySchema],
    notificationLog: [NotificationSchema],
    pickupNotifiedAt: Date,
    pickedUpAt: Date,
    paymentReferenceId: {
        type: String
    }
}, { timestamps: true });

OrderSchema.pre('save', function(next) {
    if (!this.total) {
        this.total = this.calculateOrderTotal(this.orderItems);
    }
    if (!this.date) {
        this.date = new Date();
    }
    if (!this.paymentReferenceId) {
        this.paymentReferenceId = this.constructor.generateTicketId('PAY');
    }
    if (!this.ticketId) {
        this.ticketId = this.constructor.generateTicketId('MM', this.queueNumber);
    }
    if (!this.statusHistory || !this.statusHistory.length) {
        this.statusHistory = [{
            status: this.status,
            note: 'Order created',
            changedAt: new Date()
        }];
    }
    next();
});

OrderSchema.methods.calculateOrderTotal = function(orderItems = []) {
    return Math.round(orderItems.reduce((total, item) => {
        const price = Number(item.unitPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        return total + price * quantity;
    }, 0));
};

OrderSchema.methods.logStatusChange = function(status, note) {
    if (!this.statusHistory) {
        this.statusHistory = [];
    }
    this.statusHistory.push({
        status,
        note,
        changedAt: new Date()
    });
};

OrderSchema.methods.recordNotification = function(message, channel = 'in-app') {
    if (!this.notificationLog) {
        this.notificationLog = [];
    }
    this.notificationLog.push({
        channel,
        message,
        createdAt: new Date()
    });
};

OrderSchema.statics.generateTicketId = function(prefix = 'MM', queueNumber) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 90) + 10;
    const queueLabel = typeof queueNumber === 'number' ? String(queueNumber).padStart(3, '0') : random;
    return `${prefix}-${y}${m}${d}-${queueLabel}-${random}`;
};

OrderSchema.statics.getNextQueueNumber = async function(serviceDate = new Date()) {
    const startOfDay = new Date(serviceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const lastOrder = await this.findOne({
        date: {
            $gte: startOfDay,
            $lt: endOfDay
        }
    }).sort({ queueNumber: -1 }).select('queueNumber').lean();
    return lastOrder && lastOrder.queueNumber ? lastOrder.queueNumber + 1 : 1;
};

module.exports = mongoose.model('Order', OrderSchema);