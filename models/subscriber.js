const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: Number
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['subscriber', 'admin'],
        default: 'subscriber'
    }
});

userSchema.pre('save', async function(next){
    const person = this;

    //hashing the password only if modified
    if(!person.isModified('password')) return next();
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(person.password, salt);
        person.password = hashedPassword;
        next();
    } catch(err){
        return next(err);
    }
});

const Subscriber = mongoose.model('Subscriber', userSchema);
module.exports = Subscriber;