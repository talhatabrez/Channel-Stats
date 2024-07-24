const express = require('express');
const router = express.Router();
const Subscriber = require('../models/subscriber');
const {jwtAuthMiddleware, generateToken} = require('../jwt');

//to sign into a new subscriber
router.post('/signup', async(req, res) => {
    try{
        const data = req.body; //body contains the user data
        const adminUser = await Subscriber.findOne({role: 'admin'}); //check if there is only one admin
        if(data.role == 'admin' && adminUser){
            return res.status(400).json({error: 'Admin already exists, only one admin must exist..'})
        }

        //creating a new subscriber
        const newSubscriber = await Subscriber(data);
        const response = await newSubscriber.save();
        console.log('Subscriber recorded');

        const payLoad = {
            id: response.id
        }
        console.log(JSON.stringify(payLoad));
        const token = generateToken(payLoad);
        
        res.status(200).json({ response : response, token: token});
    } catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
})

//route for logging in
router.post('/login', async(req, res) => {
    try{
        //taking the email and password from request
        const {email, password} = req.body;

        //check if there is anything missing
        if(!email || !password){
            return res.status(400).json({error: 'Missing Credentials'});
        }

        //finding the user
        const subscriber = await Subscriber.findOne({email: email});

        //to generate the token
        const payLoad = {
            id: subscriber.id
        }
        const token = generateToken(payLoad);

        //response 
        res.json({token});
    } catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
})

//route for getting into the profile
router.get('/profile', jwtAuthMiddleware, async(req, res) => {
    try{
        const subscriberData = req.subscriber;
        console.log('Subscriber Data:', subscriberData); // Add this line to debug
        const subscriberId = subscriberData._id; // Use _id if that's the property name
        console.log('Subscriber ID:', subscriberId);
        const subscriber = await Subscriber.findById(subscriberId);
        res.status(200).json({subscriber});
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
})

module.exports = router;