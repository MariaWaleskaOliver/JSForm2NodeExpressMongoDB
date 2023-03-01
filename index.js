const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const {check, validationResult} = require('express-validator')

mongoose.connect('mongodb://localhost:27017/finalmariaoliveira' , {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

let Product = mongoose.model('Product', {
    name: String,
    id: Number,
    prod1: Number,
    prod2: Number,
    prod3: Number,
    subTotal: Number,
    tax: Number,
    total: String
})

let myApp = express()
myApp.set('views', path.join(__dirname, 'views'))
myApp.set('view engine', 'ejs')
myApp.use(bodyParser.urlencoded({extended: false}))
myApp.use(express.static(__dirname + '/public'))

myApp.get("/", (req, res) => {
    res.render("form")
})

var StudantRegex = /^\d{7}$/;

function checkRegex(userInput, regex){
    if(regex.test(userInput)){
        return true;
    }
    else{
        return false;
    }
}
function IdValidation(value){
    if(!checkRegex(value, StudantRegex)){
        throw new Error('Id must be 7 numbers');
    }
    return true;
}

myApp.post("/",
[
    check('name', 'Name cannot be empty').not().isEmpty(),
    check('id').custom(IdValidation)
]
,(req, res)=> {
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
        res.render('form', {
            errors: errors.array()
        })
    }
    else{
        let name = req.body.name
        let id = req.body.id
        let prod1 = req.body.prod1
        let prod2 = req.body.prod2
        let prod3 = req.body.prod3
        let subTotal = (prod1*62.99) + (prod2*51.99)+(prod3*2.99 );
        let tax = subTotal * 0.13
        tax = Math.round (tax)
        let total = subTotal + tax;
        total = total.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
        let order = {
            name: name,
            id:id,
            prod1: prod1,
            prod2: prod2,
            prod3 :prod3,
            subTotal:subTotal,
            tax:tax,
            total: total
        }

        let product = new Product(order)
        product.save().then(()=> {
            res.render("form", order)
        })
    }
})

myApp.get("/allorders", (req, res) => {
    Product.find({}).exec((err, prods) => {
        if(prods) {
            res.render('allorders', {
                products: prods
            })
        }
        else{
            res.render('allorders', {
                products: []
            })
        }
    })
})


myApp.listen(8080, () => {
    console.log("running")
})