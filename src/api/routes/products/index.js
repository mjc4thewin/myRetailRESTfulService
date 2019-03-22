const Product = require('../../models/Product')
const errors = require('../errors')
const axios = require('axios')
const puppeteer = require('puppeteer')

module.exports = router => {
    
    //get all 
    router.get('/products', async (req, res) => {
        const products = await Product.find()
        res.send(products)
    })

    //get by product_id, pricing info from mongo & product info from redsky 
    //combine price info with product info
    router.get('/products/:id', async (req, res) => {
        if (!req.params.id || !Number(req.params.id))
            res.status(400).json(errors.bad_request)     
        
        const mongo_product = await Product.findOne({
            product_id: req.params.id
        })

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

        if (!redsky.data.product.item || !mongo_product)
            res.status(404).json(errors.not_found)
              
        //const combined_data = {...mongo_product, ...redsky.data.product.item }
        var combined_data = {
            id: redsky.data.product.item.tcin,
            name: redsky.data.product.item.product_description.title,
            current_price: mongo_product.current_price
        }

        res.send(combined_data)      
    })

    //Update product price in mongo
    router.put('/products/:id', async (req, res) => {
        if (!req.params.id || !Number(req.params.id) || !req.body.current_price || !Object(req.body.current_price))
            res.status(400).json(errors.bad_request)     
        
        Product.findOneAndUpdate(
            {product_id: req.params.id},
            {$set: {current_price: req.body.current_price}},
            {new: true},
            (err, data) => {
                if (!data) 
                    res.status(404).json(errors.not_found) 
                if (err)
                    res.send(err)
                
                res.json(data)
            }
        );  
    })

    
    //Add product to mongo
    // router.post('/products', async (req, res) => {
    //     if (!Number(req.body.product_id) || !Object(req.body.current_price) || !String(req.body.current_price.value) || !String(req.body.current_price.currency_code))
    //         res.status(400).json(errors.bad_request)  

    //     var newProduct = new Product(req.body);
    //     newProduct.save((err, result) => {
    //         if (err)
    //             res.send(err);
    //         res.json(result);
    //     });
    // })


    //Scrape movie data from Target
    router.get('/scrape/movies', async (req, res) => {

        if (!req.query.page) 
            res.send('Please specify a target PDP to scrape by appending a "page" parameter in the query string')
            res.end();

        const entryPoint = req.query.page

        const browser = await puppeteer.launch({
            headless: true,
            //slowMo: 100,
            //args: ['--start-fullscreen']
        });

        const page = await browser.newPage();
        await page.goto(entryPoint);
        
        await page.waitForSelector('.filmstripItem');

        const resultsSelector = '.filmstripItem > div > a';
        await page.waitForSelector(resultsSelector);

        // Extract results from the page.
        const allItems = await page.evaluate(resultsSelector => {
            const anchors = Array.from(document.querySelectorAll(resultsSelector));
            return anchors.map(anchor => {
                const product_id = anchor.getAttribute('data-product-id').trim()
                const price = anchor.getAttribute('saleprice').toString()
                let data = {
                    current_price: {
                        value: price,
                        currency_code: "USD"
                    },
                    product_id: product_id
                }
                return data;
            });
        }, resultsSelector);

        //save to database
        await allItems.forEach(product => {
            let newProduct = new Product(product);
    
            try {
                newProduct.save((err, result) => {
                    if (err && err.code == 11000) {
                        console.log(`${product.product_id} already exists`);
                    } else if (err) {
                        console.log(err);
                    } else {
                        console.log(`${product.product_id} saved!`);
                    }
                })
            } catch(err) {
                console.log(err);
            }
            
        })

        res.send('scraping complete!');

        await browser.close();
    })

}