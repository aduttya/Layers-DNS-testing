import mongoose from 'mongoose';
import Contract from './contracts';

var user = new mongoose.Schema({
  address : {
    type : String,
    unique : true,
    index : true
  },
  contracts: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Contract'
  }]
});

module.exports = mongoose.models.User || mongoose.model('User',user)
