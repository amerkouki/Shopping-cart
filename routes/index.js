var express = require('express');
var router = express.Router();

var produit = require('../models/Produits');
var Cart = require('../models/Cart');
var Order = require('../models/Order');

const stripe = require('stripe')('sk_test_51IQHveIhmAFyeETaPXs7kI40vbD48CIFO3oMK2hiZgh330ZIMcbUgAvd2g2dxKghdSoo6aZ100rS73gZgeFlG6uz00S9VkFjyh');

/* GET home page. */
router.get('/', function (req, res, next) {

  const successMessageCharge = req.flash('success');
  var totalProduit = null;
  if (req.isAuthenticated()) {
    if (req.user.cart) {
      totalProduit = req.user.cart.totalQuantity;
    }
    else {
      totalProduit = 0
    }
  }
  produit.find({}).lean()
    // execute query
    .exec((error, doc) => {
      if (error) {
        console.log(error);
      }
      else {

        var produitGrid = [];
        var colGrid = 3;

        for (var i = 0; i < doc.length; i += colGrid) {
          produitGrid.push(doc.slice(i, i + colGrid));
        }

        res.render('index', {
          title: 'Shopping Cart',
          produits: produitGrid,
          checkuser: req.isAuthenticated(),
          totalProduit: totalProduit,
          successMessageCharge: successMessageCharge
        });
      }
    });
});



/***
 ** router ajouter produit au shema cart 
 ** parametre id , prix , name
 ***/
router.get('/addToCart/:id/:prix/:name', (req, res, next) => {


  req.session.hasCart = true;
  const cartID = req.user._id;
  const newProduitPrix = parseInt(req.params.prix, 10);

  const newProduit = {
    _id: req.params.id,
    prix: newProduitPrix,
    name: req.params.name,
    quantity: 1
  }
  Cart.findById(cartID, (err, cart) => {
    if (err) {
      console.log(err)
    }
    if (!cart) {
      const newcart = new Cart({
        _id: cartID,
        totalQuantity: 1,
        totalPrix: newProduitPrix,
        selectedProduit: [newProduit],
        createAt: Date.now()
      })

      newcart.save((error, doc) => {
        if (error) {
          console.log(error);
        }
        console.log(doc);
      })
    }
    if (cart) {
      var indexProduit = -1;

      for (var i = 0; i < cart.selectedProduit.length; i++) {
        if (req.params.id === cart.selectedProduit[i]._id) {
          indexProduit = i;
          break
        }
      }

      if (indexProduit >= 0) {
        cart.selectedProduit[indexProduit].quantity = cart.selectedProduit[indexProduit].quantity + 1;
        cart.selectedProduit[indexProduit].prix = cart.selectedProduit[indexProduit].prix + newProduitPrix;
        cart.totalQuantity = cart.totalQuantity + 1;
        cart.totalPrix = cart.totalPrix + newProduitPrix;
        cart.createAt = Date.now();


        Cart.updateOne({ _id: cartID }, { $set: cart }, (error, doc) => {
          if (error) {
            console.log(error);
          }
          console.log(doc);
        })

      }
      else {
        cart.totalQuantity = cart.totalQuantity + 1;
        cart.totalPrix = cart.totalPrix + newProduitPrix;
        cart.selectedProduit.push(newProduit);
        cart.createAt = Date.now();

        Cart.updateOne({ _id: cartID }, { $set: cart }, (error, doc) => {
          if (error) {
            console.log(error);
          }
          console.log(doc);
        })
      }
    }
  });
  res.redirect('/');
})




/**
 * router /shopping-cart 
 * afficher tableau des produit choisie 
 * ajout/modif / supp produit de cart 
 * **test si sign in / test si cart exist 
 * **charger cart de session et envoyer à hbs shoppingCart
 * ***valider l'achar
 */
router.get('/shopping-cart', (req, res, next) => {
  var totalProduit = null;
  if (!req.isAuthenticated()) {
    res.redirect('/users/signin');
    return;
  }
  else {
    if (req.user.cart) {
      totalProduit = req.user.cart.totalQuantity;
    }
    else {
      totalProduit = 0
    }
  }
  if (!req.user.cart) {
    res.render('shoppingCart', { checkuser: true, hasCart: req.session.hasCart, totalProduit: totalProduit });
    req.session.hasCart=false;
    return;
  }
  var userCart = req.user.cart;
  console.log(userCart.selectedProduit);

  res.render('shoppingCart', { checkuser: true, userCart: userCart, totalProduit: totalProduit });
})


