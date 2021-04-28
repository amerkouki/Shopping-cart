const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const Cart = require('../models/Cart');

passport.serializeUser((user,done)=>{
return done(null,user.id);
});

passport.deserializeUser((id,done)=>{
     User.findById(id ,('email userName contact adress image') , (error,user)=> {
         Cart.findById(id , (error,cart)=>{
             if(! cart){
                return done(error,user);
             }
             user.cart = cart;
             return done(error,user);
         })
         
     })
})
passport.use('local-signin', new localStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    (req, email, password, done) => {
        User.findOne({ email: email }, (error, user) => {
            if (error) {
                return done(error);
            }
            if (!user) {
                return done(null, false, req.flash('signinError', 'this user not found'));
            }
            if (!user.comparePassword(password)) {
                return done(null, false, req.flash('signinError', 'woring password'));
            }
            return done(null, user);
        });

    }
));


passport.use('local-singup', new localStrategy(
    {
        usernameField :'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    (req, email , password ,done)=>{
User.findOne({ email: email},(err, user)=>{
    if(err){
        return done(err);
    }
    if(user){
        done(null,false,req.flash('singup-error','this email already exist'));
    }
    const newUser=new User({
        email : email,
        password : new User().hachPassword(password)
    });
    newUser.save((err,user)=>{
        if(err){
            return done(err);
        }
        return done(null,user);
    })
})
    }
))