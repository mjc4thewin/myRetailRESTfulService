"use strict";
const Product = require('../../models/Product')
const errors = require('../errors')
const axios = require('axios')
const puppeteer = require('puppeteer')

module.exports = router => {

    /*
        GET all products
    */
    router.get('/products', async (req, res) => {
        //get all pricing info from mongo
        const mongo_products = await Product.find()
        var product_ids = mongo_products.map(p => p.product_id)

        if (!mongo_products) {
            res.status(404).json(errors.not_found).end()
            return;
        }

        //get all product info from redsky for those products
        const redsky = await axios
            .get(`${process.env.REDSKY_URL}/${product_ids.join(',')}?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics`)
            .catch((err) => {
                if (err.response.status == 404) {
                    res.status(404).json(errors.not_found)
                } else {
                    res.status(err.response.status).json({
                        error: true,
                        status: err.response.status,
                        message: err.response.statusText
                    })
                }     
            })

        //merge data and respond
        var combined_data = []
        redsky.data.forEach(tgt => {
            let item = tgt.product.item
            let priced_item = mongo_products.find(p => p.product_id === Number(item.tcin))
            
            let listing = {
                product_id: Number(item.tcin),
                name: item.product_description.title,
                current_price: priced_item.current_price
            }
            combined_data.push(listing)
        });

        res.send(combined_data)
    })

    /*
        GET by product_id
    */
    router.get('/products/:id', async (req, res) => {
        if (!req.params.id || isNaN(req.params.id)) {
            res.status(400).json(errors.bad_request).end()  
            return;
        }
          
        //get product pricing info from mongo
        const mongo_product = await Product.findOne({
            product_id: req.params.id
        })

        //get product detailed info from redsky
        const redsky = await axios
            .get(`${process.env.REDSKY_URL}/${req.params.id}?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics`)
            .catch((err) => {
                if (err.response.status == 404) {
                    res.status(404).json(errors.not_found)
                } else {
                    res.status(err.response.status).json({
                        error: true,
                        status: err.response.status,
                        message: err.response.statusText
                    })
                }     
            })

        //make sure we have the data
        if (!redsky.data.product.item || !mongo_product) {
            res.status(404).json(errors.not_found).end()
            return;
        }
        
        //merge data and respond
        var combined_data = {
            product_id: Number(redsky.data.product.item.tcin),
            name: redsky.data.product.item.product_description.title,
            current_price: mongo_product.current_price
        }
        
        res.send(combined_data)      
    })

    /*
        UPDATE product price in mongo
    */
    router.put('/products/:id', async (req, res) => {
        if (!req.params.id || isNaN(req.params.id) || !req.body.current_price || !Object(req.body.current_price)) {
            res.status(400).json(errors.bad_request).end()  
            return;
        }
            
        Product.findOneAndUpdate(
            {product_id: req.params.id},
            {$set: {current_price: req.body.current_price}},
            {new: true}
        ).then(data => {
            if (data ==  null) {
                res.status(404).json(errors.not_found)
            } else {
                res.send(data)
            }
        })
    })

    
    /*
        INSERT product in mongo
    */
    // router.post('/products', async (req, res) => {
    //     if (isNaN(req.body.product_id) || !Object(req.body.current_price) || !String(req.body.current_price.value) || !String(req.body.current_price.currency_code)) {
    //         res.status(400).json(errors.bad_request).end()
    //         return;
    //     }      

    //     var newProduct = new Product(req.body);
    //     newProduct.save((err, result) => {
    //         if (err)
    //             res.send(err);
    //         res.json(result);
    //     });
    // })

    /*
        Scrape movie data from Target.com
    */
    router.get('/scrape/movies', async (req, res) => {
        
        //expects a movie PDP like this https://www.target.com/p/shawshank-redemption-special-edition-dvd/-/A-11625643
        if (!req.query.page) {
            let error_msg = errors.bad_request
            error_msg.details = 'Specify a target PDP to scrape by appending a page parameter in the query string'
            res.status(400).json(error_msg).end()
        }   

        const entryPoint = req.query.page
        console.log('Scraper running...')

        const browser = await puppeteer.launch({
            headless: true,
            //slowMo: 100,
            //args: ['--start-fullscreen']
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto(entryPoint);
        
        await page.waitForSelector('.filmstripItem');

        const resultsSelector = '.filmstripItem > div > a';
        await page.waitForSelector(resultsSelector);

        // Extract results from page
        const allItems = await page.evaluate(resultsSelector => {
            const anchors = Array.from(document.querySelectorAll(resultsSelector));
            var pIDs = []
            return anchors.map(anchor => {
                const product_id = anchor.getAttribute('data-product-id').trim()
                const price = anchor.getAttribute('saleprice').toString()

                if (!pIDs.includes(product_id)) {
                    pIDs.push(product_id)
                    let data = {
                        current_price: {
                            value: price,
                            currency_code: "USD"
                        },
                        product_id: product_id
                    }
                    return data;
                }
            });
        }, resultsSelector);
        
        var uniqueProducts = allItems.filter(e => { return e != null })

        //save to database
        Product.insertMany(
            uniqueProducts,
            { ordered: false })
            .then(result => {
                if (result) {
                    console.error(`Scraper done`)
                    console.log(`Successfully inserted items`)
                }
                browser.close()
                return res.json({done: true})
            })
            .catch(err => {
                console.error(`Failed to insert: ${err}`)
                browser.close()
                return res.json({done: true})
            })  
    })
}