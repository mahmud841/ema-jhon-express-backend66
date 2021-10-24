const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kjooh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri); check connection uri environment 




async function run() {
  try {
    await client.connect();
    // console.log('database connected successfully');checking database connection
    const database = client.db('online_shop');
    const productCollection = database.collection('products');
    const orderCollection = database.collection('orders');

    //Get Product API 
    app.get('/products', async (req, res) => {
      // console.log(req.query);

      const cursor = productCollection.find({});
      const page = req.query.page;
      // const size = req.query.size; ata use korle error dibe 
      const size = parseInt(req.query.size);
      let products;
      const count = await cursor.count();
      if (page) {
        products = await cursor.skip(page * size).limit(size).toArray();
      }
      else {
        products = await cursor.toArray();
      }

      // const products = await cursor.limit(15).toArray(); 10 products dekhabe 
      // const products = await cursor.toArray();

      // res.send(products);
      res.send({
        count,
        products
      });

      // Use POST to get data by using key 
      app.post('/products/byKeys', async (req, res) => {
        // console.log(req.body);
        const keys = req.body;
        const query = { key: { $in: keys } }
        const products = await productCollection.find(query).toArray();
        res.json(products)
        // res.send('hitting post')

      });

      //Add orders API 
      app.post('/orders', async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        // console.log('order', order);
        // res.send('orderse processed ');
        res.json(result);

      })

    })


  }
  finally {
    // await client.close();
  }

}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Eam-jhon Server is Running');
});

app.listen(port, () => {
  console.log('Server running at port', port);

})