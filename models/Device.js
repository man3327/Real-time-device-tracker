const mongoose = require('mongoose');
const deviceSchema = new mongoose.Schema({
  name:{
    type:String,
    required: true,
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  group:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  lastLocation: {
    lat: { type: Number },
    lng:{type:Number},
    updatedAt:{type: Date },
  },
},{timestamps: true});
module.exports=mongoose.model('Device', deviceSchema);