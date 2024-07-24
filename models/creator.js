const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    subscriber: [
        {
            subscriber: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subscriber',
                required: true
            },
            subscribedAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    subscriptionCount: {
        type: Number,
        default: 0
    }
})

const Creator = mongoose.model('Creator', creatorSchema);
module.exports = Creator;