/**
 * incremente produit 
 * modifier car dans la session puis update dons mongo db
 */
router.get('/inceaseProduct/:index', (req, res, next) => {
  if (req.user.cart) {
    const index = req.params.index;
    const userCart = req.user.cart;
    const productPrix = userCart.selectedProduit[index].prix / userCart.selectedProduit[index].quantity;

    userCart.selectedProduit[index].quantity = userCart.selectedProduit[index].quantity + 1;
    userCart.selectedProduit[index].prix = userCart.selectedProduit[index].prix + productPrix;
    userCart.totalQuantity = userCart.totalQuantity + 1;
    userCart.totalPrix = userCart.totalPrix + productPrix;
    userCart.createAt = Date.now();

    Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (err, cart) => {
      if (err) {
        console.log(err);
      }
      res.redirect('/shopping-cart');
    })
  }
  else {
    res.redirect('/shopping-cart');
  }
})


/**
 * décremente produit 
 * modifier cart dans la session puis update dons mongo db
 */

router.get('/decreaseProduct/:index', (req, res, next) => {
  if (req.user.cart) {
    const index = req.params.index;
    const userCart = req.user.cart;
    const productPrix = userCart.selectedProduit[index].prix / userCart.selectedProduit[index].quantity;

    userCart.selectedProduit[index].quantity = userCart.selectedProduit[index].quantity - 1;
    userCart.selectedProduit[index].prix = userCart.selectedProduit[index].prix - productPrix;
    userCart.totalQuantity = userCart.totalQuantity - 1;
    userCart.totalPrix = userCart.totalPrix - productPrix;
    userCart.createAt = Date.now();

    Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (err, cart) => {
      if (err) {
        console.log(err);
      }
      res.redirect('/shopping-cart');
    })
  } else { res.redirect('/shopping-cart'); }
})

/**
 * supprimer produit 
 * supprimer produit de  table cart <selectedProduit> dans la session puis update dons mongo db
 * ** si un seul produit dans cart en supprime cart completement dans mongooDB
 */

router.get('/deleteProduct/:index', (req, res, next) => {
  if (req.user.cart) {
    const index = req.params.index;
    var userCart = req.user.cart;
    if (userCart.selectedProduit.length <= 1) {
      Cart.deleteOne({ _id: userCart._id }, (err, doc) => {
        if (err) {
          console.log(err);
        }
        res.redirect('/shopping-cart');

      })
    }
    else {
      userCart.totalPrix = userCart.totalPrix - userCart.selectedProduit[index].prix;
      userCart.totalQuantity = userCart.totalQuantity - userCart.selectedProduit[index].quantity;

      userCart.selectedProduit.splice(index, 1);
      userCart.createAt = Date.now();
      Cart.updateOne({ _id: userCart._id }, { $set: userCart }, (err, cart) => {
        if (err) {
          console.log(err);
        }
        res.redirect('/shopping-cart');
      })
    }
  } else { res.redirect('/shopping-cart'); }
})



router.get('/checkout', (req, res, next) => {
  if (req.user.cart) {
    const errorMessageCharge = req.flash('error')[0];
    if(req.user.userName === undefined || req.user.adress === undefined || req.user.contact === undefined ){
      req.flash('profile-error', ['please update your information befor do order ']);
      res.redirect('/users/profile');
      return ;
    }
    res.render('checkout', {
      checkuser: true,
      totalProduit: req.user.cart.totalQuantity,
      totalPrice: req.user.cart.totalPrix,
      errorMessageCharge: errorMessageCharge,
      user : req.user
    })
  } else {
    res.redirect('/shopping-cart');
  }

});

router.post('/checkout', (req, res, next) => {

  stripe.charges.create({
    amount: req.user.cart.totalPrix * 100,
    currency: 'usd',
    source: req.body.stripeToken,
    description: 'charge test test'
  },
    function (err, charge) {
      if (err) {
        console.log(err);
        req.flash('erore', err.raw.message);
        res.redirect('/checkout');
      }
      console.log(req.body);

      const order = new Order({
        user: req.user._id,
        cart: req.user.cart,
        address: req.body.address,
        name: req.body.name,
        contact :req.body.contact,
        paymentId: charge.id,
        orderPrice: req.user.cart.totalPrix
      })

      order.save((err, result) => {
        if (err) {
          console.log(err);
        }
        console.log(result);
        req.flash('success', 'successfuly bought product');
        Cart.deleteOne({ _id: req.user.cart._id }, (err, doc) => {
          if (err) {
            console.log(err);

          }
          res.redirect('/');
        })

      })
    });
});

module.exports = router;
