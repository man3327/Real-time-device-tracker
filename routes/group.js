const express = require('express');
const Group = require('../models/Group');
const requireAuth = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = new Group({
      name,
      owner: req.user.userId,
      members: [req.user.userId], 
    });
    await group.save();

    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating group' });
  }
});

router.post('/join', async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required' });
    }

    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }
    if (!group.members.includes(req.user.userId)) {
      group.members.push(req.user.userId);
      await group.save();
    }

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error joining group' });
  }
});
router.get('/mine', async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.userId });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching groups' });
  }
});
module.exports = router;