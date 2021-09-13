const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var products = new Schema({
    uuid: {type: String},
    keyword : {type : String},
    message : {type : String},
    kategori: {
        type: Schema.Types.ObjectId,
        ref: 'kategori',
    }
}, {collection: 'product'});

module.exports = mongoose.model('product', products);