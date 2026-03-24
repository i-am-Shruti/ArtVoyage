const mongoose = require('mongoose');

const userInfoPaySchema = new mongoose.Schema({
  userEmail: { 
    type: String, 
    default: null 
  },
  MuseumHeader: { 
    type: String, 
    required: true 
  },
  Date: { 
    type: Date, 
    required: true 
  },
  SelectedNationality: { 
    type: String, 
    required: true 
  },
  NationalityPrice: { 
    type: String, 
    required: true 
  },
  Item: { 
    type: String, 
    required: true 
  },
  ItemValue: { 
    type: String, 
    required: true 
  },
  Document: { 
    type: String, 
    required: true 
  },
  DocumentNumber: { 
    type: String, 
    required: true 
  },
  AdultNames: { 
    type: String, 
    default: '' 
  },
  ChildNames: { 
    type: String, 
    default: '' 
  },
  totalPrice: { 
    type: String, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'success', 'failed'],
    default: 'pending' 
  },
  merchantTransactionId: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true 
});

userInfoPaySchema.index({ DocumentNumber: 1, Date: 1 });
userInfoPaySchema.index({ merchantTransactionId: 1 });
userInfoPaySchema.index({ userEmail: 1 });

const UserInfoPay = mongoose.model('UserInfoPay', userInfoPaySchema);
module.exports = UserInfoPay;
