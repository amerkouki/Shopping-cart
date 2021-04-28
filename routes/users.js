var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const passpoet = require('passport');
const passport = require('passport');
const csurf = require('csurf');
const Order = require('../models/Order');
const multer = require('multer');
const fs = require('fs');

const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  }
  else {
    cb(new Error('please upload png/jpg/jpeg image'), false);
  }
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload/')
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id+file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1204 * 5
  },
  fileFilter: fileFilter
});

router.use(upload.single('file'), (err, req, res, next) => {
  if (err) {

    req.flash('profileImageError', [err.message]);
    res.redirect('profile');
  }
});
router.use(csurf());


/* GET users listing. */
router.get('/singup', isNotSignin, function (req, res, next) {
  var messagesError = req.flash('singup-error')
  res.render('user/singup', { messages: messagesError, token: req.csrfToken() });
});

router.post('/singup',
  [
    check('email').not().isEmpty().withMessage('please enter your email'),
    check('email').isEmail().withMessage('please enter valid email'),
    check('password').not().isEmpty().withMessage('please enter your password'),
    check('password').isLength({ min: 5 }).withMessage('please enter your passwors more than 5 char'),
    check('confirm-password').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('password and confirm-password not matched');
      }
      return true;
    })
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      validationMessages = [];
      for (var i = 0; i < errors.errors.length; i++) {
        validationMessages.push(errors.errors[i].msg);
      }
      req.flash('singup-error', validationMessages);
      res.redirect('singup');
      return;
    }
    next();
  }, passport.authenticate('local-singup', {
    session: false,
    successRedirect: 'signin',
    failureRedirect: 'singup',
    failureMessage: true
  }));

router.get('/profile', isSignin, function (req, res, next) {
  if (req.user.cart) {
    totalProduit = req.user.cart.totalQuantity;
  }
  else {
    totalProduit = 0
  }


  Order.find({ user: req.user._id }, (err, doc) => {
    if (err) {
      console.log(err);
    }
    var messageError = req.flash('profile-error');
    var messageEmailError = req.flash('updateEmail-error');
    var messagePasswordError = req.flash('updatePassword-error');
    var hasMessageError = false;
    var hasMessageEmailError = false;
    var hasMessagePasswordError = false;
    var messageImage = req.flash('profileImageError');

    if (messageError.length > 0) { hasMessageError = true; }
    if (messageEmailError.length > 0) { hasMessageEmailError = true; }
    if (messagePasswordError.length > 0) { hasMessagePasswordError = true; }


    res.render('user/profile', {
      messages: req.flash('error'),
      checkuser: true,
      checkProfile: true,
      userOrder: doc,
      totalProduit: totalProduit,
      token: req.csrfToken(),
      messageError: messageError,
      hasMessageError: hasMessageError,
      hasMessageEmailError: hasMessageEmailError,
      messagePasswordError: messagePasswordError,
      hasMessagePasswordError: hasMessagePasswordError,
      messageEmailError: messageEmailError,
      messageImage: messageImage,
      user: req.user

    })

  });
});

/**
 * post 
 * update user 
 * ***test de validation des champs
 * *** push les errors dan s un tableux
 * 
 */

router.post('/updateUser',
  [

    check('userName').not().isEmpty().withMessage('please enter your User Name'),
    check('contact').not().isEmpty().withMessage('please enter your Contact'),
    check('adress').not().isEmpty().withMessage('please enter your Adress')
  ], (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      validationMessages = [];
      for (var i = 0; i < errors.errors.length; i++) {
        validationMessages.push(errors.errors[i].msg);
      }
      req.flash('profile-error', validationMessages);
      res.redirect('profile');
      return;
    }
    else {

      const updateUser = {
        userName: req.body.userName,
        contact: req.body.contact,
        adress: req.body.adress
      };
      User.updateOne({ _id: req.user._id }, { $set: updateUser }, (err, doc) => {
        if (err) {
          consile.log(err);
        }
        else { res.redirect('profile'); }
      });

    }

  });


/**
 * update Email 
 * check if email correct 
 * chek if email inexist pas 
 * check if password correct 
 */
