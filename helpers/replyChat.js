const kategori = require('../models/kategori');
const product = require('../models/product');

const getKeywordAndProduct = async (keyword)=>{
    let products;
    let replyProduct;
    const cate = await kategori.find({'keyword': keyword})
    .populate('product', {keyword: 1, message: 1, _id: 1, uuid: 1})

    cate.forEach(docs=>{
        products = docs.product
    })

    const reply = await product.find({'keyword': keyword})
    .select('uuid keyword message')

    // let keyIndex = reply[0].uuid
    console.log(products)
    console.log(reply)

}

const getKeywords = async (keyword) => {
    let prod = []; 
    // let keyIndex1;
    // let keyIndex2;
    const reply = await kategori.find({"keyword":keyword })
    .populate('product', {keyword: 1, message: 1, _id: 1, uuid: 1})

    reply.forEach(docs=>{
        prod = docs.product
    })

    const replyProduct = await product.find({'keyword': keyword})
    .select('uuid keyword message')

    // const replyProduct = await product.find({"keyword": keyword})
    // keyIndex1 = prod.findIndex(x=> x.keyword === prod[0].keyword).toString();
    // keyIndex2 = prod.findIndex(x=> x.keyword === prod[1].keyword).toString();

    if(reply.length > 0){
            if(prod.length > 0){
                return `${reply[0].message}\n ${prod[0].uuid}.${prod[0].keyword}\n ${prod[1].uuid}.${prod[1].keyword}`
            }
            return `Sorry product for ${keyword} is empty`   
    }else if(replyProduct.length > 0){
        if(keyword == replyProduct[0].keyword){
            return `${replyProduct[0].message} ${keyword}!!`
        }else{
            return `Failed`
        }
    }
        return 'Invalid Keyword'
    
}

module.exports = {
    getKeywords,
    getKeywordAndProduct
}