myRetail is a rapidly growing company with HQ in Richmond, VA and over 200 stores across the east coast. myRetail wants to make its internal data available to any number of client devices, from myRetail.com to native mobile apps.

The goal for this exercise is to create an end-to-end Proof-of-Concept for a products API, which will aggregate product data from multiple sources and return it as JSON to the caller.

Your goal is to create a RESTful service that can retrieve product and price details by ID. The URL structure is up to you to define, but try to follow some sort of logical convention.

# Breaking it down

## Step 1: Think about the problem space and business needs (15 minutes)

- Observation: "myRetail has HQ and 200 stores on the east coast, but is growing fast" 
    - What is the rate of growth (how many new stores per month, traffic trends for .com/mobile)? 
    - Can I see past 8 quarters of revenue segmented by stores, .com, mobile, etc? 
    - Understand plans for expansion (both US and OUS)?  
    - Understand competitive landscape and how are competitors investing in apps/services/data/etc 
    - Understand challenges to business operations that could hinder growth 
    - Understand current growth initiatives 

- Observation: "myRetail wants to make its internal data available" 
    - Public API or restricted? 
    - Describe the nature of internal data to be made accessible 
    - Understand the data sources: Type of storage infrastructure, where is it located, how it is maintained and by whom, DB technologies used, optimized for performance, scalability and high availability? 
    - Privacy assessment? How is the data classified and what is the risk PII exposure/misuse? 
    - Understand security architecture and whether myRetail has any compliance requirements that could be compromised by internal data exposure 
    - Understand data management, flows, permissions model and how other systems interop today 
    - Rate of new products being added/updated? 
    - Is myRetail anticipating a need for language localization, dynamic pricing, etc? 
    - API consumption tracking/metering? 

- Observation: “any number of client devices" 
    - What are the common usage patterns among client apps? 
    - Field priority, what data is most important? 
    - Best options for optimizing payload, response times, etc?
    - Documentation, code samples, error handling, version management?
  

## Step 2: Before diving in, do some quick searching/reading to learn from others (30 min)

### REST or GraphQL? 

It's still early days for GraphQL. It has big benefits like: server driven, less chatty, more client friendly than traditional REST.  However, GQL is a bit immature.  I would encourage others to explore GraphQL and keep an eye on it, but don’t think it’s the right thing for myRetail as they look to scale. 

**Rationale:** 

- GQL design doesn’t encourage shared-nothing architecture 
- GQL has its own syntax that could make aggregation queries harder to model 
- Love the idea of single endpoint and dropping API versioning in the resource path, but it’s harder to establish backwards compatibility and leaves caching up to the developer to implement which is not ideal
- No great options for monitoring :(

### Look at other examples of the myRetail problem
- https://github.com/LBenotsch/myretail-restful-service
- https://libraries.io/github/lenzenc/myretail


## Step 3: Build a PoC (about 2 hours)

- Build an application that performs the following actions:

    - Responds to an HTTP GET request at /products/{id} and delivers product data as JSON (where {id} will be a number.
    - Example product IDs: 15117729, 16483589, 16696652, 16752456, 15643793)
    - Example response: {"id":13860428,"name":"The Big Lebowski (Blu-ray) (Widescreen)","current_price":{"value": 13.49,"currency_code":"USD"}}
    - Performs an HTTP GET to retrieve the product name from an external API. (For this exercise the data will come from redsky.target.com, but let's just pretend this is an internal resource hosted by myRetail) 
    - Example: <http://redsky.target.com/v2/pdp/tcin/13860428?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics>
    - Reads pricing information from a NoSQL data store and combines it with the product id and name from the HTTP request into a single response.
    - BONUS: Accepts an HTTP PUT request at the same path (/products/{id}), containing a JSON request body similar to the GET response, and updates the product's price in the data store.

## Step 4: Share and get feedback
- Prepare recommendations to make solution suitable for use in a production environment