router.post('/updateEmail', [

  check('email').not().isEmpty().withMessage('please enter your email'),
  check('email').isEmail().withMessage('please enter valid email'),
  check('password').not().isEmpty().withMessage('please enter your password'),
  check('password').isLength({ min: 5 }).withMessage('please enter your password more than 5 char')
]
  , (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      validationMessages = [];
      for (var i = 0; i < errors.errors.length; i++) {
        validationMessages.push(errors.errors[i].msg);
      }
      req.flash('updateEmail-error', validationMessages);
      res.redirect('profile');
      return;
    }
    else {
      User.findById({ _id: req.user._id }, (error, user) => {
        if (error) {
          return done(error);
        }
        if (user.email == req.body.email) {
          req.flash('updateEmail-error', ['this email already exist']);
          res.redirect('profile');
          return;
        }
        if (!user.comparePassword(req.body.password)) {
          req.flash('updateEmail-error', ['woring password']);
          res.redirect('profile');
          return;
        }

        User.updateOne({ _id: req.user._id }, { $set: { email: req.body.email } }, (err, doc) => {
          if (err) { console.log(err) }
          else {
            console.log(doc);
            req.logOut();
            res.redirect('signin');
            return;
          }
        })
        console.log(req.flash('updateEmail-error'))
        return;
      })
    }

  });

/**
 * update password 
 * check if password ancienne correct
 * check if confirm password and new password confortable 
 */
router.post('/updatePassword', [

  check('ancienPassword').not().isEmpty().withMessage('please enter your ancienne password'),
  check('ancienPassword').isLength({ min: 5 }).withMessage('please enter your password more than 5 char'),
  check('newPassword').not().isEmpty().withMessage('please enter your new password'),
  check('newPassword').isLength({ min: 5 }).withMessage('please enter your password more than 5 char'),
  check('ancienPassword').custom((value, { req }) => {
    if (value == req.body.newPassword) {
      throw new Error('new Password equals Ancien Password choose another');
    }
    return true;
  }),
  check('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('password and confirm-password not matched');
    }
    return true;
  })
],
  (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      validationMessages = [];
      for (var i = 0; i < errors.errors.length; i++) {
        validationMessages.push(errors.errors[i].msg);
      }
      req.flash('updatePassword-error', validationMessages);
      res.redirect('profile');
      return;
    }
    else {
      User.findById({ _id: req.user._id }, (error, user) => {
        if (error) {
          return console.log(error);
        }

        if (!user.comparePassword(req.body.ancienPassword)) {
          req.flash('updatePassword-error', ['woring password']);
          res.redirect('profile');
          return;
        }

        User.updateOne({ _id: req.user._id }, { $set: { password: new User().hachPassword(req.body.newPassword) } }, (err, doc) => {
          if (err) { console.log(err) }
          else {
            console.log(doc);
            req.logOut();
            res.redirect('signin');
            return;
          }
        })
        console.log(req.flash('updateEmail-error'))
        return;
      })
    }
  })


/**
 * router upload file 
 * ===>
 */
router.post('/uploadFile', (req, res, next) => {

  var path = "./public" + req.user.image;
  if (path === "./public"+'/upload/defaultAvatar.png') {
    User.updateOne({ _id: req.user._id }, { $set: { image: (req.file.path).slice(6) } }, (err, doc) => {
      if (err) { console.log(err) }
      else { res.redirect('profile'); }
    })
  }
  else {
    fs.unlink(path, (err) => {
      if (err) {
        req.flash('profileImageError', [err.message]);
        res.redirect('profile');
        return;
      }
      else {
        User.updateOne({ _id: req.user._id }, { $set: { image: (req.file.path).slice(6) } }, (err, doc) => {
          if (err) { console.log(err) }
          else { res.redirect('profile'); }
        })
      }
    })
  }


})

/**
 * sign in 
 * en passe comme parametre :
 *                            (messageError) => les erroe dans session de formulaire de sign in
 *                             (token) => token de serveur pour securiser la connection
 */
router.get('/signin', isNotSignin, function (req, res, next) {
  var messagesError = req.flash('signinError')
  // console.log(req.csrfToken());
  res.render('user/signin', { messages: messagesError, token: req.csrfToken() });
});



router.post('/signin', [
  check('email').not().isEmpty().withMessage('please enter your email'),
  check('email').isEmail().withMessage('please enter valid email'),
  check('password').not().isEmpty().withMessage('please enter your password'),
  check('password').isLength({ min: 5 }).withMessage('please enter your passwors more than 5 char'),
],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      validationMessages = [];
      for (var i = 0; i < errors.errors.length; i++) {
        validationMessages.push(errors.errors[i].msg);
      }
      req.flash('signinError', validationMessages);

      res.redirect('signin');
      return;
    }
    next();
  },
  passport.authenticate('local-signin', {

    successRedirect: 'profile',
    failureRedirect: 'signin',
    failureFlash: true
  }))


router.get('/logout', isSignin, (req, res, next) => {
  req.logOut();
  res.redirect('/');

})


function isSignin(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('signin');
    return;
  }
  next();
}
function isNotSignin(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  next();
}

module.exports = router;
