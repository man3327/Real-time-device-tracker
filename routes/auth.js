const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
router.post('/register', async (req, res) => {
  try{
    const {username,email,password} = req.body;
    if (!username || !email || !password){
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing){
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = new User({username, email, password });
    await user.save();

    res.status(201).json({ message:'User registered successfully' });
  }catch (err){
    console.error('Registration error:', err.message, err.stack);
    res.status(500).json({ message:'Server error during registration', error: err.message });
  }
});
router.post('/login', async (req, res) => {
  try{
    const {email,password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user){
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch){
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token =jwt.sign(
      {userId:user._id,username: user.username },
      process.env.JWT_SECRET,
      {expiresIn:'7d'}
    );

    res.json({token,user:{ id: user._id, username: user.username, email: user.email } });
  } catch (err){
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;