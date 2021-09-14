const { Client } = require('whatsapp-web.js');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});
const qrcode = require('qrcode');
const fs = require('fs');

const kategori = require('./models/kategori');
const product = require('./models/product');

const chatReply = require('./helpers/replyChat');

// Mongoose Connection

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var mongoString = "mongodb+srv://EnkripsiAES128:enkripsiAES128@cluster0.3yt2b.gcp.mongodb.net/chatbot-whatsApp-V1?retryWrites=true&w=majority"

mongoose.connect(mongoString, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
})

mongoose.connection.on("error", function(error) {
  console.log(error)
});

mongoose.connection.on("open", function() {
  console.log("Connected to MongoDB database.")
});



const SESSION_FILE_PATH = './chatbot-whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/', async (req, res)=>{
    res.render('index', {
        title: 'Chatbot-WhatsApp-API',
        root: __dirname
    })
})

app.get('/kategori', async (req, res)=>{
    const thisKategori = await chatReply.getKategori()
    res.send(thisKategori)
})

app.get('/keyword', async (req, res)=>{
    const thisKeyword = await chatReply.getKeywordAndProduct()
    res.send(thisKeyword)
})
// add kategori
app.get('/add-kategori', (req, res)=>{
    res.render('add-kategori')
})
app.post('/add-kategori', (req, res)=>{

    const category = new kategori({
		_id: new mongoose.Types.ObjectId(),
		keyword: req.body.keyword,
        message: req.body.message
		
    });
    category
	.save()
	.then(result => {
		console.log(result);
		res.status(201).json({
		message: 'Created Kategori successfully',
		createdKategori: {
			keyword: result.keyword,
            message: result.message,
			_id: result._id,
			reqeust: {
				type: 'POST',
			}
		}
	});
	}).catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
})

// add product
app.get('/add-product', (req, res)=>{
    res.render('add-product')
})
app.post('/add-product', async (req, res)=>{

      // Create a new message
      const newProduct = new product(req.body)
      // get userId
      const category = await kategori.findById({_id: req.body.id})
      // assign a message as a dari
      newProduct.kategori = category;
      // save a message
      await newProduct
	    .save()
	    .then(result => {
		console.log(result);
		res.status(201).json({
		message: 'Created Product successfully',
		createdProduct: {
			keyword: result.keyword,
            message: result.message,
            price: result.price,
            currency: result.currency,
			_id: result._id,
			reqeust: {
				type: 'POST',
			}
		}
	});
	}).catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});

      // add Message to the user messages array
      category.product.push(newProduct)
      
      await category.save()
})

const client = new Client({
    restartOnAuthFail: true, 
    puppeteer: { 
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
        ],
    }, session: sessionCfg });


client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});


client.on('message', async msg => {
    const keyword = msg.body;
    const replyKategori = await chatReply.getKeywords(keyword);
    const replyIndex = await chatReply.getKeywordAndProduct(keyword);
    const replyProduct = await chatReply.productReply(keyword);
    const totalPrice = await chatReply.productTotal(keyword);
    switch (keyword) {
        case replyKategori !== false:
            msg.reply(replyKategori);
            break;
        case replyProduct !== false:
            msg.reply(replyProduct)
            break;
        case totalPrice !== false:
            msg.reply(totalPrice)
            break;
        default:
            msg.reply(replyKategori)
            break;
    }
    // if(replymsg !== false){
    //     msg.reply(replymsg);
    //     if(keyword == 0){
    //         msg.reply('0')
    //     }else if(keyword == 1){
    //         msg.reply('1')
    //     }
    // }else{
    //     msg.reply(replymsg)
    // }
    

    // const key = msg.body;
    // switch (key) {
    //     case "0":
    //     msg.reply('pong');
    //         break;
    //     case "1":
    //         msg.reply('ping');
    //         break;
    //     case '!chat':
    //         msg.reply('User Bot')
    //         break;
    //     default:
    //         msg.reply('error')
    //         break;
    // }
});

client.initialize();


// Socket IO
io.on('connection', (socket)=>{
    socket.emit('message', 'Connecting...');

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url)=>{
            socket.emit('qr', url);
            socket.emit('message', 'QR Code recived scan now!')
        });
    });
    client.on('ready', () => {
        socket.emit('ready', 'WhatsApp QR Ready')
        socket.emit('message', 'WhatsApp QR Ready')
    });

    client.on('authenticated', (session) => {
        socket.emit('authenticated', 'WhatsApp QR authenticated')
        socket.emit('message', 'WhatsApp QR authenticated')
        console.log('AUTHENTICATED', session);
        sessionCfg=session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
            if (err) {
                console.error(err);
            }
        });
    });
})


server.listen(3006, ()=>{
    console.log('Server Running...')
})