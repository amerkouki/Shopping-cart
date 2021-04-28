var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const mongoose=require('mongoose');
const expressHbs=require('express-handlebars');
const session =require('express-session');
const flash=require('connect-flash');
const passport=require('passport');



const { appendFile } = require('fs');
//const expressValidator=require('express-validator');

var app = express();

mongoose.connect('mongodb://localhost/Shopping_cart',{ useNewUrlParser: true ,useCreateIndex : true ,useUnifiedTopology:true} ,(error)=>{
  if(error){
    console.log(error)
  }
  else{
  console.log('connected db');
}
});

require('./config/passport');

// view engine setup
app.engine('.hbs',expressHbs({defaultLayout:'layout',extname:'.hbs' , helpers :{
  add : function(value){return value+1;},
  checkQuantity : function(val){
    if(val<=1){return true;}
    else{return false;}
  }

}}));
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

app.use('/scripts', express.static(__dirname ));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(expressValidator());
app.use(cookieParser());
app.use(session(
  {
    secret : 'Shopping-cart_?@!',
    saveUninitialized : false,
    resave : true
  }
));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));




app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
