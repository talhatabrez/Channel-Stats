const express = require('express');
const router = express.Router();
const Subscriber = require('../models/subscriber');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Creator = require('../models/creator');

//checking if the role of the data is 'admin'
const checkAdminRole = async(subscriberId) => {
    try{
        const subscriber = await Subscriber.findById(subscriberId);
        if(subscriber.role === 'admin'){
            return true;
        }
    }catch(err){
        return false;
    }
}

//route to create a new creator
router.post('/', jwtAuthMiddleware, async(req, res) => {
    try{
        if(!(await checkAdminRole(req.subscriber.id))){
            return res.status(403).json({error: 'You do not have admin role'});
        }
        const data = req.body //taking the data from req
        const newCreator = new Creator(data); //creating new creator with mongoose model

        const response = await newCreator.save(); //saving the data
        console.log('Creator Saved');
        res.status(200).json({response: response});
    } catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

//route to updating creator data
router.put('/:profileID', jwtAuthMiddleware, async(req, res) => {
    try{
        if(!checkAdminRole(req.subscriber.id)) return res.status(403).json({error: 'You do not have admin role'});

        const profileID = req.params.profileID; //take input from the urls
        const updatedCreatorData = req.body; //for updating the data

        const response = await Creator.findByIdAndUpdate(profileID, updatedCreatorData, {
            new: true, //returns new updated data
            runValidators: true, //runs mongoose validation
        })

        if(!response){
            return res.status(400).json({error: 'Creator not found'});
        }

        console.log('Creator Data Updated');
        return res.status(200).json(response);
    } catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

//route to delete a creator
router.delete('/:profileID', jwtAuthMiddleware, async(req, res) => {
    try{
        if(!checkAdminRole(req.subscriber.id)) return res.status(403).json({error: 'You do not have admin role'});
        
        const profileID = req.params.profileID; //taking the input id from url
        const response = await Creator.findByIdAndDelete(profileID);

        if(!response){
            return res.status(400).json({error: 'Creator not found'});
        }

        console.log('Creator Data Deleted');
        return res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

//route to subscribe a creator
router.get('/subscriber/:profileID', jwtAuthMiddleware, async(req, res) => {
    profileID = req.params.profileID;
    subscriberId = req.subscriber.id;
    try{
        //base cases: - creator not found - subscriber not found - admin is trying to subscribe
        const creator = await Creator.findById(profileID);
        if(!creator){
            return res.status(404).json({message: 'Creator not found'});
        }

        const subscriber = await Subscriber.findById(subscriberId);
        if(!subscriber){
            return res.status(404).json({message: 'Subscriber not found'});
        }

        if(subscriber.role == 'admin'){
            return res.status(404).json({message: 'Admin not allowed'});
        }

        creator.subscriber.push({subscriber: subscriberId});
        creator.subscriptionCount++;
        await creator.save();
        
        return res.status(200).json({message: 'Subscribed succesfully'});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

//route to get the no.of subscribers
router.get('/subscribers', async (req, res) => {
    try{
        const creator = await Creator.find().sort({subscriptionCount: 'desc'});

        const subscriberRecord = creator.map((data)=>{
            return {
                channel: data.channel,
                subscriptionCount: data.subscriptionCount
            }
        });
        return res.status(200).json(subscriberRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
