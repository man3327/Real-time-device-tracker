const express = require('express')
const Device = require('../models/Device');
const Group = require('../models/Group');
const requireAuth = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);
router.post('/ensure' , async (req,res) => {
  try {
    const {groupId ,name} = req.body;
    if(!groupId ) return res.status(400).json({error : "GroupId is required"});
    const group = await Group.findById(groupId);
    if(!group || !group.members.some((m) => m.toString()===req.user.userId)){
        return res.status(400).json({message :'Not a member of this group'});
    }
    let device = await Device.findOne({owner : req.user.userId,group: groupId});
    if(!device){
        device = new Device({
            name : name|| `${req.user.username}'s device`,
            owner : req.user.userId,
            group : groupId
        })
    }
    await device.save();
    res.json(device);
  } catch (error) {
    res.status(500).json({error : error.message});
  }
});
module.exports = router;
