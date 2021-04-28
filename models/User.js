const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const userShema=mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
    ,
    userName :{
        type: String
    },
    contact :{
        type: Number
    },
    adress :{
        type: String
    },
    image:{
        type : String,
        default : '/upload/defaultAvatar.png'
    }

});


userShema.methods.hachPassword=function(password){
    return bcrypt.hashSync(password , bcrypt.genSaltSync(5) , null);
}
userShema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password , this.password);
}

module.exports =mongoose.model('User',userShema);