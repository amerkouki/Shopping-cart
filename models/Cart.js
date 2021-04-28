const { model } = require('mongoose');
const mongoose = require('mongoose');

const cartSheme=mongoose.Schema({
    _id : {
        required : true ,
        type : String
    },
    totalQuantity :{
        required :true,
        type : Number
    },
    totalPrix :{
        required : true ,
        type : Number
    },
    selectedProduit :{
        required : true ,
        type : Array,
    },
    creatAt :{
        type :Date , 
        default :Date.now,
        index :{expires : '2m'}
    }
});



module.exports =mongoose.model('Cart',cartSheme);