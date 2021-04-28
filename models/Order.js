const mongoose = require('mongoose');
const shema = mongoose.Schema;

const orderShema =mongoose.Schema({
    user :{
        type : shema.Types.ObjectId,
        ref : 'User'
    },
    cart :{
        type :Object ,
        required : true
    } , 
    address :{
        type :String ,
        required : true
    },
    name :{
        type : String ,
        required : true
    },
    contact :{
        type :Number
    },
    paymentId :{
        type : String ,
        required :true
    },
    orderPrice :{
        type : Number ,
        required : true
    }

});

module.exports =mongoose.model('order' , orderShema);