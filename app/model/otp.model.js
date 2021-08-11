const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    
    phone: {

        type:String,
        required : true

    },
    email : {
        type:String,
        required:true
    },
    phoneotp:{
     
        type:Number,
       
    },
    expiration_time:{
        type:Date
    }

  });

  module.exports = mongoose.model('OTP', otpSchema);