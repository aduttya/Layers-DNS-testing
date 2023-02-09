import mongoose from 'mongoose';

var contract = new mongoose.Schema({
    address : {
      type : String,
      default : null
    },
    client : {
      address : {
        type : String,
        default:null
      },
      signature : {
        type : String,
        default:null
      },
      signatureTimestamp : {
        type : String,
        default:null
      }
  },
  freelancer : {
    address : {
      type : String,
      default:null
    },
    signature : {
      type : String,
      default:null
    },
    signatureTimestamp : {
      type : String,
      default:null
    }
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'disapproved'],
    default: 'pending',
  }
});

module.exports = mongoose.models.Contract || mongoose.model('Contract',contract)
