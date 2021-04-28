const mongoose=require('mongoose');

produitShema=mongoose.Schema({
    imagePath:{
        type:String,
        required:true
    },
    produitName:{
        type:String,
        required:true
    },
    information:{
        type:{
            storegeCapacity:Number,
            numberOfSIM:String,
            cameraResolution:Number,
            displySize:Number
        },
        required:true
    },
    prix:{
        type:Number,
        required:true
    }
});

module.exports =mongoose.model('Produit',produitShema);