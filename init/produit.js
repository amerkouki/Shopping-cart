const Produits = require('../models/Produits');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/Shopping_cart', {useUnifiedTopology:true, useNewUrlParser: true }, (error) => {
    if (error) {
        console.log(error)
    }
    else {
        console.log('connected db');
    }
});
const produits = [
    new Produits({
        imagePath: '/images/mobile1.jpeg',
        produitName: 'Hawawi Y9',
        information: {
            storegeCapacity: 64,
            numberOfSIM: 'Dual SiM',
            cameraResolution: 16,
            displySize: 6.5
        },
        prix: 220
    }),
    new Produits({
        imagePath: '/images/mobile2.jpeg',
        produitName: 'HIC Diser ',
        information: {
            storegeCapacity: 16,
            numberOfSIM: 'Dual SiM',
            cameraResolution: 13,
            displySize: 6.2
        },
        prix: 220
    }),
    new Produits({
        imagePath: '/images/mobile3.jpeg',
        produitName: 'Apple IPhone X ',
        information: {
            storegeCapacity: 64,
            numberOfSIM: 'Dual SiM',
            cameraResolution: 12,
            displySize: 5.5
        },
        prix: 220
    }),
    new Produits({
        imagePath: '/images/mobile4.jpeg',
        produitName: 'OPPO 135',
        information: {
            storegeCapacity: 64,
            numberOfSIM: 'Dual SiM',
            cameraResolution: 20,
            displySize: 5.5
        },
        prix: 220
    }),
    new Produits({
        imagePath: '/images/mobile5.jpeg',
        produitName: 'Gallaxy note 9',
        information: {
            storegeCapacity: 128,
            numberOfSIM: 'Dual SiM',
            cameraResolution: 16,
            displySize: 6.4
        },
        prix: 220
    }),
    new Produits({
        imagePath: '/images/mobile6.jpeg',
        produitName: 'Hawawi Y9',
        information: {
            storegeCapacity: 64,
            numberOfSIM: 'Dual SiM',
            cameraResolution: 16,
            displySize: 6.5
        },
        prix: 220
    })
];


var index = 0;
for (var i = 0; i < produits.length; i++) {
    produits[i].save((error, doc) => {
        if (error) {
            console.log(error);
        }
        console.log(doc);
        index++;
        if (index === produits.length) {
            mongoose.disconnect();
        }
    });
}

