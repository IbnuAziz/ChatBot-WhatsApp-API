const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var waApi = new Schema({
    keyword : {type : String},
    message : {type : String,},
    product: [{
        type: Schema.Types.ObjectId,
        ref: 'product'
    }]
}, {collection: 'kategori'});

module.exports = mongoose.model('kategori', waApi);