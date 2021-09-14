const kategori = require('../models/kategori');
const product = require('../models/product');

const tempProduct = [];

const getKeywordAndProduct = async (keyword)=>{
    let products;

    const tot = await productTotal(keyword)
    const cate = await kategori.find({'keyword': keyword})
    .populate('product', {keyword: 1, message: 1, _id: 1, uuid: 1, price: 1, currency: 1})

    cate.forEach(docs=>{
        products = docs.product
    })

    const tempProd = await product.find({'keyword': keyword})
    .select('uuid keyword message price currency kategori')
    
    tempProd.map(docs =>{
        tempProduct.unshift(docs)
    })

    console.log(tot)
    console.log(tempProduct)
    console.log(products)
    
    return tot
    // console.log(tempProduct)
    
    // console.log(tot)
}

const getKeywords = async (keyword) => {
    let prod = []; 
    //initialize product message
    const productMessage = await productReply(keyword)
    // initialize product Total
    // const Totalproduct = await productTotal(keyword)
    // find kategori based on keyword
    const reply = await kategori.find({"keyword":keyword })
    .populate('product', {keyword: 1, message: 1, _id: 1, uuid: 1, price: 1, currency: 1})

    // loop kategori for populate product
    reply.forEach(docs=>{
        prod = docs.product
    })
    

    if(reply.length > 0){
        if(prod.length > 0){
            return `${reply[0].message}\n ${prod[0].uuid}.${prod[0].keyword}\n ${prod[1].uuid}.${prod[1].keyword}`
        }
        return `Sorry product for ${keyword} is empty`   
    }else if(productMessage){
        return productMessage
        // if(keyword == replyProduct[0].keyword){
        //     return `${replyProduct[0].message} ${keyword}!!`
        // }else{
        //     return `Failed`
        // }
    }
        return 'Invalid Keyword'
    
}

const productReply = async (keyword) =>{
    // initialize product Total
    const Totalproduct = await productTotal(keyword)
    // find product based on keyword
    const replyProduct = await product.find({'keyword': keyword})
    .select('uuid keyword message price currency kategori')
    
    // Condition for keyword product 
        if(replyProduct.length > 0){
            if(keyword == replyProduct[0].keyword){
                return `${replyProduct[0].message}? Name: ${replyProduct[0].keyword}\nPrice: $${replyProduct[0].price}\nCurrency: ${replyProduct[0].currency}`
            }
            return `Keyword Not Found`
        }else if(tempProduct.length > 0){
            return Totalproduct
        }
    return `Product for this keyword ${keyword} not found`
}

const productTotal = async (keyword) => {

    // const productFind = await product.find({'keyword': keyword})
    // .select('uuid keyword message price currency kategori')
    if(tempProduct){
        if(isNaN(keyword)){
            return 'Keyword should be a number'
        }else{
            const total = tempProduct[0].price * keyword;
            return `Product yang anda beli sebanyak ${keyword}\n Detail Product:\n Product Name : ${tempProduct[0].keyword}\n Price : ${tempProduct[0].price}\n Currency: ${tempProduct[0].currency}\n Total: $${total} \n Apakah anda ingin melanjutkan transaksi?`
        }
    }
}

module.exports = {
    getKeywords,
    getKeywordAndProduct,
    productReply,
    productTotal
}